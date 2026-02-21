const { parseAbiItem, createPublicClient, http } = require('viem')
const { mainnet } = require('viem/chains')
const fs = require('fs')

const POOL = {
    ID: 0,
    ADDRESS: 1,
    TOKEN0: 2,
    TOKEN1: 3
}

async function load(params) {
    const {client, missed, filename, factory, key, chunk_size} = params
    let loaded = 0
    const retry_missed = []

    for (let ic = 0; ic < missed.length; ic += chunk_size) {
        const chunk = missed.slice(ic, ic + chunk_size)
        
        try {
            const pool_addresses = await client.multicall({
                contracts: chunk.map(i => ({
                    address: factory,
                    abi: [parseAbiItem('function allPairs(uint256) view returns (address)')],
                    functionName: 'allPairs',
                    args: [BigInt(i)]
                }))
            })

            const pools_ok = []
            const token_calls = []

            pool_addresses.forEach((result, i) => {
                const id = chunk[i]
                if (result.status == 'success') {
                    const pool_address = result.result
                    pools_ok.push({
                        id,
                        address: pool_address
                    })                    
                    token_calls.push({
                        address: pool_address,
                        abi: [parseAbiItem('function token0() view returns (address)')],
                        functionName: 'token0'
                    })
                    token_calls.push({
                        address: pool_address,
                        abi: [parseAbiItem('function token1() view returns (address)')],
                        functionName: 'token1'
                    })
                } else {
                    retry_missed.push(id)
                }
            })

            if (token_calls.length === 0) continue

            const token_results = await client.multicall({
                contracts: token_calls
            })

            for (let j = 0, pool = []; j < pools_ok.length; j++) {
                const token0_result = token_results[j * 2]
                const token1_result = token_results[j * 2 + 1]

                if (token0_result.status == 'success' && token1_result.status == 'success') {
                    pool[POOL.ID] = pools_ok[j].id
                    pool[POOL.ADDRESS] = pools_ok[j].address.toLowerCase()
                    pool[POOL.TOKEN0] = token0_result.result.toLowerCase()
                    pool[POOL.TOKEN1] = token1_result.result.toLowerCase()

                    console.log(pool.join(','))
                } else {
                    retry_missed.push(pools_ok[j].id)
                }
            }
        } catch (_) {
            chunk.forEach(id => {
                if (retry_missed.includes(id)) return
                retry_missed.push(id)
            })
        }
    }
    
    if (retry_missed.length) {
        params.missed = retry_missed
        return await load(params)
    }
}

const jobs_data_filename = process.argv[2]
const job_index = +process.argv[3]

if (isNaN(job_index)) process.exit(1)

const jobs_data = JSON.parse(fs.readFileSync(jobs_data_filename, 'utf8'))
jobs_data.missed = jobs_data.missed[job_index]

const client = createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${jobs_data.key}`)
})

load({client, ...jobs_data})
