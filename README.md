# <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-dark.svg"><img alt="calp.pro icon" src="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-light.svg" height="32" align="absmiddle"></picture>&nbsp;&nbsp;&nbsp;uniswap-v2-loader

<br>

**Fast DeFi AMM pools loader.** Optimized for **Multi-core CPUs** with smart **disk-cache**.

## Uniswap V2 based protocols
| Protocol | Factory Address |
| :--- | :--- |
| **Uniswap V2** | `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f` |
| **SushiSwap** | `0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac` |
| **PancakeSwap** | `0x1097053Fd2ea711dad45caCcc45EfF7548fCB362` |
| **ShibaSwap** | `0x115934131916C8b277DD010Ee02de363c09d037c` |
| **DefiSwap** | `0x9DEB29c9a4c7A88a3C0257393b7f3335338D9A9D` |
| **EtherVista** | `0x9a27cb5ae0B2cEe0bb71f9A85C0D60f3920757B4` |
| **Balancer V2** | `0xBA12222222228d8Ba445958a75a0704d566BF2C8` |


## CLI
```bash
npm i -g uniswap-v2-loader
uniswap-v2-loader --help
Options:
 	--key
	--factory
	--filename
	--multicall_size
	--from
	--to
	--workers
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

**Returns**: `Promise<Pair[]>`

**Example Response**
```json
[
  {
    "id": 0,
    "pair": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
    "token0": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48",
    "token1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
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
  factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac', // SushiSwap
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
