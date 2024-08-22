import initAdminServer from '../src/admin-ns.js';
import { WalletCollection } from '../src/wallets.js';
import { NetworkCollection, Network } from '../src/network.js';
import ConcurrentStorage from '../lib/concurrent-storage.js';
import EncryptedStorage from '../lib/encrypted-storage.js';
import { ConnectionsCollection } from '../src/connections.js';
import { FetchCache } from '../src/fetch-cache.js';

import { createHTTPServer, createJSONHTTPServer } from './helpers.js';
import { testingNetwork } from '../../config/well-known-networks.js';

const createAdmin = async ({
  passphrase,
  datanodeUrls = testingNetwork.rest,
} = {}) => {
  const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  const publicKeyIndexStore = new ConcurrentStorage(new Map());
  const keySortIndex = new ConcurrentStorage(new Map());
  const wallets = new WalletCollection({
    walletsStore: enc,
    publicKeyIndexStore,
    keySortIndex,
  });
  const server = initAdminServer({
    encryptedStore: enc,
    settings: new ConcurrentStorage(
      new Map([['selectedNetwork', 'fairground']])
    ),
    wallets,
    connections: new ConnectionsCollection({
      connectionsStore: new ConcurrentStorage(new Map()),
      publicKeyIndexStore,
    }),
    networks: new NetworkCollection(
      new Map([
        [
          testingNetwork.id,
          new Network({
            ...testingNetwork,
            rest: datanodeUrls,
          }),
        ],
      ])
    ),
    fetchCache: new FetchCache(new Map()),
    onerror(err) {
      throw err;
    },
  });

  if (passphrase) {
    await server.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.create_passphrase',
      params: { passphrase },
    });
  }

  return {
    admin: server,
  };
};

const REQ_APP_GLOBALS = (id) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.app_globals',
  params: null,
});

const REQ_LOCK = (id) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.lock',
  params: null,
});

const REQ_UNLOCK = (id, passphrase) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.unlock',
  params: {
    passphrase,
  },
});

// Request templates to make it easier to read the tests
const REQ_GENERATE_RECOVERY_PHRASE = (id) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.generate_recovery_phrase',
  params: null,
});

const REQ_IMPORT_WALLET = (id, recoveryPhrase, name = 'Wallet 1') => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.import_wallet',
  params: {
    name,
    recoveryPhrase,
  },
});

const REQ_GENERATE_KEY = (id, name = 'Key 1', wallet = 'Wallet 1') => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.generate_key',
  params: {
    name,
    wallet,
  },
});

const REQ_EXPORT_KEY = (id, publicKey, passphrase) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.export_key',
  params: {
    publicKey,
    passphrase,
  },
});

const REQ_EXPORT_RECOVERY_PHRASE = (id, walletName, passphrase) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.export_recovery_phrase',
  params: {
    walletName,
    passphrase,
  },
});

const REQ_RENAME_KEY = (id, publicKey, name) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.rename_key',
  params: {
    publicKey,
    name,
  },
});

const REQ_LIST_KEYS = (id, wallet = 'Wallet 1') => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.list_keys',
  params: {
    wallet,
  },
});

const REQ_LIST_WALLETS = (id) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.list_wallets',
  params: null,
});

const REQ_FETCH = (id, path) => ({
  jsonrpc: '2.0',
  id,
  method: 'admin.fetch',
  params: {
    path,
    networkId: testingNetwork.id,
  },
});

