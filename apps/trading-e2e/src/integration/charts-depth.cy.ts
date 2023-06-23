describe('charts', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.wait('@MarketData');
    cy.getByTestId('Depth').click();
  });

  it('can see market depth chart', () => {
    cy.getByTestId('tab-depth').should('be.visible');
    cy.get('.depth-chart-module_canvas__260De').should('be.visible');
  });
});
