# <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-dark.svg"><img alt="calp.pro icon" src="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-light.svg" height="32" align="absmiddle"></picture>&nbsp;&nbsp;uniswap-v2-loader&nbsp;&nbsp;[![Coverage](https://coveralls.io/repos/github/calp-pro/uniswap-v2-loader/badge.svg?branch=main)](https://coveralls.io/github/calp-pro/uniswap-v2-loader)

**Fast DeFi AMM pools loader.** Optimized for **Multi-core CPUs** with smart **disk-cache**.<br>
This package is a loader that allows you to download protocol addresses yourself.<br>
If you want to instantly get all addresses (pools and their tokens), use the packages from the next section.<br>
Those packages check for updates every hour and republish the package with updated data.

## Uniswap V2 based protocols
- **Uniswap V2**
  * `0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f` fabric [contract](https://etherscan.io/address/0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f)
  * pre-loaded CSV dump: [uniswap-v2-dump](https://github.com/calp-pro/uniswap-v2-dump)
- **SushiSwap**
  * `0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac` fabric [contract](https://etherscan.io/address/0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac)
  * pre-loaded CSV dump: [sushiswap-dump](https://github.com/calp-pro/sushiswap-dump)
- **PancakeSwap**
  * `0x1097053fd2ea711dad45caccc45eff7548fcb362` fabric [contract](https://etherscan.io/address/0x1097053fd2ea711dad45caccc45eff7548fcb362)
  * pre-loaded CSV dump: [pancakeswap-dump](https://github.com/calp-pro/pancakeswap-dump)
- **ShibaSwap**
  * `0x115934131916c8b277dd010ee02de363c09d037c` fabric [contract](https://etherscan.io/address/0x115934131916c8b277dd010ee02de363c09d037c)
  * pre-loaded CSV dump: [shibaswap-dump](https://github.com/calp-pro/shibaswap-dump)
- **DefiSwap**
  * `0x9deb29c9a4c7a88a3c0257393b7f3335338d9a9d` fabric [contract](https://etherscan.io/address/0x9deb29c9a4c7a88a3c0257393b7f3335338d9a9d)
  * pre-loaded CSV dump: [defiswap-dump](https://github.com/calp-pro/defiswap-dump)
- **EtherVista**
  * `0x9a27cb5ae0b2cee0bb71f9a85c0d60f3920757b4` fabric [contract](https://etherscan.io/address/0x9a27cb5ae0b2cee0bb71f9a85c0d60f3920757b4)
  * pre-loaded CSV dump: [ethervista-dump](https://github.com/calp-pro/ethervista-dump)
- **RadioShack**
  * `0x91fae1bc94a9793708fbc66adcb59087c46dee10` fabric [contract](https://etherscan.io/address/0x91fae1bc94a9793708fbc66adcb59087c46dee10)
  * pre-loaded CSV dump: [radioshack-dump](https://github.com/calp-pro/radioshack-dump)

## Install
- CLI
  * ```
    npm i -g uniswap-v2-loader
    ```
- Node.js API
  * ```
    npm i --save uniswap-v2-loader
    ```

## CLI
```bash
uniswap-v2-loader --from=1 --to=3
```
Output:
```
2,0x12ede161c702d1494612d19f05992f43aa6a26fb,0x06af07097c9eeb7fd685c692751d5c66db49c215,0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
3,0xa478c2975ab1ea89e8196811f51a7b7ade33eb11,0x6b175474e89094c44da98b954eedeac495271d0f,0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
```

## API
Methods:
- `load(config)`
  * return `Promise(<Pair>[])`
- `subscribe(callback, config)`
  * Continuous synchronization engine. Performs initial load and subsequently polls for new pairs.
  * return unsubscribe function

<i>where `config` is common `Object` with set of parameters to loader.</i>

`config` is an Object (key/value)
- `from`
  * Start loading from this pair index.
  * Type: `number`
  * Default: `0`
- `to`
  * End index (exclusive). Required for range loading.
  * Type: `number`
  * Default: `undefined`
- `filename`
  * CSV cache path.
  * Type: `string`
  * Default: *OS cache folder*
- `factory`
  * Smart contract factory address.
  * Type: `string`
  * Default: `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`
- `key`
  * Alchemy API Key
  * Type: `string`
  *  Default: `FZBvlPrOxtgaKBBkry3SH0W1IqH4Y5tu`
- `multicall_size`
  * RPC batch size per multicall request.
  * Type:`number`
  * Default: `50`
- `workers`
  * Number of parallel worker threads.
  * Type: `number`
  * Default: `CPU - 1`
- `progress`
  * Each loaded pair execute this callback: `(id, total, pair) => {}`.
  * Callback arguments:
    - `id` fabric index of pair contract (int)
    - `total` total amount of pairs at fabric at current moment
    - `pair` instance of `Pair`(`{id: number, pair: string, token0: string, token1: string}`)
  * Type: `function`
  * Default: `undefined`
- `abort_signal`
* Signal to cancel loading and release workers.
* Type: `AbortSignal`
* Default: `undefined`
- `update_timeout`
* Polling interval in milliseconds. Used only in `subscribe`
* Type: `number`
* Default: `5000`

### Schema `Pair`
Standardized liquidity pool object.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Numeric index of the pair in the factory |
| `pair` | `string` | DEX pair address |
| `token0` | `string` | Token address |
| `token1` | `string` | Token address |


**Example `<Pair>[]`**
```json
[
  {
    "id": 0,
    "pair": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
    "token0": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "token1": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  }
]
```

### Smart Cross-Platform Caching
The loader automatically identifies the optimal persistent storage path for your operating system to ensure zero-configuration caching:
- **Linux:** `$XDG_CACHE_HOME` or `~/.cache/`
- **macOS:** `~/Library/Caches/`
- **Windows:** `%LOCALAPPDATA%` or `AppData/Local/`

Cache files are named following the pattern `${package_name}_{factory_address}.csv`.


## API Usage
```javascript
const { load } = require('uniswap-v2-loader')

console.time('SushiSwap')

load({ 
  factory: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
  to: 100,
  progress: (i, total, pair) =>
    console.log(pair.token0, pair.token1)
})
.then(pairs => {
  console.timeEnd('SushiSwap')
  console.log(pairs.length, 'pairs')
})
```
