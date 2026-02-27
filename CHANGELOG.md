## [3.0.0] - 2026-02-27
- Added TypeScript type definitions (`index.d.ts`).
- Added JSDoc documentation for a better developer experience.
- Generalized protocol support for any Uniswap V2-compatible factory.
- Removed `count` method from the API for a cleaner, promise-based interface.

## [2.0.0] - 2026-02-26
- API Cleanup: `load` replaces `all` (now strictly returning `Promise<pair[]>`).
- API Cleanup: `multicall_size` replaces `chunk_size`.
- single core option ("multicore" - false)
- prune async/await sintax sugar
- worker delivery message at expected output pair format
- fix: cross OS combine path for worker
- fix: case where filename is not exist

## [1.4.0] - 2026-02-24
- spawn -> cluster
- test order pool by factory id at CSV
- clear cache CSV file

## [1.3.0] - 2026-02-23
- Add CLI version with `-c` or `--count` flag to counting loaded pairs from cache

## [1.2.0] - 2026-02-22
- Added `onupdate` function for subscribing to new pairs.
