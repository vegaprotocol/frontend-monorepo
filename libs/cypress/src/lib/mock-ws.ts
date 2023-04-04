import { Server, WebSocket } from 'mock-socket';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface onMessage<T = any, V = any> {
  (send: (data: T) => void, variables: V): void;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockSubscription(mocks?: Record<string, onMessage>): void;
    }
  }
}

const mockSocketServer = Cypress.env('VEGA_URL')
  ? new Server(Cypress.env('VEGA_URL').replace('http', 'ws'))
  : null;

// DO NOT REMOVE: PASSTHROUGH for walletconnect
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const relayServer = new Server('wss://relay.walletconnect.com', {
  mock: false,
});

export function addMockSubscription() {
  Cypress.Commands.add(
    'mockSubscription',
    (mocks?: Record<string, onMessage>) => {
      cy.on('window:before:load', (win) => {
        if (!mockSocketServer) {
          return;
        }
        win.WebSocket = WebSocket;
        mockSocketServer.on('connection', (socket) => {
          socket.on('message', (rawMessage) => {
            if (typeof rawMessage !== 'string') {
              return;
            }
            const message = JSON.parse(rawMessage);
            const { id, payload, type } = message;
            if (type === 'connection_init') {
              socket.send(JSON.stringify({ type: 'connection_ack' }));
              return;
            }
            if (payload && mocks && mocks[payload.operationName]) {
              mocks[payload.operationName](
                (data) =>
                  socket.send(
                    JSON.stringify({
                      type: 'next',
                      id,
                      payload: { errors: [], data },
                    })
                  ),
                payload.variables
              );
            }
          });
        });
      });
    }
  );
}
