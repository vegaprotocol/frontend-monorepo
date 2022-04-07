// TODO: fine for now however will leak state between tests (we don't really have) in future. Ideally should use a provider
export const LocalStorage = {
  getItem: (key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  },
  setItem: (key: string, value: any) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  },
};
