/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createStore } from './tab-store';

const mockBrowser = () => {
  // @ts-ignore
  globalThis.browser = {
    tabs: {
      query: jest.fn(),
      onActivated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
};

const mockChrome = () => {
  globalThis.chrome = {
    query: jest.fn(),
    tabs: {
      // @ts-ignore
      onActivated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
};

const initialState = createStore().getState();

describe('useTabStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createStore().setState(initialState);
  });
  afterEach(() => {
    // @ts-ignore
    delete globalThis.browser;
    // @ts-ignore
    delete globalThis.chrome;
  });
  it('uses browser if chrome is not defined', async () => {
    mockBrowser();
    const tab1 = { id: 1 };
    // @ts-ignore
    globalThis.browser.tabs.query = jest.fn().mockResolvedValue([tab1]);
    const tabStore = createStore();
    await tabStore.getState().setup();
    expect(tabStore.getState().currentTab).toBe(tab1);
  });
  it('uses chrome if browser is not defined', async () => {
    mockChrome();
    const tab1 = { id: 1 };
    globalThis.chrome.tabs.query = jest.fn().mockResolvedValue([tab1]);
    const tabStore = createStore();
    await tabStore.getState().setup();
    expect(tabStore.getState().currentTab).toBe(tab1);
  });

  it('set event listener and current tab on setup', async () => {
    mockChrome();
    const tab1 = { id: 1 };
    globalThis.chrome.tabs.query = jest.fn().mockResolvedValue([tab1]);
    const tabStore = createStore();
    expect(tabStore.getState().currentTab).toBeNull();

    await tabStore.getState().setup();
    expect(tabStore.getState().currentTab).toBe(tab1);
    expect(
      globalThis.chrome.tabs.onActivated.addListener
    ).toHaveBeenCalledTimes(1);
  });
  it('sets the new tab when onTabUpdated is called', async () => {
    mockChrome();
    const tab1 = { id: 1 };
    globalThis.chrome.tabs.query = jest.fn().mockResolvedValue([tab1]);
    const tabStore = createStore();

    const tab2 = { id: 2 };
    globalThis.chrome.tabs.query = jest.fn().mockResolvedValue([tab2]);

    await tabStore.getState().onTabUpdated();
    expect(tabStore.getState().currentTab).toBe(tab2);
  });
  it('removes the event listener on teardown', async () => {
    mockChrome();
    const tab1 = { id: 1 };
    globalThis.chrome.tabs.query = jest.fn().mockResolvedValue([tab1]);
    const tabStore = createStore();
    await tabStore.getState().setup();
    tabStore.getState().teardown();
    expect(
      globalThis.chrome.tabs.onActivated.removeListener
    ).toHaveBeenCalledTimes(1);
  });
});
