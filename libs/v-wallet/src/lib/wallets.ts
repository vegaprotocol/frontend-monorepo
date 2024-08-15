// @ts-ignore -- @vegaprotocol/crypto is not typed
import { VegaWallet, HARDENED, type KeyPair } from '@vegaprotocol/crypto';
import {
  generate as generateMnemonic,
  validate,
  VALID_WORD_COUNTS,
  // @ts-ignore -- @vegaprotocol/crypto is not typed
} from '@vegaprotocol/crypto/bip-0039/mnemonic';
import { ConcurrentStorage } from './storage/concurrent-storage';
import { type Listener, TinyEventemitter } from './tiny-eventemitter';
import { type AbstractStorage } from './storage/storage';

interface KeyInfo {
  name: string;
  wallet: string;
  publicKey: string;
}

interface WalletStore {
  // TODO this is actually a Uint8Array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seed: any[];
  recoveryPhrase: string;
  keys: KeyPair[];
}

export class WalletCollection {
  store: ConcurrentStorage<WalletStore>;
  index: ConcurrentStorage<KeyInfo>;
  sortIndex: ConcurrentStorage;
  _emitter: TinyEventemitter;

  constructor({
    walletsStore,
    publicKeyIndexStore,
    keySortIndex,
  }: {
    walletsStore: AbstractStorage<WalletStore>;
    publicKeyIndexStore: AbstractStorage<KeyInfo>;
    keySortIndex: AbstractStorage;
  }) {
    this.store = new ConcurrentStorage<WalletStore>(walletsStore);
    this.index = new ConcurrentStorage<KeyInfo>(publicKeyIndexStore);
    this.sortIndex = new ConcurrentStorage(keySortIndex);

    this._emitter = new TinyEventemitter();
  }

  on(event: string, listener: Listener) {
    return this._emitter.on(event, listener);
  }

  off(event: string, listener: Listener) {
    return this._emitter.off(event, listener);
  }

  async get({ name }: { name: string }) {
    return this.store.get(name);
  }

  async getKeyInfo({ publicKey }: { publicKey: string }) {
    return this.index.get(publicKey);
  }

  async getKeypair({ publicKey }: { publicKey: string }) {
    return this.store.transaction(async (store) => {
      const keyInfo = (await this.index.get(publicKey)) ?? {};
      if (keyInfo == null) return;
      const { wallet } = keyInfo;
      const walletConfig = await store.get(wallet);
      if (walletConfig == null) return;

      const keyConfig = walletConfig.keys.find(
        (k) => k.publicKey === publicKey
      );
      if (keyConfig == null) return;

      const walletInst = await VegaWallet.fromSeed(
        new Uint8Array(walletConfig.seed)
      );
      const keyPair = await walletInst.keyPair(keyConfig.index);
      return {
        keyPair,
        wallet,
        ...keyConfig,
      };
    });
  }

  async list() {
    return Array.from(await this.store.keys());
  }

  async listKeys({ wallet }: { wallet: string }) {
    const walletConfig = await this.get({ name: wallet });

    if (walletConfig == null) {
      throw new Error(`Cannot find wallet with name "${wallet}".`);
    }
    return walletConfig.keys;
  }

  async exportKey({ publicKey }: { publicKey: string }) {
    const key = await this.getKeypair({ publicKey });

    if (key == null) {
      throw new Error(`Cannot find key with public key "${publicKey}".`);
    }

    return {
      publicKey: key.keyPair.publicKey.toString(),
      secretKey: key.keyPair.secretKey.toString(),
    };
  }

  async exportRecoveryPhrase({ walletName }: { walletName: string }) {
    const wallet = await this.store.get(walletName);

    if (wallet == null) {
      throw new Error(`Cannot find wallet "${walletName}".`);
    }

    return { recoveryPhrase: wallet.recoveryPhrase };
  }

  async generateRecoveryPhrase() {
    const bitStrength = 256; // 24 words
    return (await generateMnemonic(bitStrength)).join(' ');
  }