describe('admin-ns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return app globals', async () => {
    const { admin } = await createAdmin();
    const appGlobals = await admin.onrequest(
      { jsonrpc: '2.0', id: 1, method: 'admin.app_globals', params: null },
      {}
    );
    expect(appGlobals.result.passphrase).toBe(false);
    expect(appGlobals.result.wallet).toBe(false);
    expect(appGlobals.result.locked).toBe(false);
    expect(/^\d+\.\d+\.\d+$/.test(appGlobals.result.version)).toBe(true);
    expect(appGlobals.result.settings).toEqual({
      selectedNetwork: 'fairground',
    });
  });

  it('should update app settings', async () => {
    const { admin } = await createAdmin();
    const updateAppSettings = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.update_app_settings',
      params: { telemetry: false },
    });

    expect(updateAppSettings.result).toBe(null);
    const appGlobals2 = await admin.onrequest(
      { jsonrpc: '2.0', id: 1, method: 'admin.app_globals', params: null },
      {}
    );
    expect(appGlobals2.result.settings.telemetry).toBe(false);
  });

  it('should create passphrase', async () => {
    const { admin } = await createAdmin();

    const createPassphrase = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.create_passphrase',
      params: { passphrase: 'foo' },
    });
    expect(createPassphrase.result).toBe(null);
    const appGlobals3 = await admin.onrequest(
      { jsonrpc: '2.0', id: 1, method: 'admin.app_globals', params: null },
      {}
    );
    expect(appGlobals3.result.passphrase).toBe(true);
  });

  it('should generate recovery phrase', async () => {
    const { admin } = await createAdmin();

    const generateRecoveryPhrase = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.generate_recovery_phrase',
      params: null,
    });
    expect(generateRecoveryPhrase.result.recoveryPhrase.split(' ').length).toBe(
      24
    );
  });

  it('should list networks', async () => {
    const { admin } = await createAdmin();

    const listNetworks = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.list_networks',
      params: null,
    });

    expect(listNetworks.result).toEqual({
      networks: [
        {
          _nodeTimeout: null,
          arbitrumChainId: '421614',
          arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
          chainId: 'test-chain-id',
          console: 'https://console.fairground.wtf',
          docs: 'https://docs.vega.xyz/testnet/concepts/new-to-vega',
          ethereumChainId: '11155111',
          ethereumExplorerLink: 'https://sepolia.etherscan.io',
          explorer: 'https://explorer.fairground.wtf',
          governance: 'https://governance.fairground.wtf',
          hidden: false,
          color: '#D7FB50',
          secondaryColor: '#000000',
          id: 'test',
          name: 'Test',
          preferredNode: undefined,
          probing: false,
          rest: ['http://localhost:9090'],
          vegaDapps: 'https://vega.xyz/apps',
        },
      ],
    });
  });

  it('should create wallet', async () => {
    const { admin } = await createAdmin({ passphrase: 'foo' });

    const generateRecoveryPhrase = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.generate_recovery_phrase',
      params: null,
    });

    const importWallet = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.import_wallet',
      params: {
        name: 'Wallet 1',
        recoveryPhrase: generateRecoveryPhrase.result.recoveryPhrase,
      },
    });

    expect(importWallet.result).toEqual(null);
  });

  it('should not be able to unlock an uninitialised wallet', async () => {
    const { admin } = await createAdmin();

    const unlockFailure = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.unlock',
      params: {
        passphrase: 'foo',
      },
    });

    expect(unlockFailure.error).toEqual({
      code: 1,
      message: 'Encryption not initialised',
    });
  });

  it('app_globals should be true after creating a wallet, locking and unlocking', async () => {
    const { admin } = await createAdmin({ passphrase: 'foo' });

    const generateRecoveryPhrase = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.generate_recovery_phrase',
      params: null,
    });

    const importWallet = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.import_wallet',
      params: {
        name: 'Wallet 1',
        recoveryPhrase: generateRecoveryPhrase.result.recoveryPhrase,
      },
    });

    expect(importWallet.result).toEqual(null);

    // Lock the wallet
    await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.lock',
      params: null,
    });

    const unlockSuccess = await admin.onrequest(REQ_UNLOCK(1, 'foo'));
    const appGlobals = await admin.onrequest(REQ_APP_GLOBALS(2));

    expect(unlockSuccess.result).toEqual(null);
    expect(appGlobals.result.wallet).toEqual(true);
  });

  it('should stay locked after a failed unlock', async () => {
    const { admin } = await createAdmin({ passphrase: 'foo' });

    // Check precondition
    const appGlobalsPre = await admin.onrequest(REQ_APP_GLOBALS(1));
    expect(appGlobalsPre.result.locked).toBe(false);

    // Lock the wallet
    await admin.onrequest(REQ_LOCK(2));

    // Check postcondition
    const appGlobalsPost = await admin.onrequest(REQ_APP_GLOBALS(3));
    expect(appGlobalsPost.result.locked).toBe(true);

    // Unlock with wrong passphrase
    const wrongUnlockAttept = await admin.onrequest(
      REQ_UNLOCK(4, 'wrong-passphrase')
    );
    expect(wrongUnlockAttept.error).toEqual({
      code: 1,
      message: 'Invalid passphrase or corrupted storage',
    });

    // Check postcondition
    const appGlobalsPost2 = await admin.onrequest(REQ_APP_GLOBALS(5));
    expect(appGlobalsPost2.result.locked).toBe(true);
  });

  it('should list connections', async () => {
    const { admin } = await createAdmin();

    const listConnections = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.list_connections',
      params: null,
    });

    expect(listConnections.result).toEqual({ connections: [] });
  });

  it('should sign message with given public key', async () => {
    const { admin } = await createAdmin({ passphrase: 'foo' });

    const importWallet = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.import_wallet',
      params: {
        name: 'Wallet 1',
        recoveryPhrase:
          'mandate verify garage episode glimpse evidence erosion resist fit razor fluid theme remember penalty address media claim beach fiscal taste impact lucky test survey',
      },
    });

    expect(importWallet.result).toEqual(null);

    const generateKey = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.generate_key',
      params: {
        name: 'Key 1',
        wallet: 'Wallet 1',
      },
    });
    const generateKey2 = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.generate_key',
      params: {
        name: 'Key 2',
        wallet: 'Wallet 1',
      },
    });

    const publicKey = generateKey.result.publicKey;

    const message = ' ';

    const signMessage = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.sign_message',
      params: {
        publicKey,
        message,
      },
    });

    expect(signMessage.result).toEqual({
      signature:
        'GJalQpvoDikaGkSFxI80nhscSUQDtbVUbwry7sZS1Y89CjH+DmfYFD3/I3uiliMrG7b5iC+gJxWETqi41+x1BQ==',
    });

    const message2 = 'Hello World';

    const signMessage2 = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.sign_message',
      params: {
        publicKey,
        message: message2,
      },
    });

    expect(signMessage2.result).toEqual({
      signature:
        '1CcvhvS2RY1kqhSCE2V/5JrKD6pp4ez/4z84qrgjurFmtgZQD+KHresPEYz6V3NaDiSaDMfPUW+UxPdTFzjlDQ==',
    });

    const publicKey2 = generateKey2.result.publicKey;

    const signMessage3 = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.sign_message',
      params: {
        publicKey: publicKey2,
        message,
      },
    });

    expect(signMessage3.result).toEqual({
      signature:
        'RdgrLZBovd0sCY4RcVFTF5aebV5TwbxkohhpvnJZMw0a1c0+50jqtJqaVTBBf4B3C1PlbvNGfGl4BMiqrr9DAA==',
    });

    const signMessage4 = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.sign_message',
      params: {
        publicKey: publicKey2,
        message: message2,
      },
    });

    expect(signMessage4.result).toEqual({
      signature:
        '2tCYSehD1WO0udvU1P92UzkP4BoPB4NLxs3JCGwFKb9oD86njCXoGrVgE1k2zpM7Tcjs3HzSBg8bDCTm3FjUBQ==',
    });
  });

  it('should proxy requests to healthy data node on fetch', async () => {
    const chainHeight = {
      height: '2',
      chainId: 'testnet',
    };

    const expected = {
      assets: ['asset1', 'asset2'],
    };

    const happyServer = await createJSONHTTPServer((req) => {
      if (req.url === '/blockchain/height') return { body: chainHeight };

      return { body: expected };
    });

    const sadServer = await createJSONHTTPServer(() => {
      return { statusCode: 500 };
    });

    const malformedServer = await createHTTPServer((req, res) => {
      return res.end('<Malformed JSON>');
    });

    const { admin } = await createAdmin({
      datanodeUrls: [happyServer.url, sadServer.url, malformedServer.url],
    });

    const fetch = await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.fetch',
      params: {
        networkId: testingNetwork.id,
        path: '/assets',
      },
    });

    expect(fetch.result).toEqual(expected);

    await Promise.all([
      happyServer.close(),
      sadServer.close(),
      malformedServer.close(),
    ]);
  });

  it(
    'should return errors from unsuccessful fetch (statusCode)',
    setupFaultyFetch({
      statusCode: 400,
      body: '',
    })
  );

  it(
    'should return errors from unsuccessful fetch (malformed response)',
    setupFaultyFetch({
      statusCode: 200,
      body: '<Malformed JSON>',
    })
  );

  function setupFaultyFetch(faultyResponse) {
    return async () => {
      const chainHeight = {
        height: '2',
        chainId: 'testnet',
      };

      const server = await createHTTPServer((req, res) => {
        if (req.url === '/blockchain/height')
          return res.end(JSON.stringify(chainHeight));

        res.writeHead(faultyResponse.statusCode, {
          'Content-Type': 'application/json',
        });
        res.end(faultyResponse.body);
      });

      const { admin } = await createAdmin({ datanodeUrls: [server.url] });

      const fetch = await admin.onrequest(REQ_FETCH(1, '/assets'));

      expect(fetch.result).toBeUndefined();
      expect(fetch.error).toEqual({
        code: -1,
        message: 'Failed to fetch data',
        data: expect.any(String),
      });

      await Promise.all([server.close()]);
    };
  }

  it('should cache results for select endpoints', async () => {
    jest.useFakeTimers();

    const chainHeight = {
      height: '2',
      chainId: testingNetwork.id,
    };

    const server = await createJSONHTTPServer((req) => {
      if (req.url === '/blockchain/height') return { body: chainHeight };

      return { body: Date.now() };
    });

    const { admin } = await createAdmin({ datanodeUrls: [server.url] });

    const fetch1 = await admin.onrequest(REQ_FETCH(1, '/api/v2/assets'));
    jest.advanceTimersByTime(1);
    const fetch2 = await admin.onrequest(REQ_FETCH(2, '/api/v2/assets'));
    expect(fetch2.result).toEqual(fetch1.result, 'should return cached result');

    jest.advanceTimersByTime(1000 * 60 * 60 * 24 * 7); // 1 week

    const fetch3 = await admin.onrequest(REQ_FETCH(3, '/api/v2/assets'));

    expect(fetch3.result).not.toEqual(
      fetch2.result,
      'should not return cached result after long delay'
    );

    await Promise.all([server.close()]);

    jest.useRealTimers();
  });
});

