import { createBridge } from '../eip1193-bridge';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockWeb3Provider(): void;
    }
  }
}

export function addMockWeb3ProviderCommand() {
  Cypress.Commands.add('mockWeb3Provider', () => {
    cy.log('Mocking web3');
    cy.on('window:before:load', (win) => {
      // @ts-ignore asdf asdf ad
      win.ethereum = createBridge();
    });
  });
}