  async import({
    name,
    recoveryPhrase,
    skipValidation = false,
  }: {
    name: string;
    recoveryPhrase: string;
    skipValidation?: boolean;
  }) {
    if (skipValidation !== true) {
      try {
        await validate(recoveryPhrase);

        const words = recoveryPhrase.split(/\s+/);
        if (!VALID_WORD_COUNTS.includes(words.length)) {
          throw new Error('Recovery phrase must be 12, 15, 18, 21 or 24 words');
        }
      } catch (err) {
        // @ts-ignore -- needs to be fixed as non-error type could (theoretically) be thrown
        throw new Error(err.message);
      }
    }

    return await this.store.transaction(async (store) => {
      if (await store.has(name)) {
        throw new Error(`Wallet with name "${name}" already exists.`);
      }

      const seed = await VegaWallet.deriveSeed(recoveryPhrase);

      await store.set(name, {
        seed: Array.from(seed),
        recoveryPhrase,
        keys: [],
      });
      this._emitter.emit('create_wallet', { name });

      return null;
    });
  }

  async _generateKey({
    walletInstance,
    index,
    name,
    metadata,
    options,
  }: {
    walletInstance: VegaWallet;
    index: number;
    name?: string;
    metadata?: Record<string, unknown>;
    options?: Record<string, unknown>;
  }) {
    const keyPair = await walletInstance.keyPair(index);
    const publicKey = keyPair.publicKey.toString();

    if (name == null) name = `Key ${keyPair.index - HARDENED}`;

    return { name, publicKey, index: keyPair.index, metadata, options };
  }

  async generateKey({
    wallet: walletName,
    name,
    metadata,
    options,
  }: {
    wallet: string;
    name?: string;
    metadata?: Record<string, unknown>;
    options?: Record<string, unknown>;
  }) {
    return await this.store.transaction(async (store) => {
      const walletConfig = await store.get(walletName);

      if (walletConfig == null) {
        throw new Error(`Cannot find wallet with name "${walletName}".`);
      }

      const wallet = await VegaWallet.fromSeed(
        new Uint8Array(walletConfig.seed)
      );

      const lastKey = walletConfig.keys.at(-1) ?? {};
      const lastKeyIndex = lastKey.index ? lastKey.index + 1 : HARDENED;
      const key = await this._generateKey({
        walletInstance: wallet,
        name,
        metadata,
        options,
        index: lastKeyIndex,
      });

      walletConfig.keys.push(key);
      await store.set(walletName, walletConfig);

      await this.index.set(key.publicKey, {
        name: key.name,
        wallet: walletName,
        publicKey: key.publicKey,
      });
      const sortIndex = Array.from(await this.sortIndex.keys()).length;
      await this.sortIndex.set(key.publicKey, sortIndex);
      this._emitter.emit('create_key', {
        publicKey: key.publicKey,
        name: key.name,
      });

      return key;
    });
  }

  async renameKey({ publicKey, name }: { publicKey: string; name: string }) {
    return await this.store.transaction(async (store) => {
      const indexEntry = await this.index.get(publicKey);
      const { wallet } = indexEntry ?? {};
      if (indexEntry == null) {
        throw new Error(`Cannot find key with public key "${publicKey}".`);
      }

      const walletConfig = await store.get(wallet);
      if (walletConfig == null) {
        throw new Error(`Cannot find wallet with name "${wallet}".`);
      }

      const keyConfig = walletConfig.keys.find(
        (k) => k.publicKey === publicKey
      );
      if (keyConfig == null) {
        throw new Error(`Cannot find key with public key "${publicKey}".`);
      }

      keyConfig.name = name;
      indexEntry.name = name;

      await store.set(wallet, walletConfig);
      await this.index.set(publicKey, indexEntry);
      this._emitter.emit('rename_key', { publicKey, name });

      return keyConfig;
    });
  }
}
