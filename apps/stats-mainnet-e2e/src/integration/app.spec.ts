describe('stats-mainnet', () => {
  beforeEach(() => cy.visit('/'));

  it('should display header', () => {
    cy.get('h1').should('have.text', 'Vega Explorer');
  });
});
