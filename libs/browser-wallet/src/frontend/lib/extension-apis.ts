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
          onmessage: (...arguments_: any[]) => {},
          onMessage: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addListener: (function_: any) => {
              // @ts-ignore
              window.addEventListener(
                `${name}-response`,
                (event: CustomEvent) => {
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
