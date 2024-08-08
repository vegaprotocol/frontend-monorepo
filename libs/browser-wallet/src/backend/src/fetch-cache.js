import { toBase64, base64 as fromBase64 } from '@vegaprotocol/crypto/buf'

export const Seconds = 1000
export const Minutes = 60 * Seconds
export const Hours = 60 * Minutes
export const Days = 24 * Hours

/**
 * Default caching strategy (ie. the concrete implementation for the browser wallet)
 *
 * We cache:
 *  - Markets for 30 Minutes
 *  - Assets for 30 Minutes
 *  - Everything else is not cached
 *
 * New endpoints can be added to the switch statement, while more advanched caching strategies
 * can be implemented based on the value (eg. a position that expires or something)
 *
 * @param {string} key
 * @param {Object} value
 * @returns {number} TTL in milliseconds
 */
export function vegaCachingStrategy(key, value) {
  const url = new URL(key, 'https://localhost') // adding a random domain to make a valid URL

  switch (url.pathname) {
    case '/api/v2/markets':
      return 30 * Minutes
    case '/api/v2/assets':
      return 30 * Minutes
    default:
      return 0
  }
}

export class FetchCache {
  /**
   * @param {AsyncMap} storage
   * @param {Function} ttlFn Function that returns the TTL for a given key and value
   * @returns {FetchCache}
   */
  constructor(storage, ttlFn = vegaCachingStrategy) {
    /**
     * @private
     */
    this._cache = storage

    /**
     * @private
     */
    this._ttlFn = ttlFn
  }

  /**
   * @private
   * @param {string} path The path to cache
   * @param {string} networkId The id of the network we are requesting the data from
   * @returns {string} The combined path and networkId cache key
   */
  _getCacheKey(path, networkId) {
    return `${networkId}:${path}`
  }

  /**
   * @param {string} path
   * @param {string} networkId
   * @returns {Promise<boolean>}
   */
  async has(path, networkId) {
    const key = this._getCacheKey(path, networkId)
    await this._gc()

    return this._cache.has(key)
  }

  /**
   * @param {string} path
   * @returns {Promise<Object> | Promise<undefined>}
   */
  async get(path, networkId) {
    await this._gc()
    const key = this._getCacheKey(path, networkId)

    const value = await this._cache.get(key)
    if (!value) return undefined

    return decompress(value.value)
  }

  /**
   * @param {string} path
   * @param {string} networkId
   * @param {Object} value
   * @returns {Promise<void>}
   */
  async set(path, networkId, value) {
    const key = this._getCacheKey(path, networkId)

    const ttl = this._ttlFn(path, value) ?? 0
    if (ttl === 0) return

    const _value = await compress(value) // save space
    await this._cache.set(key, { value: _value, ttl: Date.now() + ttl })
  }

  async _gc() {
    await Promise.all(
      Array.from(await this._cache.entries(), async ([key, value]) => {
        if (value.ttl < Date.now()) {
          await this._cache.delete(key)
        }
      })
    )
  }
}

/**
 * Compress a JSON serializable object to a base64 string using GZIP
 *
 * @param {Object} value
 * @returns {Promise<string>}
 */
async function compress(value) {
  const jsonString = JSON.stringify(value)

  // Create a Blob so we can use web streams
  const blob = new Blob([jsonString])

  // Compress the Blob data with GZIP
  const compressedStream = blob.stream().pipeThrough(new CompressionStream('gzip'))

  // Convert compressed stream to Uint8Array
  const compressedData = await new Response(compressedStream).arrayBuffer()
  const compressedUint8Array = new Uint8Array(compressedData)

  // Convert compressed data to base64
  return toBase64(compressedUint8Array)
}

/**
 * Decompress a base64 string to a JSON serializable object using GZIP
 * @param {string} base64String
 * @returns {Promise<Object>}
 */
async function decompress(base64String) {
  // Convert base64 string to Uint8Array
  const binaryData = fromBase64(base64String)

  // Decompress data with GZIP
  const decompressedStream = new Blob([binaryData]).stream().pipeThrough(new DecompressionStream('gzip'))

  // Convert decompressed stream to text
  const decompressedData = await new Response(decompressedStream).text()

  return JSON.parse(decompressedData)
}
