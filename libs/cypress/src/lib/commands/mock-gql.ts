import type { RouteHandler } from 'cypress/types/net-stubbing';
import { Server, WebSocket } from 'mock-socket';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockGQL(handler: RouteHandler): void;
      mockGQLSubscription(mocks?: Record<string, onMessage>): void;
    }
  }
}

export function addMockGQLCommand() {
  Cypress.Commands.add('mockGQL', (handler: RouteHandler) => {
    cy.intercept('POST', '**/graphql', handler).as('GQL');
  });
}

const mockSocketServer = Cypress.env('VEGA_URL')
  ? new Server(Cypress.env('VEGA_URL').replace('http', 'ws'))
  : null;

interface onMessage {
  (send: (data: object) => void, variables: object): void;
}

export function addMockGQLSubscriptionCommand() {
  Cypress.Commands.add(
    'mockGQLSubscription',
    (mocks?: Record<string, onMessage>) => {
      cy.on('window:before:load', (win) => {
        if (!mockSocketServer) {
          return;
        }
        win.WebSocket = WebSocket;
        mockSocketServer.on('connection', (socket) => {
          socket.on('message', (message) => {
            if (typeof message !== 'string') {
              return;
            }
            const { id, payload, type } = JSON.parse(message);
            if (type === 'connection_init') {
              socket.send(JSON.stringify({ type: 'connection_ack' }));
            }
            if (payload && mocks && mocks[payload.operationName]) {
              mocks[payload.operationName](
                (data) =>
                  socket.send(
                    JSON.stringify({
                      type: 'data',
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
