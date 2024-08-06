export const getExtensionApi = (): typeof chrome => {
  // @ts-ignore
  const result = globalThis.browser ?? globalThis.chrome;
  if (!result) {
    throw new Error('Could not find extension APIs');
  }
  return result;
};
