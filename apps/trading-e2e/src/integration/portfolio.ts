describe('portfolio', () => {
  it('requires connecting', () => {
    // You will be eager connected by passing ethereum wallet connection UI
    cy.mockWeb3Provider();

    cy.visit('/portfolio');
    cy.get('main[data-testid="portfolio"]').should('exist');
  });
});
