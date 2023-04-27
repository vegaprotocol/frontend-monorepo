import { checkSorting } from '@vegaprotocol/cypress';

describe('accounts', { tags: '@smoke' }, () => {
  before(() => {
    cy.clearAllLocalStorage();
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
      .should('have.text', ' ');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="total"]')
      .should('have.text', '100,001.01');
  });

  it('should open asset details dialog when clicked on symbol', () => {
    cy.getByTestId('asset').contains('tEURO').click();
    cy.get('[data-testid="dialog-content"]:visible').should('exist');
    cy.get('[data-testid="dialog-close"]:visible').click();
  });

  describe('sorting by ag-grid columns should work well', () => {
    before(() => {
      const dialogs = Cypress.$('[data-testid="dialog-close"]:visible');
      if (dialogs.length > 0) {
        dialogs.each((btn) => {
          cy.wrap(btn).click();
        });
      }
    });
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
