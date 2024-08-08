import EncryptedStorage from '../lib/encrypted-storage.js'

describe('encrypted-storage', () => {
  it('Invalid passphrase', async () => {
    const store = new Map()
    const encryptedStorage = new EncryptedStorage(store, { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')
    await encryptedStorage.lock()
    await expect(encryptedStorage.unlock('invalid')).rejects.toThrow('Invalid passphrase or corrupted storage')
  })

  it('Storage is not open', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await expect(encryptedStorage.get('foo')).rejects.toThrow('Storage is locked')
  })

  it('get() returns undefined for missing keys', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')

    expect(await encryptedStorage.get('foo')).toBe(undefined)
  })

  it('get() returns the value for existing keys', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')

    await encryptedStorage.set('foo', 'bar')

    expect(await encryptedStorage.get('foo')).toBe('bar')

    await encryptedStorage.lock()

    await encryptedStorage.unlock('passphrase')

    expect(await encryptedStorage.get('foo')).toBe('bar')
  })

  it('Storage is cleared when closed', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')

    await encryptedStorage.set('foo', 'bar')

    await encryptedStorage.lock()

    await expect(encryptedStorage.get('foo')).rejects.toThrow('Storage is locked')
  })

  it('Create storage twice', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')
    await encryptedStorage.lock()

    await expect(encryptedStorage.create('passphrase')).rejects.toThrow('Storage already exists')
  })

  it('Create storage twice with overwrite', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')
    await encryptedStorage.lock()

    await encryptedStorage.create('passphrase2', true)

    expect(await encryptedStorage.verifyPassphrase('passphrase')).toBe(false)
  })

  it('Lock storage twice', async () => {
    const encryptedStorage = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 })

    await encryptedStorage.create('passphrase')

    await encryptedStorage.lock()

    expect(await encryptedStorage.lock()).toBe(undefined)
  })
})
