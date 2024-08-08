import { TinyEventemitter } from '../lib/tiny-eventemitter.js';

export class ConnectionsCollection {
  constructor({ connectionsStore, publicKeyIndexStore, keySortIndex }) {
    this.store = connectionsStore;
    this.index = publicKeyIndexStore;
    this.sortIndex = keySortIndex;

    this._emitter = new TinyEventemitter();
  }

  on(event, listener) {
    return this._emitter.on(event, listener);
  }

  off(event, listener) {
    return this._emitter.off(event, listener);
  }

  /**
   * Set a connection.
   *
   * @param {string} origin - The origin of the connection
   * @param {object} params - The connection parameters
   * @param {string[]} params.allowList.publicKeys - Individual public keys visible to a connection
   * @param {string[]} params.allowList.wallets - Complete wallets visible to a connection
   * @param {string} [params.chainId] - The chainId that was approved for the connection
   * @param {string} [params.networkId] - Preferred networkId that was approved for the connection
   * @returns {Promise<void>}
   */
  async set(
    origin,
    {
      allowList,
      chainId = null,
      networkId = null,
      accessedAt,
      autoConsent = false,
    }
  ) {
    const value = {
      origin,
      allowList,
      chainId,
      networkId,
      accessedAt: accessedAt ?? Date.now(),
      autoConsent,
    };

    const res = await this.store.set(origin, value);

    this._emitter.emit('set', value);

    return res;
  }

  /**
   * Update the last access time of a connection.
   * Like UNIX `touch`
   *
   * @param {string} origin - The origin of the connection
   * @returns {Promise<void>}
   */
  async touch(origin) {
    return await this.store.transaction(async (store) => {
      const conn = await store.get(origin);
      if (conn == null) return;

      conn.accessedAt = Date.now();

      await store.set(origin, conn);
      this._emitter.emit('set', conn);
    });
  }

  async has(origin) {
    return await this.store.has(origin);
  }

  async list() {
    return Array.from(await this.store.values()).sort((a, b) => {
      return b.accessedAt - a.accessedAt;
    });
  }

  async clearConnections() {
    const origins = await this.list();
    for (const { origin } of origins) {
      this._emitter.emit('delete', { origin });
    }
    await this.store.clear();
    await this.index.clear();
  }

  async delete(origin) {
    const res = await this.store.delete(origin);

    this._emitter.emit('delete', { origin });

    return res;
  }

  async get(origin) {
    return await this.store.get(origin);
  }

  async update(origin, newProperties) {
    const connections = await this.store.get(origin);
    if (connections == null)
      throw new Error(`Could not find connections with origin ${origin}`);
    await this.store.set(origin, { ...connections, ...newProperties });
  }

  async isAllowed(origin, publicKey) {
    const conn = await this.store.get(origin);
    if (conn?.allowList == null) return false;
    const { allowList } = conn;

    const explicitKey = allowList.publicKeys.includes(publicKey);
    if (explicitKey) return true;

    const pkFromIndex = await this.index.get(publicKey);
    if (pkFromIndex == null) return false;

    return allowList.wallets.includes(pkFromIndex.wallet);
  }

  async listAllowedKeys(origin) {
    const conn = await this.store.get(origin);
    if (conn?.allowList == null) return [];

    const { allowList } = conn;

    const keysFromIndex = await this.index.values();
    const keys = [];
    for (const { publicKey, name, wallet } of keysFromIndex) {
      if (allowList.wallets.includes(wallet)) {
        keys.push({ publicKey, name });
      }

      if (allowList.publicKeys.includes(publicKey)) {
        keys.push({ publicKey, name });
      }
    }
    const enrichedKeys = await Promise.all(
      keys.map(async (key) => {
        const order = await this.sortIndex.get(key.publicKey);
        return {
          order,
          ...key,
        };
      })
    );
    const sortedKeys = enrichedKeys.sort((a, b) => a.order - b.order);
    return sortedKeys;
  }

  /**
   * Get the chainId that was approved for a given origin on initial connection.
   * The chainId should not be changed without user consent.
   *
   * @param {string} origin - The origin of the connection
   * @returns {string | null} The chainId
   */
  async getChainId(origin) {
    const conn = await this.store.get(origin);
    if (conn == null) return null;

    return conn.chainId ?? null;
  }

  /**
   * Get the networkId that was approved for a given origin on initial connection.
   * The networkId is only facing the extension and references a specific
   * network configuration.
   *
   * @param {string} origin - The origin of the connection
   * @returns {string | null} The networkId
   */
  async getNetworkId(origin) {
    const conn = await this.store.get(origin);
    if (conn == null) return null;

    return conn.networkId ?? null;
  }
}
