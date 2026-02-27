/**
 * Represents a pair from a Uniswap V2-compatible protocol.
 */
export interface pair {
  /** The index of the pair in the factory. */
  id: number
  /** The address of the pair contract. */
  pair: string
  /** The address of token0. */
  token0: string
  /** The address of token1. */
  token1: string
}

/**
 * Parameters for the load function.
 */
export interface load_params {
  /** Alchemy/Infura API key. */
  key?: string
  /** The address of a Uniswap V2-compatible factory (e.g., Uniswap, PancakeSwap, SushiSwap). */
  factory?: string
  /** Path to the cache file. Set to null to disable caching. */
  filename?: string | null
  /** Number of pairs to fetch in a single multicall. */
  multicall_size?: number
  /** Start loading from this index. */
  from?: number
  /** Load up to this index (inclusive). */
  to?: number
  /** Progress callback. */
  progress?: (current: number, total: number) => void
  /** Number of worker threads to use. Set to 0 to run in the main thread. */
  workers?: number
  /** Existing pairs to start with (used for updates). */
  pairs?: pair[]
  /** Timeout between updates in milliseconds. */
  update_timeout?: number
}

/**
 * Loads pairs from a Uniswap V2-compatible factory.
 * @param params Loading configuration.
 * @returns A promise that resolves to an array of pairs.
 */
export function load(params?: load_params): Promise<pair[]>

/**
 * Clears the default cache file.
 */
export function clear_cache(): void

/**
 * Subscribes to new pairs being added to the factory.
 * @param callback Called whenever new pairs are loaded.
 * @param params Loading configuration.
 * @returns An unsubscribe function.
 */
export function onupdate(
  callback: (pairs: pair[]) => void,
  params?: load_params
): () => void
