export const mockStorage = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.browser = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
