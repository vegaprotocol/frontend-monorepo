describe('liquidity-provision-dashboard', () => {
  beforeEach(() => cy.visit('/'));

  it('render', () => {
    cy.get('#root').should('exist');
  });

  it('should display welcome message', () => {
    cy.get('h1').contains('Top liquidity opportunities');
  });
});
