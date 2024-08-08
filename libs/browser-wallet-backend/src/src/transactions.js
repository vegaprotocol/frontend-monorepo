import { v4 as uuidv4 } from 'uuid'

export class TransactionsCollection {
  constructor({ store, connections }) {
    this.transactionStore = store
    this.connections = connections
  }

  async addTx(transaction, wallet, publicKey) {
    const existingTransactions = (await this.transactionStore.get(wallet)) ?? {}
    const existingTransactionByPublicKey = existingTransactions[publicKey] ?? []
    await this.transactionStore.set(wallet, {
      ...existingTransactions,
      [publicKey]: [transaction, ...existingTransactionByPublicKey]
    })
  }

  async listTxs(wallet) {
    const transactions = (await this.transactionStore.get(wallet)) ?? {}
    return { transactions }
  }

  async generateStoreTx({
    transaction,
    publicKey,
    sendingMode,
    keyName,
    walletName,
    origin,
    receivedAt,
    state,
    autoApproved,
    node
  }) {
    const networkId = await this.connections.getNetworkId(origin)
    const chainId = await this.connections.getChainId(origin)
    return {
      // Cannot use tx hash as an id as rejected transactions do not have a hash
      id: uuidv4(),
      transaction,
      publicKey,
      sendingMode,
      keyName,
      walletName,
      origin,
      networkId,
      chainId,
      decision: new Date().toISOString(),
      state,
      receivedAt,
      autoApproved,
      node,
      error: null,
      hash: null,
      code: null
    }
  }
}
