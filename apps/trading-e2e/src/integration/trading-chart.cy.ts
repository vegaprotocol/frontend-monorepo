describe('chart', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });
  it('config should persist', () => {
    cy.getByTestId('Chart').click();
    cy.get('[data-testid="tab-chart"] button').as('control-buttons');
    cy.get('@control-buttons').each(($button) => {
      cy.wrap($button).click();
      cy.get(
        '[role="menuitemradio"]:last, [role="menuitemcheckbox"]:last'
      ).click();
    });
    cy.getByTestId('Depth').click();
    cy.getByTestId('Chart').click();
    cy.get('@control-buttons').each(($button) => {
      cy.wrap($button).click();
      cy.get('[role="menuitemradio"]:last, [role="menuitemcheckbox"]:last')
        .within(($lastMenuItem) => {
          expect($lastMenuItem.data('state')).to.equal('checked');
        })
        .click();
    });
  });
});
