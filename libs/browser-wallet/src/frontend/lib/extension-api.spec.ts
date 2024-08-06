import { getExtensionApi } from './extension-apis';

describe('ExtensionApis', () => {
  beforeEach(() => {
    // @ts-ignore
    delete globalThis.browser;
    // @ts-ignore
    delete globalThis.chrome;
  });
  it('returns chrome runtime if available', () => {
    const chromeMock = {};
    // @ts-ignore
    globalThis.chrome = chromeMock;
    const result = getExtensionApi();
    expect(result).toBe(chromeMock);
  });
  it('returns browser runtime if available', () => {
    const browserMock = {};
    // @ts-ignore
    globalThis.browser = browserMock;
    const result = getExtensionApi();
    expect(result).toBe(browserMock);
  });
  it('throws error if it cannot find an extension api', () => {
    expect(() => getExtensionApi()).toThrow('Could not find extension APIs');
  });
});
