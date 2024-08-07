import { useCallback, useMemo } from 'react';

import { getExtensionApi } from '@/lib/extension-apis';
import { log } from '@/lib/logging';
import { useConnectionStore } from '@/stores/connections';
import { useErrorStore } from '@/stores/error';
import type { Connection } from '@/types/backend';

// @ts-ignore
import JSONRPCClient from '../../../lib/json-rpc-client';
import { RpcMethods } from '../../../lib/client-rpc-methods';
import type { JsonRpcNotification } from '../json-rpc-provider';

// eslint-disable-next-line @typescript-eslint/ban-types
const createClient = (notificationHandler: Function) => {
  const { runtime } = getExtensionApi();
  const backgroundPort = runtime.connect({ name: 'popup' });
  const client = new JSONRPCClient({
    // @ts-ignore
    onnotification: (...arguments_) => {
      notificationHandler(...arguments_);
    },
    idPrefix: 'vega-popup-',
    send(message: any) {
      log('info', 'Sending message to background', message);
      backgroundPort.postMessage(message);
    },
  });
  // window.client = client;
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
  const { addConnection } = useConnectionStore((store) => ({
    addConnection: store.addConnection,
  }));

  // TODO better pattern for this
  const notificationHandler = useCallback(
    (message: JsonRpcNotification) => {
      if (message.method === RpcMethods.ConnectionsChange) {
        for (const connections of message.params.add as Array<Connection>) {
          addConnection(connections);
        }
      }
    },
    [addConnection]
  );
  const client = useMemo(
    () => createClient(notificationHandler),
    [notificationHandler]
  );
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
  // window.request = request;

  return {
    client,
    request,
  };
};
