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

  it('renders accounts', () => {
    // 7001-COLL-001
    // 7001-COLL-002
    // 7001-COLL-003
    // 7001-COLL-004
    // 7001-COLL-005
    // 7001-COLL-006
    // 7001-COLL-007
    // 1003-TRAN-001
    // 7001-COLL-012

    const tradingAccountRowId = '[row-id="t-0"]';
    cy.getByTestId('Collateral').click();

    cy.getByTestId('tab-accounts').should('be.visible');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="asset.symbol"]')
      .should('have.text', 'AST0');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="used"]')
      .should('have.text', '1.01' + '1.00%');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="available"]')
      .should('have.text', '100.00');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="total"]')
      .should('have.text', '101.01');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="accounts-actions"]')
      .should('have.text', '');

    cy.getByTestId('tab-accounts')
      .get('[col-id="accounts-actions"]')
      .find('[data-testid="dropdown-menu"]')
      .eq(1)
      .click();
    cy.getByTestId('deposit').should('be.visible');
    cy.getByTestId('withdraw').should('be.visible');
    cy.getByTestId('transfer').should('be.visible');
    cy.getByTestId('breakdown').should('be.visible');
    cy.getByTestId('Collateral').click({ force: true });
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
