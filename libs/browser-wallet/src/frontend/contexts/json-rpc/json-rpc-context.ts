import { createContext, useContext } from 'react';

import type { SendMessage } from './json-rpc-provider';
import { type JSONRPCClient, type JSONRPCServer } from '@vegaprotocol/json-rpc';

export interface JsonRpcContextShape {
  client: JSONRPCClient;
  server: JSONRPCServer;
  request: SendMessage;
}

export const JsonRpcContext = createContext<JsonRpcContextShape | undefined>(
  undefined
);

export function useJsonRpcClient() {
  const context = useContext(JsonRpcContext);
  if (context === undefined) {
    throw new Error('useJsonRpcClient must be used within JsonRPCProvider');
  }
  return context;
}
