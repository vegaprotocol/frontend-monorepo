import assert from 'nanoassert'
import NodeRPC from './node-rpc.js'

export class NetworkCollection {
  constructor(store) {
    this.store = store

    // Cache of live Network instances
    this._cache = new Map()
  }

  /**
   *
   * @param {string} name
   * @param {{name: string, rest: string[], explorer: string}} config
   * @returns {Promise<Network>}
   */
  async set(name, config) {
    assert(typeof config.name === 'string')
    assert(Array.isArray(config.rest))

    // validate
    await this.store.set(name, config)

    this._cache.delete(name)
    const net = new Network(config)
    this._cache.set(name, net)

    return net
  }

  async getByChainId(chainId) {
    const nets = await this.listNetworkDetails()
    return nets.find((net) => net.chainId === chainId)
  }

  getByNetworkId(networkId) {
    if (this._cache.has(networkId)) return this._cache.get(networkId)

    return this.store.get(networkId)
  }

  /**
   * Get a network by networkId, with a fallback to chainId
   *
   * @param {string} networkId - The preferred network configuration id
   * @param {string} chainId - The preferred chain id (fallback)
   * @returns {Promise<Network>}
   */
  async get(networkId, chainId) {
    if (this._cache.has(networkId)) return this._cache.get(networkId)

    const candidate = (await this.getByNetworkId(networkId)) ?? (await this.getByChainId(chainId))

    if (candidate == null) throw new Error(`No network found for networkId ${networkId} or chainId ${chainId}`)

    const net = new Network(candidate)
    this._cache.set(networkId, net)
    return net
  }

  /**
   *
   * @param {string} name
   * @returns {Promise<boolean>}
   */
  async delete(name) {
    this._cache.delete(name)
    return this.store.delete(name)
  }

  /**
   *
   * @returns {Promise<string[]>}
   */
  async list() {
    return Array.from(await this.store.keys())
  }

  /**
   *
   * @returns {Promise<Network[]>}
   */
  async listNetworkDetails() {
    const networks = await this.list()
    const promises = networks.map(async (k) => {
      const network = await this.get(k)
      const sanitizedNetwork = {
        ...network,
        // Firefox cannot clone promises/url objects like this to send over the port
        preferredNode: await network.preferredNode?.toString()
      }
      return {
        ...sanitizedNetwork,
        id: k
      }
    })
    return Promise.all(promises)
  }
}

const DEFAULT_PREFERRED_NODE_TTL = 1000 * 5 // 5 seconds

export class Network {
  constructor({
    id,
    name,
    chainId,
    hidden,
    rest,
    console,
    ethereumExplorerLink,
    arbitrumExplorerLink,
    ethereumChainId,
    arbitrumChainId,
    explorer,
    governance,
    docs,
    vegaDapps,
    color,
    secondaryColor
  }) {
    this.id = id
    this.name = name
    this.chainId = chainId
    this.hidden = hidden
    this.rest = rest
    this.console = console
    this.ethereumExplorerLink = ethereumExplorerLink
    this.arbitrumExplorerLink = arbitrumExplorerLink
    this.ethereumChainId = ethereumChainId
    this.arbitrumChainId = arbitrumChainId
    this.explorer = explorer
    this.governance = governance
    this.docs = docs
    this.vegaDapps = vegaDapps
    this.color = color
    this.secondaryColor = secondaryColor

    this.probing = false
    this.preferredNode = null

    this._nodeTimeout = null
  }

  async rpc() {
    // Note that no awaits are present on `this.preferredNode` inside here.
    // This prevents any errors inside the perferred node from being thrown here,
    // but instead in the caller that unwraps the promise.

    // If we're already probing, return the preferred node promise
    if (this.probing === true) return this.preferredNode
    // If we have a preferred node, return it
    if (this.preferredNode != null) return this.preferredNode

    // Clear timeout just to be safe. This should not have any effect currently,
    // but we may change the logic to take into account failed requests to the preferred node
    clearTimeout(this._nodeTimeout)
    this.probing = true

    this.preferredNode = NodeRPC.findHealthyNode(this.rest.map((u) => new URL(u)))
      .then(
        (node) => {
          // Only set timeout if successful
          this._nodeTimeout = setTimeout(() => {
            this.preferredNode = null
          }, DEFAULT_PREFERRED_NODE_TTL)

          return node
        },
        (err) => {
          // The promise will reject all pending calls, but clear state
          // such that the next call will try to find a healthy node again
          this.preferredNode = null
          throw err
        }
      )
      .finally(() => {
        this.probing = false
      })

    return this.preferredNode
  }
}
