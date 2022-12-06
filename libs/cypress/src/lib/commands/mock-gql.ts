import type { RouteHandler } from 'cypress/types/net-stubbing';
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
      mockGQL(handler: RouteHandler): void;
      mockGQLSubscription(mocks?: Record<string, onMessage>): void;
      mockWalletGQL(handler: RouteHandler): void;
    }
  }
}

export function addMockWalletGQLCommand() {
  Cypress.Commands.add('mockWalletGQL', (handler: RouteHandler): void => {
    cy.intercept('POST', '**/api/v2/requests', handler).as('walletGQL');
  });
}

export function addMockGQLCommand() {
  Cypress.Commands.add('mockGQL', (handler: RouteHandler) => {
    cy.intercept('POST', '**/graphql', handler).as('GQL');
  });
}

const mockSocketServer = Cypress.env('VEGA_URL')
  ? new Server(Cypress.env('VEGA_URL').replace('http', 'ws'))
  : null;

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
