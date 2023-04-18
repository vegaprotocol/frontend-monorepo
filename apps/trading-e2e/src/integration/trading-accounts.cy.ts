import { checkSorting } from '@vegaprotocol/cypress';

describe('accounts', { tags: '@smoke' }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockWeb3Provider();
    cy.mockSubscription();
    cy.setVegaWallet();
    cy.visit('/#/markets/market-0');
    cy.wait('@Assets');
  });

  it('renders accounts', () => {
    const tradingAccountRowId = '[row-id="t-0"]';
    cy.getByTestId('Collateral').click();

    cy.getByTestId('tab-accounts').should('be.visible');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="asset.symbol"]')
      .should('have.text', 'AST0');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="accounts-actions"]')
      .should('have.text', 'DepositWithdraw');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[data-testid="deposit"]')
      .should('have.text', 'Deposit');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="accounts-actions"] [data-testid="withdraw"]')
      .should('have.text', 'Withdraw');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="total"]')
      .should('have.text', '100,001.01');
  });

  it('asset detail should be properly rendered', () => {
    cy.getByTestId('asset').contains('tEURO').click();
    cy.get('[data-testid$="_label"]').should('have.length', 16);
    cy.get('[data-testid="dialog-close"]:visible').click();
  });

  describe('sorting by ag-grid columns should work well', () => {
    it('sorting by asset', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = ['tBTC', 'tEURO', 'tDAI', 'tBTC'];
      const marketsSortedAsc = ['tBTC', 'tBTC', 'tDAI', 'tEURO'];
      const marketsSortedDesc = ['tEURO', 'tDAI', 'tBTC', 'tBTC'];
      checkSorting(
        'asset.symbol',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });

    it('sorting by total', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = [
        '1,000.00002',
        '1,000.01',
        '1,000.00',
        '1,000.00001',
      ];
      const marketsSortedAsc = [
        '1,000.00',
        '1,000.00001',
        '1,000.00002',
        '1,000.01',
      ];
      const marketsSortedDesc = [
        '1,000.01',
        '1,000.00002',
        '1,000.00001',
        '1,000.00',
      ];
      checkSorting(
        'total',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });

    it('sorting by used', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = [
        '0.000.00%',
        '0.010.00%',
        '0.000.00%',
        '0.000.00%',
      ];
      const marketsSortedAsc = [
        '0.000.00%',
        '0.000.00%',
        '0.000.00%',
        '0.010.00%',
      ];
      const marketsSortedDesc = [
        '0.010.00%',
        '0.000.00%',
        '0.000.00%',
        '0.000.00%',
      ];
      checkSorting(
        'used',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });

    it('sorting by total', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = [
        '1,000.00002',
        '1,000.01',
        '1,000.00',
        '1,000.00001',
      ];
      const marketsSortedAsc = [
        '1,000.00',
        '1,000.00001',
        '1,000.00002',
        '1,000.01',
      ];
      const marketsSortedDesc = [
        '1,000.01',
        '1,000.00002',
        '1,000.00001',
        '1,000.00',
      ];

      checkSorting(
        'total',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });
  });
});
