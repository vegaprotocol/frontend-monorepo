export const getExtensionApi = () => {
  return {
    runtime: {
      connect: ({ name }: { name: string }) => {
        return {
          name,
          disconnect: () => {},
          sender: {
            id: name,
            url: `https://${name}.com`,
            origin: name,
          },
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
                  // console.log('event', event.detail);
                  function_(event.detail);
                }
              );
            },
            removeListener: () => {},
          },
          onDisconnect: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addListener: (function_: any) => {},
            removeListener: () => {},
          },
        };
      },
    },
  };
};
