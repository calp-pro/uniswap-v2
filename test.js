const fs = require('fs')
const { describe, before, it } = require('node:test')
const assert = require('node:assert/strict')
const {load, subscribe} = require('./index')
const default_cache_filename = require('./default_cache_filename')

describe('Uniswap V2', () => {
    const uniswap_v2_factory = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
    const uniswap_v2_cache_filename = default_cache_filename(uniswap_v2_factory)
    before(() => {
        if (fs.existsSync(uniswap_v2_cache_filename))
            fs.unlinkSync(uniswap_v2_cache_filename)
    })
    
    it('Exist USDC/USDP pair', () =>
        load({to: 2})
        .then(pairs => {
            assert.equal(pairs.length, 2)
            const i = pairs.findIndex(({id}) => id == 1)
            assert.ok(i != -1)
            if (i != -1) {
                const {pair, token0, token1} = pairs[i]
                // Return format should be standardized between Ethereum nodes which
                // can return address in lower-case and mix-case formats
                // Lower-case format guarantee matching addresses with == operator 
                assert.equal(pair, '0x3139ffc91b99aa94da8a2dc13f1fc36f9bdc98ee')
                assert.equal(token0, '0x8e870d67f660d95d5be530380d0ec0bd388289e1')
                assert.equal(token1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
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

    it('subscribe should call provided callback with 2 pairs for a current moment (from cache)', () => {
        return new Promise(y => {
            const unsubscribe = subscribe(pairs => {
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
        const lines = fs.readFileSync(require('./default_cache_filename')('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'), 'utf8').trim().split('\n')
        for (var i = 0; i < lines.length; i++)
            assert.equal(i, +lines[i].split(',').shift())
    })

})
