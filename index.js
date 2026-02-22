const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const env = process.env
const home = os.homedir()
const pkg = require('./package.json')
const default_filename = path.join(
  ...(process.platform === 'win32'
      ? (env.LOCALAPPDATA || env.APPDATA)
        ? [env.LOCALAPPDATA || env.APPDATA]
        : [home, 'AppData', 'Local']
      : process.platform === 'darwin'
        ? [home, 'Library', 'Caches']
        : (env.XDG_CACHE_HOME && path.isAbsolute(env.XDG_CACHE_HOME))
          ? [env.XDG_CACHE_HOME]
          : [home, '.cache']
  ),
  pkg.name + '_pairs.csv'
)
const { parseAbiItem, createPublicClient, http } = require('viem')
const { mainnet } = require('viem/chains')

const workers = os.cpus().length - 1
const missed = Array(workers).fill(null).map(() => [])
const key = process.env.KEY || 'FZBvlPrOxtgaKBBkry3SH0W1IqH4Y5tu'
const factory = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const client = createPublicClient({
    chain: mainnet,
    transport: http('https://eth-mainnet.g.alchemy.com/v2/' + key)
})

const load = params => {
    const {filename = default_filename, to, from = 0, chunk_size = 50} = params
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

    if (pairs.length > to) return Promise.resolve(pairs.slice(0, to))

    return (to
        ? Promise.resolve(to)
        : client.readContract({
            address: factory,
            abi: [parseAbiItem('function allPairsLength() view returns (uint256)')],
            functionName: 'allPairsLength'
        }).then(_ => Number(_))
    ).then(allPairsLength => {
        var next_pair_order = 0    
        const start_loading_from = pairs.length
            ? Math.max(from || 0, pairs[pairs.length - 1].id + 1)
            : 0

        missed.forEach(_ => _.length = 0)
        
        for (var i = start_loading_from, rr = 0; i < allPairsLength; i++) {
            missed[rr].push(i)
            if (missed[rr].length % chunk_size == 0)
                rr = (rr + 1) % workers
        }
        
        const jobs_data_filename = `jobs_data_${Date.now()}.json`
        fs.writeFileSync(jobs_data_filename, JSON.stringify({
            missed,
            factory,
            chunk_size,
            key
        }), 'utf8')
        
        return Promise.all(
            missed
            .filter(_ => _.length)
            .map((_, i) => new Promise(y => {
                const loader = spawn('node', ['loader.js', jobs_data_filename, i.toString()])
                loader.stdout.on('data', data => {
                    data += data.toString()
                    if (!data.includes('\n')) return
                    const lines = data.split('\n')
                    data = lines.shift()
                    lines.forEach(line => {
                        const a = line.split(',')
                        const id = +a[0]
                        pairs[id] = {
                            id,
                            pair: a[1],
                            token0: a[2],
                            token1: a[3]
                        }
                    })
                    if (filename) {
                        var pair
                        while (pair = pairs[next_pair_order]) {
                            fs.appendFileSync(filename, pair.id + ',' + pair.pair + ',' + pair.token0 + ',' + pair.token1 + '\n')
                            next_pair_order++
                        }
                    }
                })
                loader.on('close', y)
            }))
        )
        .then(() => {
            fs.unlinkSync(jobs_data_filename)
            return pairs
        })
    })
}


module.exports.all = (params = {}) =>
    load(params)

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