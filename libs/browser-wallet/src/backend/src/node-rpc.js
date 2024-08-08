import assert from 'nanoassert'
import { hex as fromHex, toString } from '@vegaprotocol/crypto/buf'

const DEFAULT_TIMEOUT = 15000

export default class NodeRPC {
  /**
   *
   * @param {URL[]} nodeUrls
   */
  constructor(nodeUrl, timeout = DEFAULT_TIMEOUT) {
    assert(nodeUrl instanceof URL, 'nodeUrl must be WHATWG URLs')

    this._url = nodeUrl
    this._timeout = timeout
  }

  /**
   * Make direct GET request to data node
   *
   * @param {string} url - path part of the URL
   *
   * @returns {Promise<Object>}
   * @throws {Error} if response status is not 2xx
   * @throws {Error} if response body is not JSON
   */
  async getJSON(url) {
    const _url = new URL(url, this._url)

    const res = await fetch(_url, {
      headers: {
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(this._timeout)
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    return res.json()
  }

  /**
   * Make direct POST request to data node
   *
   * @param {string} url - path part of the URL
   *
   * @returns {Promise<Object>}
   * @throws {Error} if response status is not 2xx
   * @throws {Error} if response body is not JSON
   */
  async postJSON(url, body) {
    const _url = new URL(url, this._url)

    const res = await fetch(_url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this._timeout)
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    return res.json()
  }

  /**
   * Find a healthy Vega node. Algorithm:
   * 1. Request `/blockchain/height` from all nodes
   * 2. Remove nodes that:
   *  - Don't reply
   *  - Return a HTTP status code outside 2xx
   *  - Have a difference between their core block height and data node block height larger than `maxDrift`
   *  - Are `maxDelay` ms slower than the fastest node
   * 3. Group nodes into buckets of 3 blocks within each other
   * 4. Pick a random node from the largest bucket
   *
   * @returns URL
   */
  static async findHealthyNode(urls, maxDrift = 2, bucketSize = 3, maxDelay = 800) {
    const timeout = new AbortController()
    const nodesHeights = await promiseAllResolved(
      urls.map(async (u) => {
        const res = await fetch(new URL('/blockchain/height', u), {
          signal: timeout.signal,
          headers: {
            Accept: 'application/json'
          }
        })

        if (res.ok === false) throw new Error('Failed request')

        const { height } = await res.json()

        const coreHeight = BigInt(height)
        // The header is not set for talking to core nodes
        const nodeHeight = BigInt(res.headers.get('x-block-height') ?? coreHeight)

        const drift = coreHeight - nodeHeight
        // eslint-disable-next-line yoda
        if (-maxDrift > drift || drift > maxDrift) throw new Error('Block drift too high')

        return [u, nodeHeight]
      })
    )

    const maxHeight = nodesHeights.reduce((m, [_, height]) => bigintMax(m, height), 0n)

    const groups = group(nodesHeights, ([node, height]) => {
      const key = (maxHeight - height) / BigInt(bucketSize) // Group into buckets
      return [key, node]
    })

    const largestGroup = findLargest(groups)

    if (largestGroup.length === 0) throw new Error('No healthy node found')

    return new this(pickRandom(largestGroup))

    // Math.max does not work with bigint
    /**
     *
     * @param {bigint} a
     * @param {bigint} b
     * @returns bigint
     */
    function bigintMax(a, b) {
      return a > b ? a : b
    }

    async function promiseAllResolved(promises) {
      const timers = []

      // Add a max default timeout
      timers.push(
        setTimeout(() => {
          timeout.abort()
        }, DEFAULT_TIMEOUT)
      )

      promises.forEach((p) => {
        p.then(
          (res) => {
            timers.push(
              setTimeout(() => {
                timeout.abort()
              }, maxDelay)
            )
          },
          () => {}
        )
      })

      return Promise.allSettled(promises).then((results) => {
        timers.forEach((t) => clearTimeout(t))
        return results.filter(({ status }) => status === 'fulfilled').map(({ value }) => value)
      })
    }

    function group(values, fn) {
      const groups = values.reduce((map, val) => {
        const [key, value] = fn(val)

        const list = map.get(key) ?? []
        list.push(value)
        map.set(key, list)

        return map
      }, new Map())

      return Array.from(groups.values())
    }

    function findLargest(arr) {
      return arr.reduce((largest, group) => (group.length > largest.length ? group : largest), [])
    }

    function pickRandom(arr) {
      return arr[(arr.length * Math.random()) | 0]
    }
  }

  async blockchainHeight() {
    return this.getJSON('/blockchain/height')
  }

  async statistics() {
    return this.getJSON('/statistics')
  }

  /**
   *
   * @param {{ partyId: string }} param0
   * @returns
   */
  async statisticsSpam({ partyId }) {
    assert(typeof partyId === 'string')
    return this.getJSON(`/statistics/spam/${partyId}`)
  }

  async checkRawTransaction(tx) {
    const res = await this.postJSON('/transaction/raw/check', { tx })

    switch (res.code) {
      case 0:
        return res

      case 51:
        throw new NodeRPC.TxErrors.AbciTxnValidationFailure(res.data, res.code)

      // AbciTxnDecodingFailure code is returned when CheckTx or DeliverTx fail to decode the Txn.
      case 60:
        throw new NodeRPC.TxErrors.AbciTxnDecodingFailure(res.data, res.code)

      // AbciTxnInternalError code is returned when CheckTx or DeliverTx fail to process the Txn.
      case 70:
        throw new NodeRPC.TxErrors.AbciTxnInternalError(res.data, res.code)

      // AbciUnknownCommandError code is returned when the app doesn't know how to handle a given command.
      case 80:
        throw new NodeRPC.TxErrors.AbciUnknownCommandError(res.data, res.code)

      // AbciSpamError code is returned when CheckTx or DeliverTx fail spam protection tests.
      case 89:
        throw new NodeRPC.TxErrors.AbciSpamError(res.data, res.code)
    }
    return res
  }

  async submitRawTransaction(tx, type) {
    assert(typeof tx === 'string')
    assert(typeof type === 'string')

    const res = await this.postJSON('/transaction/raw', {
      tx,
      type
    })

    switch (res.code) {
      case 0:
        return res

      case 51:
        throw new NodeRPC.TxErrors.AbciTxnValidationFailure(toString(fromHex(res.data)), res.code, res)

      // AbciTxnDecodingFailure code is returned when CheckTx or DeliverTx fail to decode the Txn.
      case 60:
        throw new NodeRPC.TxErrors.AbciTxnDecodingFailure(toString(fromHex(res.data)), res.code, res)

      // AbciTxnInternalError code is returned when CheckTx or DeliverTx fail to process the Txn.
      case 70:
        throw new NodeRPC.TxErrors.AbciTxnInternalError(toString(fromHex(res.data)), res.code, res)

      // AbciUnknownCommandError code is returned when the app doesn't know how to handle a given command.
      case 80:
        throw new NodeRPC.TxErrors.AbciUnknownCommandError(toString(fromHex(res.data)), res.code, res)

      // AbciSpamError code is returned when CheckTx or DeliverTx fail spam protection tests.
      case 89:
        throw new NodeRPC.TxErrors.AbciSpamError(toString(fromHex(res.data)), res.code, res)
    }
    return res
  }

  static isTxError(err) {
    return (
      err instanceof NodeRPC.TxErrors.AbciTxnValidationFailure ||
      err instanceof NodeRPC.TxErrors.AbciTxnDecodingFailure ||
      err instanceof NodeRPC.TxErrors.AbciTxnInternalError ||
      err instanceof NodeRPC.TxErrors.AbciUnknownCommandError ||
      err instanceof NodeRPC.TxErrors.AbciSpamError
    )
  }

  static TxErrors = {
    AbciTxnValidationFailure: class extends Error {
      constructor(msg, code, data) {
        super(msg)
        this.code = code
        this.data = data
      }
    },
    AbciTxnDecodingFailure: class extends Error {
      constructor(msg, code, data) {
        super(msg)
        this.code = code
        this.data = data
      }
    },
    AbciTxnInternalError: class extends Error {
      constructor(msg, code, data) {
        super(msg)
        this.code = code
        this.data = data
      }
    },
    AbciUnknownCommandError: class extends Error {
      constructor(msg, code, data) {
        super(msg)
        this.code = code
        this.data = data
      }
    },
    AbciSpamError: class extends Error {
      constructor(msg, code, data) {
        super(msg)
        this.code = code
        this.data = data
      }
    }
  }
}
