import type JSONRPCClient from '@/lib/json-rpc-client';
import type JSONRPCServer from '@/lib/json-rpc-server';

interface EventTracker {
  listener: Function;
  result: any[];
  callCounter: number;
}

declare global {
  interface Window {
    client: JSONRPCClient;
    server: JSONRPCServer;
    request: SendMessage;
    vega: any;
    sendTransactionResult: any;
    connectWalletResult: any;
    isConnectedResult: any;
    vega: any;
    __events__: Record<string, EventTracker>;
  }
}
