export const getExtensionApi = () => {
  return {
    // TODO: this stores the mnemonic this is NOT secure!!!
    storage: {
      session: localStorage,
    },
    runtime: {
      connect: ({ name }: { name: string }) => {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          postMessage: (message: any) => {
            window.dispatchEvent(new CustomEvent(name, { detail: message }));
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (...arguments_: any[]) => {
            // eslint-disable-next-line no-console
            // console.log('om', arguments_);
          },
          onMessage: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addListener: (function_: any) => {
              // @ts-ignore
              window.addEventListener(
                `${name}-response`,
                (event: CustomEvent) => {
                  console.log('event', event.detail);
                  function_(event.detail);
                }
              );
            },
          },
          onDisconnect: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addListener: (function_: any) => {},
          },
        };
      },
    },
  };
};
