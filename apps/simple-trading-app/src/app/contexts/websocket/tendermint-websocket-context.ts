import React from 'react';
import type { WebSocketHook } from 'react-use-websocket/dist/lib/types';

export type WebsocketContextShape = WebSocketHook;

export const TendermintWebsocketContext =
  React.createContext<WebsocketContextShape | null>(null);

export function useTendermintWebsocketContext() {
  const context = React.useContext(TendermintWebsocketContext);
  if (context === null) {
    throw new Error('useWebsocket must be used within WebsocketContext');
  }
  return context;
}
