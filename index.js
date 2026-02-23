const cluster = require('cluster')
const fs = require('fs')
const os = require('os')
const { parseAbiItem, createPublicClient, http } = require('viem')
const { mainnet } = require('viem/chains')
const default_filename = require('./default_cache_filename')
const workers = os.cpus().length - 1
const missed = Array(workers).fill(null).map(() => [])
const key = process.env.KEY || 'FZBvlPrOxtgaKBBkry3SH0W1IqH4Y5tu'
const factory = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const client = createPublicClient({
    chain: mainnet,
    transport: http('https://eth-mainnet.g.alchemy.com/v2/' + key)
})

const load = params => {
    const {filename = default_filename, to, from = 0, chunk_size = 50, progress, count} = params
    const pairs = params.pairs || fs.existsSync(filename)
        ? fs.readFileSync(filename).toString().trim().split('\n')
            .reduce((pairs, line) => {
                line = line.split(',')
                const id = +line[0]
                if (id >= from && (to == undefined || id <= to)) pairs.push({
                    id,
                    pair: line[1],
                    token0: line[2],
                    token1: line[3]
                })
                return pairs
            }, [])
        : []

    if (count) return pairs.length
    if (to && pairs.length > to) return Promise.resolve(pairs.slice(0, to))

    return (to
        ? Promise.resolve(to)
        : client.readContract({
            address: factory,
            abi: [parseAbiItem('function allPairsLength() view returns (uint256)')],
            functionName: 'allPairsLength'
        }).then(_ => Number(_))
    ).then(all_pairs_length => {
        const start_loading_from = pairs.length
            ? Math.max(from || 0, pairs[pairs.length - 1].id + 1)
            : 0

        var next_pair_order = pairs.length
            ? pairs[pairs.length - 1].id + 1
            : 0

        missed.forEach(_ => _.length = 0)
        
        for (var i = start_loading_from, rr = 0; i < all_pairs_length; i++) {
            missed[rr].push(i)
            if (missed[rr].length % chunk_size == 0)
                rr = (rr + 1) % workers
        }
        
        var progress_i = 0
        const progress_end = all_pairs_length - start_loading_from
        
        cluster.setupPrimary({ exec: __dirname + '/loader.js' })
        return Promise.all(
            missed
            .filter(_ => _.length)
            .map((missed, i) => new Promise(y => {
                const w = cluster.fork()
                w.send({ missed, factory, chunk_size, key })
                w.on('message', p => {
                    const id = p[0]
                    pairs[id] = { id, pair: p[1], token0: p[2], token1: p[3] }
                    if (progress) progress(++progress_i, progress_end)
                    if (filename) {
                        var _
                        while (_ = pairs[next_pair_order]) {
                            fs.appendFileSync(filename, `${_.id},${_.pair},${_.token0},${_.token1}\n`)
                            next_pair_order++
                        }
                    }
                })
                w.on('exit', y)
            }))
        ).then(() => pairs)
    })
}


module.exports.clear_cache = () =>
    fs.unlinkSync(default_filename)

module.exports.all = (params = {}) =>
    load(params)
    
module.exports.count = () =>
    load({count: true})

module.exports.onupdate = function onupdate(callback, params = {}) {
    var subscribe = true, timeout
    load(params)
    .then(pairs => {
        callback(pairs)

        const update = pairs =>
            timeout = setTimeout(
                () =>
                    load({...params, pairs, from: pairs.length})
                    .then(pairs => {
                        if (!subscribe) return
                        callback(pairs)
                        if (!subscribe) return
                        if (params.to && pairs[pairs.length - 1].id >= params.to) return
                        update(pairs)
                    }),
                params.update_timeout || 5000
            )

        if (!subscribe) return
        if (params.to && pairs[pairs.length - 1].id >= params.to) return
        update(pairs)
    })

    return () => {
        subscribe = false
        if (timeout) clearTimeout(timeout)
    }
}