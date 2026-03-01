const get_pairs_addresses = (key, factory, ids) => ids.length == 0
    ? Promise.resolve([])
    : fetch('https://eth-mainnet.g.alchemy.com/v2/' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids.map((id, i) => ({
            jsonrpc: '2.0',
            id: i,
            method: 'eth_call',
            params: [{ to: factory, data: '0x1e3dd18b' + id.toString(16).padStart(64, '0') }, 'latest']
        })))
    }).then(_ => _.json()).then(responds => {
        responds.sort((a, b) => a.id - b.id)
        const addresses = []
        const failed_ids = []
        for (var i = 0; i < responds.length; i++)
            responds[i].result
                ? addresses.push('0x' + responds[i].result.slice(-40).toLowerCase())
                : failed_ids.push(ids[i])

        return failed_ids.length == 0
            ? addresses
            : get_pairs_addresses(key, factory, failed_ids).then(retried => [...addresses, ...retried])
    })

const get_tokens = (key, addresses) => addresses.length == 0
    ? Promise.resolve({})
    : fetch('https://eth-mainnet.g.alchemy.com/v2/' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addresses.flatMap((address, i) => [
            {
                jsonrpc: '2.0',
                id: i * 2,
                method: 'eth_call',
                params: [{ to: address, data: '0x0dfe1681' }, 'latest']
            },
            {
                jsonrpc: '2.0',
                id: i * 2 + 1,
                method: 'eth_call',
                params: [{ to: address, data: '0xd21220a7' }, 'latest']
            }
        ]))
    }).then(_ => _.json()).then(responds => {
        responds.sort((a, b) => a.id - b.id)
        const tokens = {}
        const failed_addresses = []

        for (var i = 0; i < addresses.length; i++) {
            const token0_respond = responds[i * 2]
            const token1_respond = responds[i * 2 + 1]

            if (token0_respond.result && token1_respond.result)
                tokens[addresses[i]] = [
                    '0x' + token0_respond.result.slice(-40).toLowerCase(),
                    '0x' + token1_respond.result.slice(-40).toLowerCase()
                ]
            else
                failed_addresses.push(addresses[i])
        }

        return failed_addresses.length == 0
            ? tokens
            : get_tokens(key, failed_addresses).then(retried => ({ ...tokens, ...retried }))
    })

const main = ({ids, factory, key, multicall_size}, onpair) => {
    const chunks = []
    for (let i = 0; i < ids.length; i += multicall_size)
        chunks.push(ids.slice(i, i + multicall_size))

    return chunks.reduce((p, ids, ic) =>
        p.then(() =>
            get_pairs_addresses(key, factory, ids).then(pairs_addresses =>
                get_tokens(key, pairs_addresses).then(tokens =>
                    ids.forEach((id, i) =>
                        onpair({
                            id,
                            pair: pairs_addresses[i],
                            token0: tokens[pairs_addresses[i]][0],
                            token1: tokens[pairs_addresses[i]][1]
                        })
                    )
                )
            )
        ),
        Promise.resolve()
    )
}


if (require.main != module)
    module.exports = main
else
    process.on(
        'message',
        message =>
            main(message, pair => process.send(pair))
            .then(() => process.exit())
    )
