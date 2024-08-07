export const silenceErrors = () => {
  return jest.spyOn(console, 'error').mockImplementation(() => {});
};

export const silenceLogs = () => {
  return jest.spyOn(console, 'log').mockImplementation(() => {});
};
