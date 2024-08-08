import { TransactionsCollection } from '../src/transactions';
import { ConnectionsCollection } from '../src/connections.js';
import ConcurrentStorage from '../lib/concurrent-storage.js';

const createTransactionsCollection = () => {
  const transactionsStore = new ConcurrentStorage(new Map());
  const connections = new ConnectionsCollection({
    connectionsStore: new Map(),
    publicKeyIndexStore: new Map(),
    keySortIndex: new Map(),
  });
  const transactions = new TransactionsCollection({
    store: transactionsStore,
    connections,
  });
  return {
    transactions,
    connections,
    transactionsStore,
  };
};

const generateTx = async (connections, transactions) => {
  await connections.set('https://example.com', {
    allowList: {
      wallets: ['w1'],
      publicKeys: [],
    },
    accessedAt: 0,
    networkId: 'n1',
    chainId: 'c1',
  });
  const mockTx = {};
  const result = await transactions.generateStoreTx({
    transaction: mockTx,
    publicKey: 'pk1',
    sendingMode: 'TYPE_ASYNC',
    keyName: 'key1',
    walletName: 'w1',
    origin: 'https://example.com',
    receivedAt: new Date().toISOString(),
    state: 'Rejected',
    autoApproved: false,
  });
  return { result, mockTx };
};

describe('Transactions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should be able to generate a transaction object', async () => {
    const { transactions, connections } = createTransactionsCollection();
    const { result, mockTx } = await generateTx(connections, transactions);
    expect(result).toStrictEqual({
      id: expect.any(String),
      transaction: mockTx,
      publicKey: 'pk1',
      walletName: 'w1',
      sendingMode: 'TYPE_ASYNC',
      keyName: 'key1',
      networkId: 'n1',
      autoApproved: false,
      chainId: 'c1',
      decision: '1970-01-01T00:00:00.000Z',
      origin: 'https://example.com',
      state: 'Rejected',
      receivedAt: '1970-01-01T00:00:00.000Z',
      node: undefined,
      error: null,
      hash: null,
      code: null,
    });
  });
  it('allows adding and listing of transactions', async () => {
    const { transactions, connections } = createTransactionsCollection();
    const { result: tx1 } = await generateTx(connections, transactions);
    const { result: tx2 } = await generateTx(connections, transactions);
    const { result: tx3 } = await generateTx(connections, transactions);
    await transactions.addTx(tx1, 'w1', 'pk1');
    const { transactions: txs } = await transactions.listTxs('w1');
    expect(txs).toStrictEqual({
      pk1: [tx1],
    });
    await transactions.addTx(tx2, 'w1', 'pk2');
    await transactions.addTx(tx3, 'w1', 'pk2');
    const { transactions: txs2 } = await transactions.listTxs('w1');
    expect(txs2).toStrictEqual({
      pk1: [tx1],
      pk2: [tx3, tx2],
    });
  });
});
