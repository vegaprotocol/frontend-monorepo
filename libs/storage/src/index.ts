// TODO: fine for now however will leak state between tests (we don't really have) in future. Ideally should use a provider
export const LocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      return item;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  },
};
