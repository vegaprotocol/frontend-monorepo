describe('charts', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setOnBoardingViewed();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  it('can see market depth chart', () => {
    // 6006-DEPC-001
    cy.getByTestId('Depth').click();
    cy.getByTestId('tab-depth').should('be.visible');
  });
});
