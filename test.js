const fs = require('fs')
const { describe, before, it } = require('node:test')
const assert = require('node:assert/strict')
const {clear_cache, load, onupdate} = require('./index')

describe('Uniswap V2', () => {
    before(() => clear_cache())
    
    it('Exist USDC/USDP pair', () =>
        load({to: 2})
        .then(pairs => {
            assert.equal(pairs.length, 2)
            const i = pairs.findIndex(({id}) => id == 1)
            assert.ok(i != -1)
            if (i != -1) {
                const {pair, token0, token1} = pairs[i]
                assert.equal(pair, '0x3139Ffc91B99aa94DA8A2dc13f1fC36F9BDc98eE')
                assert.equal(token0, '0x8E870D67F660D95d5be530380D0eC0bd388289E1')
                assert.equal(token1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
            }
        })
    )
    
    
    it('Re-load first two pairs to custom CSV file', () => {
        // If user specify a filename then
        // a cache data will be taken from
        // the filename provided. If file is empty then
        // data will be uploaded again from network.
        const filename = Date.now() + '.csv'
        return load({to: 2, filename})
        .then(() => {
            const lines = fs.readFileSync(filename).toString().trim().split('\n')
            assert.equal(lines.length, 2)
        })
        .finally(() =>
            fs.unlinkSync(filename)
        )
    })

    it('onupdate should call provided callback with 2 pairs for a current moment (from cache)', () => {
        return new Promise(y => {
            const unsubscribe = onupdate(pairs => {
                assert.equal(pairs.length, 2)
                unsubscribe()
                y()
            }, {to: 2})
        })
    })

    it('Multi-core test 2 workers load 2 pools using multicall', () =>
        // There are already 2 pools loaded from previous test
        // 6 - 2 = 4. Rest 4 will be loaded by 2 workers. Each load 2.
        // Multicall size is 2.
        load({to: 6, multicall_size: 2, workers: 2 })
        .then(pairs => {
            assert.equal(pairs.length, 6)
        })
    )

    it('Each line at CSV cache file should be orderd by pair id (factory id)', () => {
        const lines = fs.readFileSync(require('./default_cache_filename'), 'utf8').trim().split('\n')
        for (var i = 0; i < lines.length; i++)
            assert.equal(i, +lines[i].split(',').shift())
    })

})