const setupWallet = async (passphrase) => {
  const { admin } = await createAdmin({ passphrase });

  const generateRecoveryPhrase = await admin.onrequest(
    REQ_GENERATE_RECOVERY_PHRASE(1)
  );
  expect(generateRecoveryPhrase.error).toBeUndefined();

  const importWallet = await admin.onrequest(
    REQ_IMPORT_WALLET(2, generateRecoveryPhrase.result.recoveryPhrase)
  );
  expect(importWallet.error).toBeUndefined();

  const generateKey = await admin.onrequest(REQ_GENERATE_KEY(3));
  expect(generateKey.error).toBeUndefined();

  const key = generateKey.result;
  return {
    key,
    admin,
  };
};

describe('admin.export_key', () => {
  const passphrase = 'foo';
  let admin;
  let key;
  beforeEach(async () => {
    const { admin: setupAdmin, key: setupKey } = await setupWallet(passphrase);
    admin = setupAdmin;
    key = setupKey;
  });

  afterEach(() => {
    admin = null;
    key = null;
  });

  it('should not export key with wrong public key', async () => {
    const exportKey = await admin.onrequest(
      REQ_EXPORT_KEY(4, 'wrong-public-key', passphrase)
    );
    expect(exportKey.error).toMatchObject({
      code: 1,
      message: expect.stringMatching(/Cannot find key with public key/),
    });
  });

  it('should not export key with wrong passphrase', async () => {
    const exportKey = await admin.onrequest(
      REQ_EXPORT_KEY(4, key.publicKey, 'wrong-passphrase')
    );
    expect(exportKey.error).toEqual({
      code: 1,
      message: 'Invalid passphrase or corrupted storage',
    });
  });

  it('should export key', async () => {
    const exportKey = await admin.onrequest(
      REQ_EXPORT_KEY(4, key.publicKey, passphrase)
    );
    expect(exportKey.error).toBeUndefined();
    expect(exportKey.result.publicKey).toBe(key.publicKey);
    expect(exportKey.result.secretKey).not.toBeNull();
  });
});

