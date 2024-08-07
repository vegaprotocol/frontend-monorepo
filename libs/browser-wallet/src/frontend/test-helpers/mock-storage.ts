export const mockStorage = () => {
  // @ts-ignore
  global.browser = {
    // @ts-ignore
    ...global.browser,
    storage: {
      session: {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
      },
    },
  };
};
