import { getGreeting } from '../support/app.po';

describe('multisig-signer', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('Multisig signer');
  });
});
