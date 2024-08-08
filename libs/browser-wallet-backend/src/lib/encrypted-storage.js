import { encrypt, decrypt } from '@vegaprotocol/crypto/encryption'
import { toBase64, base64 as fromBase64, string as fromString, toString } from '@vegaprotocol/crypto/buf'
import { RWLock } from './rw-lock.js'

const READ_METHODS = ['get', 'has', 'entries', 'keys', 'values']
const WRITE_METHODS = ['set', 'delete', 'clear']

// TODO: Incorporate this into Storage
function getMany(map, keys) {
  return Promise.all(keys.map((key) => map.get(key)))
}

// TODO: Incorporate this into Storage
function setMany(map, entries) {
  return Promise.all(entries.map(([key, value]) => map.set(key, value)))
}

async function _load(storage, key) {
  const [ciphertext, salt, kdfParams] = await getMany(storage, ['ciphertext', 'salt', 'kdfParams'])

  if (ciphertext == null || salt == null || kdfParams == null) {
    return []
  }

  try {
    const plaintext = await decrypt(key, fromBase64(ciphertext), fromBase64(salt), kdfParams)
    return JSON.parse(toString(plaintext))
  } catch (err) {
    const isOperationError = err.name === 'OperationError'
    const isInvalidState = err.message === 'Unsupported state or unable to authenticate data'

    if (isOperationError || isInvalidState) {
      throw new Error('Invalid passphrase or corrupted storage')
    }

    throw err
  }
}

async function _save(storage, values, key, kdfSettings) {
  const plaintext = fromString(JSON.stringify(Array.from(values)))
  const { ciphertext, salt, kdfParams } = await encrypt(key, plaintext, kdfSettings)

  return setMany(storage, [
    ['ciphertext', toBase64(ciphertext)],
    ['salt', toBase64(salt)],
    ['kdfParams', kdfParams]
  ])
}

const PERSISTENT_STORAGE_KEY = 'persisted-phrase'

export default class LockedStorage {
  /**
   * @param {Storage} storage - The underlying storage.
   * @param {Object} kdfSettings - The key derivation function settings.
   * @param {Boolean} persist - persist
   */
  constructor(storage, kdfSettings, persist) {
    /**
     * Whether the storage is locked.
     * @readonly
     * @type {boolean}
     */
    this.locked = true

    /** @private */
    this._locking = null
    /** @private */
    this._unlocking = null

    /** @private */
    this._storage = storage
    /** @private */
    this._kdfSettings = kdfSettings

    /** @private */
    this._key = persist
      ? storage.get(PERSISTENT_STORAGE_KEY).then((key) => {
          if (key) {
            this.unlock(fromBase64(key))
          }
        })
      : null
    /** @private */
    this._cache = null
    /** @private */
    this._mutex = null
    /** @private */
    this.persist = persist

    WRITE_METHODS.forEach((method) => {
      this[method] = (...args) =>
        this._dowrite(async () => {
          await this._cache[method](...args)
          await _save(this._storage, this._cache.entries(), this._key, this._kdfSettings)
        })
    })

    READ_METHODS.forEach((method) => {
      this[method] = (...args) => this._doread(() => this._cache[method](...args))
    })
  }

  /**
   * Flag indicating if the storage is currently being unlocked.
   * @type {boolean}
   */
  get unlocking() {
    return this._unlocking != null
  }

  /**
   * Falg indicating if the storage is currently being locked.
   * @type {boolean}
   */
  get locking() {
    return this._locking != null
  }

  /**
   * @deprecated use `locked` instead
   * @returns {boolean}
   */
  get isLocked() {
    return this.locked
  }

  /** @private */
  async _dowrite(fn) {
    if (this.locked) throw new Error('Storage is locked')
    if (this.unlocking) throw new Error('Storage is unlocking')
    if (this.locking) throw new Error('Storage is locking')

    return this._mutex.write(() => {
      if (this.locked) throw new Error('Storage is locked')
      if (this.unlocking) throw new Error('Storage is unlocking')

      return fn()
    })
  }

