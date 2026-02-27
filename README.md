# uniswap-v2-loader

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
High-speed Uniswap v2 pair loader using viem multicall and parallel CPU processing.

## Configuration
The package uses Alchemy. Set your key as an environment variable (a default key is used if none is provided):
`export KEY=your_alchemy_key`

## CLI
```
npm i -g uniswap-v2-loader
uniswap-v2-loader
```


## API Reference
### `load(params)`
- **Description**: Fetches token pairs from a Uniswap V2-compatible factory (e.g., Uniswap, PancakeSwap, SushiSwap). It utilizes multicall from `viem` and splits the loading process between multiple CPUs for high-speed execution.
- **Arguments**:
    - `params`: (Object)
        - `from`: (number) Start loading from this index (default 0).
        - `to`: (number) Load up to this index.
        - `filename`: (string) Path to cache CSV file.
        - `multicall_size`: (number) Items per multicall (default 50).
        - `factory`: (string) Factory address.
        - `key`: (string) Alchemy/Infura API key.
        - `workers`: (number) Number of worker threads (default max CPUs - 1).
- **Returns**: `Promise<Array<Object>>` (Array of Pair Objects)

### `onupdate(callback, params)`
- **Description**: Subscribes to new pairs appearing at the factory contract. It initially calls the callback with cached pairs and then polls for updates.
- **Arguments**:
    - `callback`: (function) Called with an array of Pair Objects.
    - `params`: (Object) Same as `load()` plus:
        - `update_timeout`: (number) Polling interval in ms (default 5000).
- **Returns**: `Function` An unsubscribe function to stop polling.

### `clear_cache()`
- **Description**: Clears the default cache file.

### Pair Object
The pair object contains the following fields:
- `id`: (number) The pair index.
- `pair`: (string) The pair contract address.
- `token0`: (string) The address of the first token in the pair.
- `token1`: (string) The address of the second token in the pair.

## Usage
```javascript
const { load, onupdate } = require('uniswap-v2-loader')

// Load initial set
load({to: 10}).then(pairs =>
    pairs.forEach(({id, pair}) => console.log(`ID: ${id} | Pair: ${pair}`))
)

// Subscribe to new pairs (24/7 monitoring)
const unsubscribe = onupdate(pairs => {
    console.log(`Pools count: ${pairs.length}`)
})

// Stop monitoring if needed
// unsubscribe()
```
