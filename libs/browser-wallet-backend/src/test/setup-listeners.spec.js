// import {
//   createConnectionHandler,
//   createOnInstalledListener,
//   setupListeners,
//   update,
//   install,
//   migrations,
// } from '../lib/setup-listeners.js';
// import ConcurrentStorage from '../lib/concurrent-storage.js';
// import config from '../../config/beta.js';
// import { NetworkCollection } from '../src/network.js';
// import {
//   fairground,
//   testingNetwork,
//   testingNetwork2,
// } from '../../config/well-known-networks.js';
// import { ConnectionsCollection } from '../src/connections.js';
// import EncryptedStorage from '../lib/encrypted-storage.js';
// import { WalletCollection } from '../src/wallets.js';

describe('SetupListeners', () => {
  // beforeEach(() => {
  //   jest.resetAllMocks();
  // });
  it('does the thing', () => {
    expect(true).toBeTruthy();
  });
  // it('should call clientPorts.listen when port name is "content-script"', () => {
  //   const clientPortsMock = { listen: jest.fn() };
  //   const popupPortsMock = { listen: jest.fn() };
  //   const interactorMock = { connect: jest.fn() };
  //   const portMock = { name: 'content-script' };
  //   const connectionHandler = createConnectionHandler(
  //     clientPortsMock,
  //     popupPortsMock,
  //     interactorMock
  //   );
  //   connectionHandler(portMock);
  //   expect(clientPortsMock.listen).toHaveBeenCalledTimes(1);
  //   expect(clientPortsMock.listen).toHaveBeenCalledWith(portMock);
  // });
  // it('should call popupPorts.listen and interactor.connect when port name is "popup"', () => {
  //   const clientPortsMock = { listen: jest.fn() };
  //   const popupPortsMock = { listen: jest.fn() };
  //   const interactorMock = { connect: jest.fn() };
  //   const portMock = { name: 'popup' };
  //   const connectionHandler = createConnectionHandler(
  //     clientPortsMock,
  //     popupPortsMock,
  //     interactorMock
  //   );
  //   connectionHandler(portMock);
  //   expect(popupPortsMock.listen).toHaveBeenCalledTimes(1);
  //   expect(popupPortsMock.listen).toHaveBeenCalledWith(portMock);
  //   expect(interactorMock.connect).toHaveBeenCalledTimes(1);
  //   expect(interactorMock.connect).toHaveBeenCalledWith(portMock);
  // });
  // it('should set networks and selectedNetwork when reason is "install"', async () => {
  //   const networksMock = { set: jest.fn() };
  //   const settingsMock = { set: jest.fn() };
  //   const detailsMock = { reason: 'install' };
  //   const walletsMock = new Map();
  //   const keySortIndex = new Map();
  //   const onInstalledListener = createOnInstalledListener(
  //     networksMock,
  //     settingsMock,
  //     keySortIndex,
  //     walletsMock
  //   );
  //   await onInstalledListener(detailsMock);
  //   expect(networksMock.set).toHaveBeenCalledTimes(2);
  //   expect(networksMock.set).toHaveBeenCalledWith(
  //     testingNetwork.id,
  //     testingNetwork
  //   );
  //   expect(networksMock.set).toHaveBeenCalledWith(
  //     testingNetwork2.id,
  //     testingNetwork2
  //   );
  //   expect(settingsMock.set).toHaveBeenCalledTimes(4);
  //   expect(settingsMock.set).toHaveBeenCalledWith(
  //     'selectedNetwork',
  //     testingNetwork.id
  //   );
  //   expect(settingsMock.set).toHaveBeenCalledWith('autoOpen', true);
  //   expect(settingsMock.set).toHaveBeenCalledWith('version', migrations.length);
  // });
  // it('should create a window if autoOpenOnInstall is true', async () => {
  //   // 1113-POPT-009 The browser wallet opens in a pop-up window when the extension is installed
  //   const networksMock = { set: jest.fn() };
  //   const settingsMock = { set: jest.fn() };
  //   const walletsMock = new Map();
  //   const keySortIndex = new Map();
  //   const detailsMock = { reason: 'install' };
  //   config.autoOpenOnInstall = true;
  //   const onInstalledListener = createOnInstalledListener(
  //     networksMock,
  //     settingsMock,
  //     keySortIndex,
  //     walletsMock
  //   );
  //   await onInstalledListener(detailsMock);
  //   expect(global.browser.windows.create).toHaveBeenCalledTimes(1);
  // });
  // it('should not create a window if reason is not install', async () => {
  //   const networksMock = { set: jest.fn() };
  //   const settingsMock = { set: jest.fn() };
  //   const detailsMock = { reason: 'some-other-reason' };
  //   const walletsMock = new Map();
  //   const keySortIndex = new Map();
  //   config.autoOpenOnInstall = true;
  //   const onInstalledListener = createOnInstalledListener(
  //     networksMock,
  //     settingsMock,
  //     keySortIndex,
  //     walletsMock
  //   );
  //   await onInstalledListener(detailsMock);
  //   expect(global.browser.windows.create).toHaveBeenCalledTimes(0);
  // });
  // it('should add event listeners using createOnInstalledListener and createConnectionHandler', () => {
  //   const runtimeMock = {
  //     onInstalled: { addListener: jest.fn() },
  //     onConnect: { addListener: jest.fn() },
  //   };
  //   const networksMock = {};
  //   const settingsMock = {};
  //   const clientPortsMock = {};
  //   const popupPortsMock = {};
  //   const interactorMock = {};
  //   setupListeners(
  //     runtimeMock,
  //     networksMock,
  //     settingsMock,
  //     clientPortsMock,
  //     popupPortsMock,
  //     interactorMock
  //   );
  //   expect(runtimeMock.onInstalled.addListener).toHaveBeenCalledTimes(1);
  //   expect(runtimeMock.onInstalled.addListener).toHaveBeenCalledWith(
  //     expect.any(Function)
  //   );
  //   expect(runtimeMock.onConnect.addListener).toHaveBeenCalledTimes(1);
  //   expect(runtimeMock.onConnect.addListener).toHaveBeenCalledWith(
  //     expect.any(Function)
  //   );
  // });
  // it('should not apply migrations if installing', async () => {
  //   const settings = new ConcurrentStorage(new Map());
  //   const networks = new NetworkCollection(new Map());
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore: new Map(),
  //   });
  //   await install({ networks, settings });
  //   expect(await settings.get('version')).toBe(migrations.length);
  //   const clone = Array.from(await settings.entries());
  //   await update({ settings, connections });
  //   expect(Array.from(await settings.entries())).toEqual(clone);
  // });
  // it('should apply migrations from version null to version 1', async () => {
  //   const networks = new NetworkCollection(new Map());
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', null],
  //       ['autoOpen', null],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   expect(await settings.get('version')).toBe(migrations.length);
  //   expect(await settings.get('autoOpen')).toBe(true);
  // });
  // it('should apply migrations from version 0 to version 1', async () => {
  //   const networks = new NetworkCollection(new Map());
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', 0],
  //       ['autoOpen', null],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   expect(await settings.get('version')).toBe(migrations.length);
  //   expect(await settings.get('autoOpen')).toBe(true);
  // });
  // it('should not apply migration 1 if autoOpen is already set', async () => {
  //   const networks = new NetworkCollection(new Map());
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', 0],
  //       ['autoOpen', false],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   expect(await settings.get('version')).toBe(migrations.length);
  //   expect(await settings.get('autoOpen')).toBe(false);
  // });
  // // Add test for migration of networks
  // it('should apply migrations from version 1 to version 2', async () => {
  //   const networks = new NetworkCollection(
  //     new Map([['something', fairground]])
  //   );
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', 1],
  //       ['autoOpen', true],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await connections.set('https://example.com', {
  //     allowList: {
  //       wallets: ['w1'],
  //       publicKeys: [],
  //     },
  //     accessedAt: 0,
  //   });
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   expect(await networks.list()).toStrictEqual(['test', 'test2']);
  //   expect(await connections.get('https://example.com')).toStrictEqual({
  //     allowList: {
  //       wallets: ['w1'],
  //       publicKeys: [],
  //     },
  //     accessedAt: 0,
  //     origin: 'https://example.com',
  //     chainId: 'test-chain-id',
  //     networkId: 'test',
  //     autoConsent: false,
  //   });
  // });
  // it('should apply migrations from version 2 to version 3', async () => {
  //   const networks = new NetworkCollection(
  //     new Map([['something', fairground]])
  //   );
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', 1],
  //       ['autoOpen', true],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   await connections.set('https://example.com', {
  //     allowList: {
  //       wallets: ['w1'],
  //       publicKeys: [],
  //     },
  //     accessedAt: 0,
  //   });
  //   await update({ settings, networks, connections });
  //   expect(await networks.listNetworkDetails()).toStrictEqual([
  //     {
  //       ...testingNetwork,
  //       preferredNode: undefined,
  //       probing: false,
  //       _nodeTimeout: null,
  //     },
  //     {
  //       ...testingNetwork2,
  //       preferredNode: undefined,
  //       probing: false,
  //       _nodeTimeout: null,
  //     },
  //   ]);
  // });
  // it('should apply migrations from version 3 to version 4', async () => {
  //   const networks = new NetworkCollection(
  //     new Map([['something', fairground]])
  //   );
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', 1],
  //       ['autoOpen', true],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex: new Map(),
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   await wallets.generateKey({ wallet: 'wallet 1', name: 'key 1' });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   const initialEntries = await keySortIndex.entries();
  //   expect(Array.from(initialEntries).length).toBe(0);
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   const keySortIndexEntries = await keySortIndex.entries();
  //   expect(Array.from(keySortIndexEntries).length).toBe(1);
  // });
  // it('should apply migrations from version 3 to version 4', async () => {
  //   const networks = new NetworkCollection(
  //     new Map([['something', fairground]])
  //   );
  //   const settings = new ConcurrentStorage(
  //     new Map([
  //       ['version', 1],
  //       ['autoOpen', true],
  //     ])
  //   );
  //   const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
  //   await enc.create('p');
  //   const publicKeyIndexStore = new ConcurrentStorage(new Map());
  //   const keySortIndex = new ConcurrentStorage(new Map());
  //   const wallets = new WalletCollection({
  //     walletsStore: enc,
  //     publicKeyIndexStore,
  //     keySortIndex: new Map(),
  //   });
  //   await wallets.import({
  //     name: 'wallet 1',
  //     recoveryPhrase: await wallets.generateRecoveryPhrase(),
  //   });
  //   await wallets.generateKey({ wallet: 'wallet 1', name: 'key 1' });
  //   const connections = new ConnectionsCollection({
  //     connectionsStore: new Map(),
  //     publicKeyIndexStore,
  //     keySortIndex,
  //   });
  //   await connections.set('https://example.com', {
  //     allowList: {
  //       wallets: ['w1'],
  //       publicKeys: [],
  //     },
  //     accessedAt: 0,
  //   });
  //   await update({ settings, networks, connections, wallets, keySortIndex });
  //   expect(await connections.get('https://example.com')).toStrictEqual({
  //     allowList: {
  //       wallets: ['w1'],
  //       publicKeys: [],
  //     },
  //     accessedAt: 0,
  //     origin: 'https://example.com',
  //     chainId: 'test-chain-id',
  //     networkId: 'test',
  //     autoConsent: false,
  //   });
  // });
});