describe('admin.export_recovery_phrase', () => {
  const passphrase = 'foo';
  let admin;
  let key;
  beforeEach(async () => {
    const { admin: setupAdmin, key: setupKey } = await setupWallet(passphrase);
    admin = setupAdmin;
    key = setupKey;
  });

  afterEach(() => {
    admin = null;
    key = null;
  });

  it('should not export key with wrong wallet', async () => {
    const exportKey = await admin.onrequest(
      REQ_EXPORT_RECOVERY_PHRASE(4, 'Wrong wallet', passphrase)
    );
    expect(exportKey.error).toMatchObject({
      code: 1,
      message: expect.stringMatching(/Cannot find wallet "Wrong wallet"./),
    });
  });

  it('should not export key with wrong passphrase', async () => {
    const exportKey = await admin.onrequest(
      REQ_EXPORT_RECOVERY_PHRASE(4, 'Wallet 1', 'wrong-passphrase')
    );
    expect(exportKey.error).toEqual({
      code: 1,
      message: 'Invalid passphrase or corrupted storage',
    });
  });

  it('should export key', async () => {
    const exportKey = await admin.onrequest(
      REQ_EXPORT_KEY(4, key.publicKey, passphrase)
    );
    expect(exportKey.error).toBeUndefined();
    expect(exportKey.result.publicKey).toBe(key.publicKey);
    expect(exportKey.result.secretKey).not.toBeNull();
  });
});

