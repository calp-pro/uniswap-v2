# uniswap-v2-loader

High-speed Uniswap v2 pair loader using viem multicall and parallel CPU processing.

## Configuration
The package uses Alchemy. Set your key as an environment variable (a default key is used if none is provided):
`export KEY=your_alchemy_key`

## API Reference
### `all()`
- **Description**: Fetches all token pairs from the Uniswap v2 factory. It utilizes multicall from `viem` and splits the loading process between multiple CPUs for high-speed execution.
- **Returns**: `Promise<Array<Object>>`

### Output Format
The function returns a `Promise` resolving to an array of objects with the following fields:
- `id`: (number) The pair index.
- `pair`: (string) The pair contract address.
- `token0`: (string) The address of the first token in the pair.
- `token1`: (string) The address of the second token in the pair.

## Usage
```javascript
const { all } = require('uniswap-v2-loader')

all().then(pairs => 
    pairs.forEach(({id, pair, token0, token1}) => 
        console.log(`ID: ${id} | Pair: ${pair} | Tokens: ${token0}, ${token1}`)
    )
)
```
