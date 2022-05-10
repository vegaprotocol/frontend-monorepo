import { createBridge, createBridgeWithNewWallet } from '../eip1193-bridge';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockWeb3Provider(): void;
      mockWeb3ProviderWithNewWallet(): void;
    }
  }
}

export function addMockWeb3ProviderCommand() {
  Cypress.Commands.add('mockWeb3Provider', () => {
    cy.log('Mocking web3');
    cy.on('window:before:load', (win) => {
      // @ts-ignore ethereum object is injected so won't exist on window object
      win.ethereum = createBridge();
    });
  });

  Cypress.Commands.add('mockWeb3ProviderWithNewWallet', () => {
    cy.log('Mocking web3 with new wallet');
    cy.on('window:before:load', (win) => {
      // @ts-ignore ethereum object is injected so won't exist on window object
      win.ethereum = createBridgeWithNewWallet();
    });
  });
}
