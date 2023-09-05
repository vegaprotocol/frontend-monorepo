describe('market bottom panel', { tags: '@smoke' }, () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@MarketData');
  });

  it('on xxl screen should be splitted out into two tables', () => {
    cy.getByTestId('tab-positions').should('have.attr', 'data-state', 'active');
    cy.getByTestId('tab-open-orders').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-closed-orders').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-rejected-orders').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-orders').should('have.attr', 'data-state', 'inactive');
    cy.getByTestId('tab-fills').should('have.attr', 'data-state', 'inactive');
    cy.getByTestId('tab-accounts').should(
      'have.attr',
      'data-state',
      'inactive'
    );

    cy.viewport(1801, 1000);
    cy.getByTestId('tab-positions').should('have.attr', 'data-state', 'active');
    cy.getByTestId('tab-open-orders').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-closed-orders').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-rejected-orders').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-orders').should('have.attr', 'data-state', 'inactive');
    cy.getByTestId('tab-fills').should('have.attr', 'data-state', 'inactive');
    cy.getByTestId('tab-accounts').should(
      'have.attr',
      'data-state',
      'inactive'
    );

    cy.getByTestId('Fills').click();
    cy.getByTestId('Collateral').click();
    cy.getByTestId('tab-positions').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.getByTestId('tab-orders').should('have.attr', 'data-state', 'inactive');
    cy.getByTestId('tab-fills').should('have.attr', 'data-state', 'active');
    cy.getByTestId('tab-accounts').should('have.attr', 'data-state', 'active');
  });
});
