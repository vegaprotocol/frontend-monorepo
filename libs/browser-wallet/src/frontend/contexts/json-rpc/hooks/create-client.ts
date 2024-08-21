import { JSONRPCClient } from '@vegaprotocol/json-rpc';

import { useCallback, useMemo } from 'react';

import { getExtensionApi } from '@/lib/extension-apis';
import { log } from '@/lib/logging';
import { useErrorStore } from '@/stores/error';

const createClient = () => {
  const { runtime } = getExtensionApi();
  const backgroundPort = runtime.connect({ name: 'popup' });
  const client = new JSONRPCClient({
    onnotification: (...arguments_) => {
      // NOOP
    },
    idPrefix: 'vega-popup-',
    send(message: any) {
      log('info', 'Sending message to background', message);
      backgroundPort.postMessage(message);
    },
  });

  backgroundPort.onMessage.addListener((message: any) => {
    log('info', 'Received message from background', message);
    client.onmessage(message);
  });

  backgroundPort.onDisconnect.addListener(
    /* istanbul ignore next */ () => {
      console.log('Port disconnected from background');
    }
  );
  return client;
};

// TODO Add own tests
export const useCreateClient = () => {
  const { setError } = useErrorStore((store) => ({
    setError: store.setError,
  }));

  const client = useMemo(() => createClient(), []);
  const request = useCallback(
    async (
      method: string,
      parameters: any = null,
      propagate: boolean = false
    ) => {
      try {
        const result = await client.request(method, parameters);
        return result;
      } catch (error) {
        if (propagate) {
          throw error;
        } else {
          setError(error as Error);
        }
      }
    },
    [client, setError]
  );

  return {
    client,
    request,
  };
};
