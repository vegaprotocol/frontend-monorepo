import { checkSorting } from '@vegaprotocol/cypress';

const dialogClose = 'dialog-close';

describe('accounts', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockWeb3Provider();
    cy.mockSubscription();
    cy.setVegaWallet();
    cy.visit('/#/markets/market-0');
  });

  it('should open usage breakdown dialog when clicked on used', () => {
    // 7001-COLL-009
    cy.get('[col-id="used"]').contains('1.01').click();
    const headers = ['Market', 'Account type', 'Balance', 'Margin health'];
    cy.getByTestId('usage-breakdown').within(($headers) => {
      cy.wrap($headers)
        .get('.ag-header-cell-text')
        .each(($header, i) => {
          cy.wrap($header).should('have.text', headers[i]);
        });
    });
    cy.getByTestId(dialogClose).click();
  });

  describe('sorting by ag-grid columns should work well', () => {
    before(() => {
      const dialogs = Cypress.$('[data-testid="dialog-close"]:visible');
      if (dialogs.length > 0) {
        dialogs.each((btn) => {
          cy.wrap(btn).click();
        });
      }
      cy.contains('Loading...').should('not.exist');
    });
    // 7001-COLL-010
    it('sorting by asset', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = ['tBTC', 'tEURO', 'tDAI', 'tBTC'];
      const marketsSortedAsc = ['tBTC', 'tBTC', 'tDAI', 'tEURO'];
      const marketsSortedDesc = Array.from(marketsSortedAsc).reverse();
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
      const marketsSortedDesc = Array.from(marketsSortedAsc).reverse();

      checkSorting(
        'total',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });

    it('sorting by used', () => {
      cy.getByTestId('Collateral').click();
      // concat actual value with percentage value
      // as cypress will pick up the entire cell contes
      // textContent
      const marketsSortedDefault = [
        '0.00' + '0.00%',
        '0.01' + '0.00%',
        '0.00' + '0.00%',
        '0.00' + '0.00%',
      ];
      const marketsSortedAsc = [
        '0.00' + '0.00%',
        '0.00' + '0.00%',
        '0.00' + '0.00%',
        '0.01' + '0.00%',
      ];
      const marketsSortedDesc = Array.from(marketsSortedAsc).reverse();
      checkSorting(
        'used',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });

    it('sorting by available', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = [
        '1,000.00002',
        '1,000.00',
        '1,000.00',
        '1,000.00001',
      ];
      const marketsSortedAsc = [
        '1,000.00',
        '1,000.00',
        '1,000.00001',
        '1,000.00002',
      ];
      const marketsSortedDesc = Array.from(marketsSortedAsc).reverse();

      checkSorting(
        'available',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });
  });
});
