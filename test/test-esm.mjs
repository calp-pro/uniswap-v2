import { load, subscribe } from '../src/index.mjs'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('ESM Support', () => {
    it('should import load and subscribe', () => {
        assert.equal(typeof load, 'function')
        assert.equal(typeof subscribe, 'function')
    })

    it('should load first pair', () => 
        load({ to: 1 })
        .then(pairs => {
            assert.equal(pairs.length, 1)
            assert.equal(pairs[0].id, 0)
        })
    )
})
