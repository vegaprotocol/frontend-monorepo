import { create } from 'zustand';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// const getTabs = () => globalThis.browser?.tabs ?? globalThis.chrome?.tabs;

export type TabStore = {
  // onTabUpdated: any;
  // currentTab: chrome.tabs.Tab | null;
  // setup: () => Promise<void>;
  // teardown: () => void;
};

// This is needed because in order to mock the tabs functions in tests
// if the file is immediately evaluated the mock is not present
export const createStore = () =>
  create<TabStore>()((set, get) => {
    // const tabs = getTabs();
    return {
      // onTabUpdated: async () => {
      //   const [activeTab] = await tabs.query({ active: true });
      //   set({ currentTab: activeTab });
      // },
      // currentTab: null,
      // async setup() {
      //   tabs.onActivated.addListener(get().onTabUpdated);
      //   const [activeTab] = await tabs.query({ active: true });
      //   set({ currentTab: activeTab });
      // },
      // teardown() {
      //   tabs.onActivated.removeListener(get().onTabUpdated);
      // },
    };
  });

export const useTabStore = createStore();
