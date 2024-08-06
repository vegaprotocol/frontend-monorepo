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
    runtime: {
      connect: ({ name }: { name: string }) => {
        console.log('Port connected to background');
        return {
          onDisconnect: {
            addListener: (callback: () => void) => {
              console.log('Port disconnected from background');
            },
          },
          postMessage: (message: any) => {
            console.log('Port received message from background', message);
          },
          onMessage: {
            addListener: (callback: (message: any) => void) => {
              console.log('Port received message from background');
              callback({ method: 'ping' });
            },
          },
        };
      },
    },
  };
};
