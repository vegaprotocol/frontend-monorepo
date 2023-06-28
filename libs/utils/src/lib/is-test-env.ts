export const isTestEnv = () => {
  return window && 'Cypress' in window;
};
