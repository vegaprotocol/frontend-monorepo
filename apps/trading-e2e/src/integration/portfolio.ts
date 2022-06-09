describe('portfolio', () => {
  it('requires connecting', () => {
    cy.visit('/portfolio');
    cy.get('main[data-testid="portfolio"]').should('exist');
  });
});
