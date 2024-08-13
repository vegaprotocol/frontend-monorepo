// import { RpcMethods } from './client-rpc-methods';

// const wallets = ['wallet 1'];

// const globals = {
//   passphrase: true,
//   wallet: true,
//   version: '0.0.1',
//   locked: false,
//   settings: {
//     telemetry: false,
//   },
// };

export const getExtensionApi = () => {
  // // @ts-ignore
  // const result = globalThis.browser ?? globalThis.chrome;
  // if (!result) {
  //   throw new Error('Could not find extension APIs');
  // }
  // return result;
  return {
    // TODO: this stores the mnemonic this is NOT secure!!!
    storage: {
      session: localStorage,
    },
    runtime: {
      connect: ({ name }: { name: string }) => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        // const listeners: Function[] = [];

        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const pushMessage = (message: any) => {
        //   // Set timeout to simulate async
        //   setTimeout(() => {
        //     // TODO this is a hack
        //     listeners[0](message);
        //   }, 50);
        // };

        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          postMessage: (message: any) => {
            window.dispatchEvent(new CustomEvent(name, { detail: message }));
            console.log('****', message);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (...arguments_: any[]) => {
            // eslint-disable-next-line no-console
            console.log('om', arguments_);
          },
          onMessage: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addListener: (function_: any) => {
              // listeners.push(function_);
              console.log('new listener', function_);
              // @ts-ignore
              window.addEventListener(
                `${name}-response`,
                (event: CustomEvent) => {
                  console.log('event', event);
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
