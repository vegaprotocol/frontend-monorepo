export const getExtensionApi = () => {
  // // @ts-ignore
  // const result = globalThis.browser ?? globalThis.chrome;
  // if (!result) {
  //   throw new Error('Could not find extension APIs');
  // }
  // return result;
  return {
    storage: {
      session: localStorage,
    },
  };
};
