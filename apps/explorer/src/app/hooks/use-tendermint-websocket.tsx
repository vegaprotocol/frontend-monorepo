import React from 'react';
import { useTendermintWebsocketContext } from '../contexts/websocket/tendermint-websocket-context';
import { v4 as uuid } from 'uuid';

export interface TendermintWebsocketQuery {
  query: string;
}

/**
 * Handles the ID generation, subscription and unsubscription logic for tendermint websocket queries
 *
 * Subscribes when called and cleans up the subscription on destroy.
 *
 * Creates IDs for messages uniquely so only the current subscription is updated
 *
 * If a bufferSize is passed in then a circular buffer is created, with the oldest messages being discarded to prevent memory leeks
 *
 * @param message The query to be sent to tendermint see: https://docs.tendermint.com/master/rpc/#/Websocket/subscribe for syntax for query parameter
 * @param bufferSize
 * @returns
 */
export const useTendermintWebsocket = function <T>(
  message: TendermintWebsocketQuery,
  bufferSize?: number
) {
  const { sendMessage, lastMessage } = useTendermintWebsocketContext();
  const [id] = React.useState(uuid());
  const [messages, setMessages] = React.useState<MessageEvent<T>[]>([]);

  const [subMsg] = React.useState({
    jsonrpc: '2.0',
    method: 'subscribe',
    id,
    params: {
      ...message,
    },
  });
  const [unsubMsg] = React.useState({
    ...subMsg,
    method: 'unsubscribe',
  });

  React.useEffect(() => {
    if (lastMessage && lastMessage.data) {
      const data = JSON.parse(lastMessage.data);
      if (data.id === id) {
        setMessages((prev) => {
          if (bufferSize && prev.length >= bufferSize) {
            return [data, ...prev.slice(0, bufferSize - 1)];
          } else {
            return [data, ...prev];
          }
        });
      }
    }
  }, [bufferSize, id, lastMessage, setMessages]);

  React.useEffect(() => {
    sendMessage(JSON.stringify(subMsg));
    return () => {
      sendMessage(JSON.stringify(unsubMsg));
    };
  }, [subMsg, sendMessage, unsubMsg]);

  return {
    messages,
  };
};