  /** @private */
  async _doread(fn) {
    if (this.locked) throw new Error('Storage is locked')
    if (this.unlocking) throw new Error('Storage is unlocking')
    if (this.locking) throw new Error('Storage is locking')

    return this._mutex.read(async () => {
      if (this.locked) throw new Error('Storage is locked')
      if (this.unlocking) throw new Error('Storage is unlocking')

      return fn()
    })
  }

  /**
   * Verify that the given passphrase is equal to the one used to encrypt the storage.
   * Only unlocked storage can be verified.
   * @param {string} passphrase - The passphrase to verify.
   * @returns {boolean} - Whether the passphrase is valid.
   * @throws {Error} - If the storage is locked.
   */
  verifyPassphrase(passphrase) {
    if (this._key == null) throw new Error('Storage is already locked')

    const passphraseBuf = fromString(passphrase)
    if (passphraseBuf.byteLength !== this._key.byteLength) return false
    return passphraseBuf.every((b, i) => b === this._key[i])
  }

  /**
   * Check if the encrypted storage exists and is populated.
   * @returns {Promise<boolean>} - Whether the storage exists and is populated.
   */
  async exists() {
    return Array.from(await this._storage.entries()).length > 0
  }

  /**
   * Create a new encrypted storage. Can only be called once and only if the storage does not already exist.
   * If the existing storage should be overwritten, pass `true` as the second argument.
   * Creating a new storage will unlock it.
   *
   * @param {string} passphrase - the encryption key.
   * @param {boolean} [overwrite=false] - whether to overwrite the existing storage.
   * @returns {Promise<void>}
   * @throws {Error} - if the storage already exists.
   * @throws {Error} - if the storage is already unlocked.
   * @throws {Error} - if the storage is currently locking.
   */
  async create(passphrase, overwrite = false) {
    if (this.unlocking) await this._unlocking
    if (!this.locked) throw new Error('Storage is unlocked')
    if (this.locking) throw new Error('Storage is locking')

    const key = fromString(passphrase)
    this._unlocking = this.exists()
      .then((exists) => {
        if (!overwrite && exists) {
          throw new Error('Storage already exists')
        }
      })
      .then(() => {
        return _save(this._storage, [], key, this._kdfSettings)
      })
      .then(() => {
        this._key = key
        this._cache = new Map()
        this._mutex = new RWLock()
        this.locked = false
        if (this.persist) {
          const storedKey = toBase64(key)
          this._storage.set(PERSISTENT_STORAGE_KEY, storedKey)
        }
      })
      .finally(() => {
        this._unlocking = null
      })

    await this._unlocking
  }

  /**
   * Open the encrypted storage and decrypt. Can only be called once. Unlocking an unlocked storage throws an error.
   *
   * @param {string} passphrase - the decryption key.
   * @returns {Promise<void>}
   * @throws {Error} - if the storage is already unlocked or currently unlocking.
   * @throws {Error} - if the passphrase is incorrect.
   */
  async unlock(passphrase) {
    if (this.locking) await this._locking
    if (this.unlocking) throw new Error('Storage is unlocking')
    if (!this.locked) throw new Error('Storage is unlocked')

    const key = fromString(passphrase)
    this._unlocking = _load(this._storage, key)
      .then((values) => {
        this._key = key
        this._cache = new Map(values)
        this._mutex = new RWLock()
        this.locked = false
        if (this.persist) {
          const storedKey = toBase64(key)
          this._storage.set(PERSISTENT_STORAGE_KEY, storedKey)
        }
      })
      .finally(() => {
        this._unlocking = null
      })

    await this._unlocking
  }

  /**
   * Lock the encrypte storage, saving and clearing the in-memory state.
   * Multiple concurrent lock calls are coalesced and locking a locked storage is a no-op.
   *
   * @returns {Promise<void>}
   **/
  async lock() {
    // Concurrent locks are coalesced
    if (this.locking) return this._locking
    if (this.unlocking) await this._unlocking
    if (this.locked) return

    this._locking = this._mutex
      .destroy()
      .then(() => {
        return _save(this._storage, this._cache.entries(), this._key, this._kdfSettings)
      })
      .finally(() => {
        this._locking = null
        this.locked = true
        this._key.fill(0)
        this._key = null
        this._cache = null
        this._mutex = null
        this._storage.delete(PERSISTENT_STORAGE_KEY)
      })

    await this._locking
  }
}
