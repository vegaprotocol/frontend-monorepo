beforeEach(() => {
  cy.mockTradingPage();
  cy.mockWeb3Provider();
  cy.mockSubscription();
  cy.setVegaWallet();
  cy.visit('/#/markets/market-0');
});

describe('accounts', { tags: '@smoke' }, () => {
  it('renders accounts', () => {
    const tradingAccountRowId = '[row-id="asset-0"]';
    cy.getByTestId('Collateral').click();

    cy.getByTestId('tab-accounts').should('be.visible');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="asset.symbol"]')
      .should('have.text', 'AST0');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="breakdown"] [data-testid="breakdown"]')
      .should('have.text', 'Breakdown');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="breakdown"] [data-testid="deposit"]')
      .should('have.text', 'Deposit');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="breakdown"] [data-testid="withdraw"]')
      .should('have.text', 'Withdraw');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="deposited"]')
      .should('have.text', '1,000.00');
  });
});
