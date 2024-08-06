import { getExtensionApi } from '@/lib/extension-apis';
import { log } from '@/lib/logging';
import { ServerRpcMethods } from '@/lib/server-rpc-methods';
import type { TransactionMessage } from '@/lib/transactions';
import type {
  ConnectionMessage,
  ConnectionReply,
} from '@/stores/interaction-store';

import JSONRPCServer from '../../../../lib/json-rpc-server';
import { PortServer } from '../../../../lib/port-server';

const maybeCloseWindow = () => {
  const url = new URL(window.location.href);
  const shouldClose = url.search.includes('once');
  if (shouldClose) {
    window.close();
  }
};

// TODO add own tests
export const createServer = (
  handleConnection: (parameters: ConnectionMessage) => Promise<ConnectionReply>,
  handleTransaction: (parameters: TransactionMessage) => Promise<boolean>
) => {
  const { runtime } = getExtensionApi();
  const backgroundPort = runtime.connect({ name: 'popup' });
  const server = new JSONRPCServer({
    methods: {
      async [ServerRpcMethods.Connection](parameters: any, context: any) {
        log('info', 'Message pushed from background', parameters, context);
        const response = await handleConnection(parameters);
        maybeCloseWindow();
        return response;
      },
      async [ServerRpcMethods.Transaction](parameters: any, context: any) {
        log('info', 'Message pushed from background', parameters, context);
        const response = await handleTransaction(parameters);
        maybeCloseWindow();
        return response;
      },
    },
  });
  window.server = server;
  const portServer = new PortServer({
    onerror: console.error,
    server,
    onconnect: () => {},
  });
  portServer.listen(backgroundPort);
  return server;
};
