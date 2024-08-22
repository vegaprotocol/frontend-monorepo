import { JSONRPCServer, PortServer } from '@vegaprotocol/json-rpc';
import { getExtensionApi } from '@/lib/extension-apis';
import { log } from '@/lib/logging';
import { ServerRpcMethods } from '@/lib/server-rpc-methods';
import type { TransactionMessage } from '@/lib/transactions';

const maybeCloseWindow = () => {
  const url = new URL(window.location.href);
  const shouldClose = url.search.includes('once');
  if (shouldClose) {
    window.close();
  }
};

// TODO add own tests
export const createServer = (
  handleTransaction: (parameters: TransactionMessage) => Promise<boolean>
) => {
  const { runtime } = getExtensionApi();
  const backgroundPort = runtime.connect({ name: 'popup' });
  const server = new JSONRPCServer({
    methods: {
      async [ServerRpcMethods.Transaction](parameters: any, context: any) {
        log('info', 'Message pushed from background', parameters, context);
        const response = await handleTransaction(parameters);
        maybeCloseWindow();
        return response;
      },
    },
  });
  const portServer = new PortServer({
    onerror: console.error,
    server,
    onconnect: async () => {},
  });
  portServer.listen(backgroundPort);
  return server;
};
