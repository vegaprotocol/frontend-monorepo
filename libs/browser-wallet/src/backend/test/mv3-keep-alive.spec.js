// Mock setup for Node.js
if (globalThis.browser == null) {
  globalThis.browser = {
    runtime: {
      getManifest: () => ({ manifest_version: 3 })
    }
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
describe('mv3-keep-alive', () => {
  afterEach(() => {
    // We're using a dynamic import, but modules will be cached between runs.
    // This clears the cache
    jest.resetModules()
  })

  test('returns noop if runtime is not manifest v3', async () => {
    jest.spyOn(globalThis.browser.runtime, 'getManifest').mockReturnValue({ manifest_version: 2 })
    const { default: createKeepAlive } = await import('../../lib/mv3-keep-alive.js')

    // Check zero arity function (ie the noop)
    expect(createKeepAlive()).toHaveLength(0)
    jest.restoreAllMocks()
  })

  describe('keepAlive function', () => {
    beforeEach(() => {
      jest.spyOn(globalThis.browser.runtime, 'getManifest').mockReturnValue({ manifest_version: 3 })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })
    const sleep = 100
    const ping = 20

    test('null cancels timers', async () => {
      const { default: createKeepAlive } = await import('../../lib/mv3-keep-alive.js')

      const keepAlive = createKeepAlive(sleep, ping)
      const port = { postMessage: jest.fn() }
      keepAlive(port)
      await wait(50)

      keepAlive(null)
      await wait(200)

      expect(port.postMessage).toHaveBeenCalledTimes(2)
    })

    test('calling keepAlive keeps loop alive until sleep', async () => {
      const { default: createKeepAlive } = await import('../../lib/mv3-keep-alive.js')

      const keepAlive = createKeepAlive(sleep, ping)
      const port = { postMessage: jest.fn() }
      keepAlive(port)
      await wait(25)
      expect(port.postMessage).toHaveBeenCalled()

      await wait(80)
      keepAlive(port)

      await wait(200)
      expect(port.postMessage).toHaveBeenCalledTimes(8)

      await wait(200)
      expect(port.postMessage).toHaveBeenCalledTimes(8)
    });

    test('keepAlive stops if port is disconnected', async () => {
      const { default: createKeepAlive } = await import('../../lib/mv3-keep-alive.js')

      const keepAlive = createKeepAlive(sleep, ping)
      const port = { postMessage: jest.fn(() => { throw new Error(); }) };
      keepAlive(port)
      await wait(25)
      expect(port.postMessage).toHaveBeenCalled()
      await wait(200)
      expect(port.postMessage).toHaveBeenCalledTimes(1)
    })
  })
})

