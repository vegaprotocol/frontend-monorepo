export const localStorageWrapped = {
  get(key: string) {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  },
  set(key: string, val: Record<string, unknown>) {
    return localStorage.setItem(key, JSON.stringify(val, null, '\t'));
  },
  clear() {
    localStorage.clear();
  },
  delete(key: string) {
    localStorage.removeItem(key);
  },
};
