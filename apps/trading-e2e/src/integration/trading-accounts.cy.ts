import { checkSorting } from '@vegaprotocol/cypress';

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
      .should('have.text', '1,001.00');
  });
  describe('sorting by ag-grid columns should work well', () => {
    it('sorting by asset', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = ['tBTC', 'AST0', 'tEURO', 'tDAI', 'tBTC'];
      const marketsSortedAsc = ['AST0', 'tBTC', 'tBTC', 'tDAI', 'tEURO'];
      const marketsSortedDesc = ['tEURO', 'tDAI', 'tBTC', 'tBTC', 'AST0'];
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
        '1,001.00',
        '1,000.01',
        '1,000.01',
        '1,000.00001',
      ];
      const marketsSortedAsc = [
        '1,000.00001',
        '1,000.00002',
        '1,000.01',
        '1,000.01',
        '1,001.00',
      ];
      const marketsSortedDesc = [
        '1,001.00',
        '1,000.01',
        '1,000.01',
        '1,000.00002',
        '1,000.00001',
      ];
      checkSorting(
        'deposited',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });

    it('sorting by used', () => {
      cy.getByTestId('Collateral').click();
      const marketsSortedDefault = ['0.00', '1.00', '0.01', '0.01', '0.00'];
      const marketsSortedAsc = ['0.00', '0.00', '0.01', '0.01', '1.00'];
      const marketsSortedDesc = ['1.00', '0.01', '0.01', '0.00', '0.00'];
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
        '1,000.00',
        '1,000.00001',
      ];
      const marketsSortedAsc = [
        '1,000.00',
        '1,000.00',
        '1,000.00',
        '1,000.00001',
        '1,000.00002',
      ];
      const marketsSortedDesc = [
        '1,000.00002',
        '1,000.00001',
        '1,000.00',
        '1,000.00',
        '1,000.00',
      ];

      checkSorting(
        'available',
        marketsSortedDefault,
        marketsSortedAsc,
        marketsSortedDesc
      );
    });
  });
});
