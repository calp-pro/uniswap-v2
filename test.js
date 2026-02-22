const fs = require('fs')
const { test } = require('node:test')
const assert = require('node:assert/strict')
const uniswap_v2_loader = require('./index')

test('Exist USDC/USDP pair', () =>
    uniswap_v2_loader.all({to: 14})
    .then(pairs => {
        assert.equal(pairs.length, 14)
        const i = pairs.findIndex(({id}) => id == 1)
        assert.ok(i != -1)
        if (i != -1) {
            const {pair, token0, token1} = pairs[i]
            assert.equal(pair, '0x3139ffc91b99aa94da8a2dc13f1fc36f9bdc98ee')
            assert.equal(token0, '0x8e870d67f660d95d5be530380d0ec0bd388289e1')
            assert.equal(token1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
        }
    })
)

test('Load first two pairs to file', () => {
    const filename = Date.now() + '.csv'
    return uniswap_v2_loader.all({to: 2, filename})
    .then(() => {
        const lines = fs.readFileSync(filename).toString().trim().split('\n')
        assert.equal(lines.length, 2)
    })
    .finally(() =>
        fs.unlinkSync(filename)
    )
})

test('onupdate should call provided callback with 2 pairs for a current moment (from cache)', () => {
    return new Promise(y => {
        const unsubscribe = uniswap_v2_loader.onupdate(pairs => {
            assert.equal(pairs.length, 2)
            unsubscribe()
            y()
        }, {to: 2})
    })
})

test('Heavy test load first 3000 pairs', () =>
    uniswap_v2_loader.all({to: 3000})
    .then(pairs => {
        assert.equal(pairs.length, 3000)
    })
)
