describe('charts', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.getByTestId('Depth').click();
  });

  it('can see market depth chart', () => {
    // 6006-DEPC-001
    cy.getByTestId('tab-depth').should('be.visible');
  });
});
