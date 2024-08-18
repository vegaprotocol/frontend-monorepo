import { type JsonRpcMessage } from './json-rpc';

export interface MessageSender {
  id?: string | undefined;
  url?: string | undefined;
  origin?: string | undefined;
}

export interface Port {
  postMessage: (message: unknown) => void;
  disconnect: () => void;
  sender: MessageSender | undefined;
  onDisconnect: {
    addListener: (listener: (message: Port) => void) => void;
    removeListener: (listener: (message: Port) => void) => void;
  };
  onMessage: {
    addListener: (listener: (message: JsonRpcMessage) => void) => void;
    removeListener: (listener: (message: JsonRpcMessage) => void) => void;
  };
  name: string;
}
