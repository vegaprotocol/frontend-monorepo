export const isTestEnv = () => {
  return typeof window !== 'undefined' && 'Cypress' in window;
};
