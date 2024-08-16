import { VegaWallet, HARDENED } from '@vegaprotocol/crypto';
import {
  generate as generateMnemonic,
  validate,
  VALID_WORD_COUNTS,
} from '@vegaprotocol/crypto/bip-0039/mnemonic';
import ConcurrentStorage from '../lib/concurrent-storage.js';
import { TinyEventemitter } from '../lib/tiny-eventemitter.js';
import { hex, string, concat } from '@vegaprotocol/crypto/buf';
import { toMnemonic, checksum } from '@vegaprotocol/crypto/bip-0039/mnemonic';
import { sha256 } from '@vegaprotocol/crypto/crypto';

export class WalletCollection {
  constructor({ walletsStore, publicKeyIndexStore, keySortIndex }) {
    this.store = new ConcurrentStorage(walletsStore);
    this.index = new ConcurrentStorage(publicKeyIndexStore);
    this.sortIndex = new ConcurrentStorage(keySortIndex);

    this._emitter = new TinyEventemitter();
  }

  on(event, listener) {
    return this._emitter.on(event, listener);
  }

  off(event, listener) {
    return this._emitter.off(event, listener);
  }

  async get({ name }) {
    return this.store.get(name);
  }

  async getKeyInfo({ publicKey }) {
    return this.index.get(publicKey);
  }

  async getKeypair({ publicKey }) {
    return this.store.transaction(async (store) => {
      const { wallet } = (await this.index.get(publicKey)) ?? {};
      if (wallet == null) return;

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

  async listKeys({ wallet }) {
    const walletConfig = await this.get({ name: wallet });

    if (walletConfig == null) {
      throw new Error(`Cannot find wallet with name "${wallet}".`);
    }
    return walletConfig.keys;
  }

  async exportKey({ publicKey }) {
    const key = await this.getKeypair({ publicKey });

    if (key == null) {
      throw new Error(`Cannot find key with public key "${publicKey}".`);
    }

    return {
      publicKey: key.keyPair.publicKey.toString(),
      secretKey: key.keyPair.secretKey.toString(),
    };
  }

  async exportRecoveryPhrase({ walletName }) {
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

  async import({ name, recoveryPhrase, skipValidation = false }) {
    if (skipValidation !== true) {
      try {
        await validate(recoveryPhrase);

        const words = recoveryPhrase.split(/\s+/);
        if (!VALID_WORD_COUNTS.includes(words.length))
          throw new Error('Recovery phrase must be 12, 15, 18, 21 or 24 words');
      } catch (err) {
        throw new Error(err.message);
      }
    }

    return await this.store.transaction(async (store) => {
      if (await store.has(name))
        throw new Error(`Wallet with name "${name}" already exists.`);

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

  async _generateKey({ walletInstance, index, name, metadata, options }) {
    const keyPair = await walletInstance.keyPair(index);
    const publicKey = keyPair.publicKey.toString();

    if (name == null) name = `Key ${keyPair.index - HARDENED}`;

    return { name, publicKey, index: keyPair.index, metadata, options };
  }

  async generateKey({ wallet: walletName, name, metadata, options }) {
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

  async generateDerivedMnemonic({ hexStr, salt }) {
    const messageBytes = hex(hexStr);
    console.log(messageBytes);
    const bytes = await sha256(concat(string(salt), messageBytes));
    console.log(bytes);
    const checksumedEntropy = await checksum(bytes);
    console.log(checksumedEntropy);
    const words = await toMnemonic(checksumedEntropy);
    return {
      derivedMnemonic: words,
    };
  }

  async renameKey({ publicKey, name }) {
    return await this.store.transaction(async (store) => {
      const indexEntry = await this.index.get(publicKey);
      const { wallet } = indexEntry ?? {};
      if (indexEntry == null)
        throw new Error(`Cannot find key with public key "${publicKey}".`);

      const walletConfig = await store.get(wallet);
      if (walletConfig == null)
        throw new Error(`Cannot find wallet with name "${wallet}".`);

      const keyConfig = walletConfig.keys.find(
        (k) => k.publicKey === publicKey
      );
      if (keyConfig == null)
        throw new Error(`Cannot find key with public key "${publicKey}".`);

      keyConfig.name = name;
      indexEntry.name = name;

      await store.set(wallet, walletConfig);
      await this.index.set(publicKey, indexEntry);
      this._emitter.emit('rename_key', { publicKey, name });

      return keyConfig;
    });
  }
}
