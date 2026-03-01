const cluster = require('cluster')
const fs = require('fs')
const os = require('os')
const path = require('path')
const default_cache_filename = require('./default_cache_filename')
const max_workers = os.cpus().length - 1
const debug_key = process.env.KEY || 'FZBvlPrOxtgaKBBkry3SH0W1IqH4Y5tu'
const uniswap_v2_factory = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'

const load = (params = {}) => {
    var {
        key = debug_key,
        factory = uniswap_v2_factory,
        filename,
        multicall_size = 50,
        from = 0,
        to,
        progress,
        workers = max_workers,
        pairs,
    } = params
    filename ??= default_cache_filename(factory)

    pairs ??= fs.existsSync(filename)
        ? fs.readFileSync(filename).toString().trim().split('\n')
            .reduce((pairs, line) => {
                line = line.split(',')
                if (line[0] == '') return pairs
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

    if (to && pairs.length > to) return Promise.resolve(pairs.slice(0, to))

    return (to
        ? Promise.resolve(to)
        : fetch('https://eth-mainnet.g.alchemy.com/v2/' + key, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{ to: factory, data: '0x574f2ba3' }, 'latest']
            })
        }).then(_ => _.json()).then(_ => Number(_.result))
    ).then(all_pairs_length => {
        const start_loading_from = pairs.length
            ? Math.max(from || 0, pairs[pairs.length - 1].id + 1)
            : 0

        var next_pair_order = pairs.length
            ? pairs[pairs.length - 1].id + 1
            : 0
        var progress_i = 0
        const progress_end = all_pairs_length - start_loading_from
        
        const onpair = pair => {
            pairs[pair.id] = pair
            if (progress) progress(++progress_i, progress_end)
            if (filename) {
                var _
                while (_ = pairs[next_pair_order]) {
                    fs.appendFileSync(filename, `${_.id},${_.pair},${_.token0},${_.token1}\n`)
                    next_pair_order++
                }
            }
        }

        if (!workers) {
            const ids = []
            for (var i = start_loading_from; i < all_pairs_length; i++)
                ids.push(i)
            return require('./loader')({ ids, factory, key, multicall_size }, onpair)
        
        }

        const missed = []
        for (var i = start_loading_from, ids; i < all_pairs_length; i++) {
            if (!ids || ids.length % multicall_size == 0) {
                ids = []
                missed.push(ids)
            }
            ids.push(i)
        }
        
        cluster.setupPrimary({ exec: path.join(__dirname, 'loader.js') })
        
        return Promise.all(
            missed
            .filter(_ => _.length)
            .map((ids, i) => new Promise(y => {
                const w = cluster.fork()
                w.send({ ids, factory, key, multicall_size })
                w.on('message', onpair)
                w.on('exit', y)
            }))
        ).then(() => pairs)
    })
}

module.exports.load = (params = {}) =>
    load(params)

module.exports.subscribe = (callback, params = {}) => {
    params.update_timeout ??= 5000
    var subscribed = true, timeout
    load(params)
    .then(pairs => {
        callback(pairs)

        const update = pairs =>
            timeout = setTimeout(
                () =>
                    load({...params, pairs, from: pairs.length})
                    .then(pairs => {
                        if (!subscribed) return
                        callback(pairs)
                        if (!subscribed) return
                        if (params.to && pairs[pairs.length - 1].id >= params.to) return
                        update(pairs)
                    }),
                params.update_timeout
            )

        if (!subscribed) return
        if (params.to && pairs[pairs.length - 1].id >= params.to) return
        update(pairs)
    })

    return () => {
        subscribed = false
        if (timeout) clearTimeout(timeout)
    }
}
