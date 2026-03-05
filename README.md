# <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-dark.svg"><img alt="calp.pro icon" src="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-light.svg" height="32" align="absmiddle"></picture>&nbsp;&nbsp;uniswap-v2-loader&nbsp;&nbsp;[![Coverage](https://coveralls.io/repos/github/calp-pro/uniswap-v2-loader/badge.svg?branch=main)](https://coveralls.io/github/calp-pro/uniswap-v2-loader)

<br>

**Fast DeFi AMM pools loader.** Optimized for **Multi-core CPUs** with smart **disk-cache**.

## Uniswap V2 based protocols
| Protocol | Factory Address |
| :--- | :--- |
| **Uniswap V2** | `0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f` |
| **SushiSwap** | `0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac` |
| **PancakeSwap** | `0x1097053fd2ea711dad45caccc45eff7548fcb362` |
| **ShibaSwap** | `0x115934131916c8b277dd010ee02de363c09d037c` |
| **DefiSwap** | `0x9deb29c9a4c7a88a3c0257393b7f3335338d9a9d` |
| **EtherVista** | `0x9a27cb5ae0b2cee0bb71f9a85c0d60f3920757b4` |
| **Balancer V2** | `0xba12222222228d8ba445958a75a0704d566bf2c8` |


## CLI
```bash
> npm i -g uniswap-v2-loader
> uniswap-v2-loader --from=1 --to=3

2,0x12ede161c702d1494612d19f05992f43aa6a26fb,0x06af07097c9eeb7fd685c692751d5c66db49c215,0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
3,0xa478c2975ab1ea89e8196811f51a7b7ade33eb11,0x6b175474e89094c44da98b954eedeac495271d0f,0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
```

## API Reference

### `load(params)`
High-performance parallel fetcher for liquidity pairs. Efficiently synchronizes state with local disk cache and executes multi-threaded RPC requests.

**Parameters**
| Name | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `from` | `number` | Start loading from this pair index. | `0` |
| `to` | `number` | End index (exclusive). Required for range loading. | `undefined` |
| `filename` | `string` | Local CSV cache path. Supports OS-standard locations. | *Auto-detected* |
| `factory` | `string` | Smart contract factory address. | `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f` |
| `key` | `string` | Alchemy/RPC API Key (priority over ENV). | `FZBvlPrOxtgaKBBkry3SH0W1IqH4Y5tu` |
| `multicall_size` | `number` | RPC batch size per multicall request. | `50` |
| `workers` | `number` | Number of parallel worker threads. | `CPU - 1` |
| `progress` | `function` | Progress callback: `(current, total) => {}`. | `undefined` |
| `abort_signal` | `AbortSignal` | Signal to cancel loading and release workers. | `undefined` |

**Returns**: `Promise<Pair[]>`

**Example Response**
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

---

### Smart Cross-Platform Caching
The loader automatically identifies the optimal persistent storage path for your operating system to ensure zero-configuration caching:
- **Linux:** `$XDG_CACHE_HOME` or `~/.cache/`
- **macOS:** `~/Library/Caches/`
- **Windows:** `%LOCALAPPDATA%` or `AppData/Local/`

Cache files are named following the pattern `${package_name}_{factory_address}.csv`.

---

### `subscribe(callback, params)`
Continuous synchronization engine. Performs initial load and subsequently polls for new pairs.

**Parameters**
| Name | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `callback` | `function` | Invoked with updated `Pair[]` array. | **Required** |
| `params` | `object` | All options from `load()` plus `update_timeout`. | - |
| `update_timeout` | `number` | Polling interval in milliseconds. | `5000` |

**Returns**: `function` (Stop/Unsubscribe function)

---

### Schema: `Pair`
Standardized liquidity pool object.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Global index of the pair in the factory. |
| `pair` | `string` | Ethereum address of the liquidity pool. |
| `token0` | `string` | Address of the first asset. |
| `token1` | `string` | Address of the second asset. |

---

## Usage Example
```javascript
const { load, subscribe } = require('uniswap-v2-loader')
const rl = require('readline')


load({ 
  factory: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac  ', // SushiSwap
  to: 1000, 
  progress: (c, t) => {
    rl.cursorTo(process.stdout, 0)
    rl.clearLine(process.stdout, 0)
    process.stdout.write(`Loaded: ${c} / ${t} (${(c/t*100).toFixed(2)}%)`)
  }
}).then(pairs => {
  console.log(`\nSuccessfully loaded ${pairs.length} SushiSwap pairs`)
})
```
