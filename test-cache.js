const fs = require('fs')
const { describe, before, after, it } = require('node:test')
const assert = require('node:assert/strict')
const {load, subscribe} = require('./index')
const default_cache_filename = require('./default_cache_filename')
const uniswap_v2_factory = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'

describe('Cache OS filename at win32', () => {
    const platform = process.platform
    const os = require('os')
    const path = require('path')
    
    before(() => {
        process.env.GITHUB_ACTIONS = ''
        Object.defineProperty(process, 'platform', {value: 'win32', configurable: true})
    })
    
    it('win32', () => {
        const expected = path.join(os.homedir(), 'AppData', 'Local', `uniswap-v2-loader_${uniswap_v2_factory}.csv`)
        assert.equal(default_cache_filename(uniswap_v2_factory), expected)
    })
    it('win32 & APPDATA', () => {
        process.env.APPDATA = 'cache'
        assert.equal(
            default_cache_filename(uniswap_v2_factory),
            'cache/uniswap-v2-loader_0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f.csv'
        )
    })
    it('win32 & LOCALAPPDATA', () => {
        process.env.LOCALAPPDATA = 'cache'
        assert.equal(
            default_cache_filename(uniswap_v2_factory),
            'cache/uniswap-v2-loader_0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f.csv'
        )
    })

    it('linux .cache', () => {
        const exists_sync = fs.existsSync
        fs.existsSync = p => p.endsWith('.cache')
        Object.defineProperty(process, 'platform', {value: 'linux', configurable: true})
        process.env.XDG_CACHE_HOME = ''
        const expected = path.join(os.homedir(), '.cache', `uniswap-v2-loader_${uniswap_v2_factory}.csv`)
        assert.equal(default_cache_filename(uniswap_v2_factory), expected)
        fs.existsSync = exists_sync
    })

    it('os.tmpdir()', () => {
        const exists_sync = fs.existsSync
        fs.existsSync = path => false
        Object.defineProperty(process, 'platform', {value: 'linux', configurable: true})
        process.env.XDG_CACHE_HOME = ''
        
        const expected = path.join(os.tmpdir(), `uniswap-v2-loader_${uniswap_v2_factory}.csv`)
        assert.equal(default_cache_filename(uniswap_v2_factory), expected)
        fs.existsSync = exists_sync
    })
    
    after(() => {
        process.env.GITHUB_ACTIONS = 1
        Object.defineProperty(process, 'platform', {value: platform})
    })
})

describe('Cache OS filename at darwin', () => {
    const platform = process.platform
    const os = require('os')
    const path = require('path')

    before(() => {
        process.env.GITHUB_ACTIONS = ''
        Object.defineProperty(process, 'platform', {value: 'darwin', configurable: true})
    })
    
    it('darwin', () => {
        const expected = path.join(os.homedir(), 'Library', 'Caches', `uniswap-v2-loader_${uniswap_v2_factory}.csv`)
        assert.equal(default_cache_filename(uniswap_v2_factory), expected)
    })
    
    after(() => {
        process.env.GITHUB_ACTIONS = 1
        Object.defineProperty(process, 'platform', {value: platform})
    })
})

describe('Cache OS filename at linux', () => {
    const platform = process.platform
    const XDG_CACHE_HOME = process.env.XDG_CACHE_HOME
    const os = require('os')
    const path = require('path')

    before(() => {
        process.env.GITHUB_ACTIONS = ''
        Object.defineProperty(process, 'platform', {value: 'linux', configurable: true})
    })
    
    it('linux XDG_CACHE_HOME', () => {
        const exists_sync = fs.existsSync
        const cache_dir = path.join(os.homedir(), '.cache')
        fs.existsSync = p => p === cache_dir
        process.env.XDG_CACHE_HOME = cache_dir
        const expected = path.join(cache_dir, `uniswap-v2-loader_${uniswap_v2_factory}.csv`)
        assert.equal(default_cache_filename(uniswap_v2_factory), expected)
        fs.existsSync = exists_sync
    })
    
    after(() => {
        process.env.GITHUB_ACTIONS = 1
        process.env.XDG_CACHE_HOME = XDG_CACHE_HOME
        Object.defineProperty(process, 'platform', {value: platform})
    })
})
