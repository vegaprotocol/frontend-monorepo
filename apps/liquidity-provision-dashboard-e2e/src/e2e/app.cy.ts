import { getGreeting } from '../support/app.po';

describe('liquidity-provision-dashboard', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('Top liquidity opportunities');
  });
});
