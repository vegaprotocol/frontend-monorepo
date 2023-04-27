import { checkSorting } from '@vegaprotocol/cypress';

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
      .should('have.text', '1.010.00%');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="available"]')
      .should('have.text', '100,000.00');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="total"]')
      .should('have.text', '100,001.01');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="accounts-actions"]')
      .should('have.text', ' ');

    cy.getByTestId('tab-accounts')
      .get(tradingAccountRowId)
      .find('[col-id="total"]')
      .should('have.text', '100,001.01');

    cy.getByTestId('tab-accounts')
      .get('[col-id="accounts-actions"]')
      .find('[data-testid="dropdown-menu"]')
      .eq(1)
      .click();
    cy.getByTestId('deposit').should('be.visible');
    cy.getByTestId('withdraw').should('be.visible');
    cy.getByTestId('breakdown').should('be.visible');
    cy.getByTestId('Collateral').click({ force: true });
  });

  it('should open asset details dialog when clicked on symbol', () => {
    // 7001-COLL-008
    cy.getByTestId('asset').contains('tEURO').click();
    cy.get('[data-testid$="_label"]').should('have.length', 16);
    cy.get('[data-testid="dialog-close"]').click();
  });

  it('should open asset details dialog when clicked on symbol', () => {
    // 7001-COLL-008
    cy.getByTestId('asset').contains('tEURO').click();
    cy.get('[data-testid$="_label"]').should('have.length', 16);
    cy.get('[data-testid="dialog-close"]').click();
  });

  it('should open usage breakdown dialog when clicked on used', () => {
    // 7001-COLL-009
    cy.getByTestId('breakdown').contains('1.01').click();
    const headers = ['Market', 'Account type', 'Balance'];
    cy.getByTestId('usage-breakdown').within(($headers) => {
      cy.wrap($headers)
        .get('.ag-header-cell-text')
        .each(($header, i) => {
          cy.wrap($header).should('have.text', headers[i]);
        });
    });
    cy.get('[data-testid="dialog-close"]').click();
  });

  it('sorting usage breakdown columns should work well', () => {
    // 7001-COLL-010
    cy.getByTestId('breakdown').contains('1.01').click();
    cy.getByTestId('usage-breakdown')
      .find('[col-id="type"]')
      .eq(1)
      .should('have.text', 'Margin');
    cy.getByTestId('usage-breakdown')
      .find('[col-id="type"]')
      .eq(2)
      .should('have.text', 'Margin');
    cy.getByTestId('usage-breakdown')
      .find('[col-id="type"]')
      .eq(3)
      .should('have.text', 'General');

    cy.get('[data-testid="dialog-close"]').click();
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