describe('admin.rename_key', () => {
  const passphrase = 'foo';
  let admin;
  let key;
  beforeEach(async () => {
    const { admin: setupAdmin, key: setupKey } = await setupWallet(passphrase);
    admin = setupAdmin;
    key = setupKey;
  });

  afterEach(() => {
    admin = null;
    key = null;
  });

  it('should not rename key with wrong public key', async () => {
    const renameKey = await admin.onrequest(
      REQ_RENAME_KEY(4, 'wrong-public-key', 'New Name')
    );
    expect(renameKey.error).toMatchObject({
      code: 1,
      message: expect.stringMatching(/Cannot find key with public key/),
    });

    const listKeys = await admin.onrequest(REQ_LIST_KEYS(5));
    expect(listKeys.error).toBeUndefined();
    expect(listKeys.result.keys).toEqual([{ ...key, name: 'Key 1' }]);
  });

  it('should rename key', async () => {
    const renameKey = await admin.onrequest(
      REQ_RENAME_KEY(4, key.publicKey, 'New Name')
    );
    expect(renameKey.error).toBeUndefined();

    const listKeys = await admin.onrequest(REQ_LIST_KEYS(5));
    expect(listKeys.error).toBeUndefined();
    expect(listKeys.result.keys).toEqual([{ ...key, name: 'New Name' }]);

    const blankRename = await admin.onrequest(
      REQ_RENAME_KEY(6, key.publicKey, '')
    );
    expect(blankRename.error).toBeUndefined();

    const listKeys2 = await admin.onrequest(REQ_LIST_KEYS(7));
    expect(listKeys2.error).toBeUndefined();
    expect(listKeys2.result.keys).toEqual([{ ...key, name: '' }]);
  });

  it('should allow multiple keys with same name', async () => {
    const generateKey2 = await admin.onrequest(REQ_GENERATE_KEY(4, 'Key 1'));
    expect(generateKey2.error).toBeUndefined();

    const listKeys = await admin.onrequest(REQ_LIST_KEYS(5));
    expect(listKeys.error).toBeUndefined();
    expect(listKeys.result.keys).toEqual([
      { ...key, name: 'Key 1' },
      { ...generateKey2.result, name: 'Key 1' },
    ]);

    const renameKey = await admin.onrequest(
      REQ_RENAME_KEY(6, generateKey2.result.publicKey, 'New Name')
    );
    expect(renameKey.error).toBeUndefined();

    const renameKey2 = await admin.onrequest(
      REQ_RENAME_KEY(7, key.publicKey, 'New Name')
    );
    expect(renameKey2.error).toBeUndefined();

    const listKeys2 = await admin.onrequest(REQ_LIST_KEYS(8));
    expect(listKeys2.error).toBeUndefined();
    expect(listKeys2.result.keys).toEqual([
      { ...key, name: 'New Name' },
      { ...generateKey2.result, name: 'New Name' },
    ]);
  });
});

describe('admin.delete_wallet', () => {
  const passphrase = 'foo';
  let admin;
  beforeEach(async () => {
    const { admin: setupAdmin } = await setupWallet(passphrase);
    admin = setupAdmin;
  });

  afterEach(() => {
    admin = null;
  });

  it('allows deletion of a wallet', async () => {
    const res = await admin.onrequest(REQ_LIST_WALLETS(1));
    expect(res.result.wallets).toEqual(['Wallet 1']);
    await admin.onrequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'admin.delete_wallet',
      params: {
        name: 'Wallet 1',
      },
    });

    const res2 = await admin.onrequest(REQ_LIST_WALLETS(2));

    expect(res2.result.wallets).toEqual([]);
  });
});
