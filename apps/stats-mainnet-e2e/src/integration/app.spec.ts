describe('stats-mainnet', () => {
  beforeEach(() => cy.visit('/'));

  it('should display header', () => {
    cy.get('h3').should('have.text', '/ Mainnet');
  });
});
