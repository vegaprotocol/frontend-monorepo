import * as Schema from '@vegaprotocol/types';

const rowSelector =
  '[data-testid="tab-all-markets"] .ag-center-cols-container .ag-row';

describe('markets all table', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage().then(() => {
      cy.mockTradingPage(
        Schema.MarketState.STATE_ACTIVE,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
      );
      cy.mockSubscription();
      cy.visit('/#/markets/all');
    });
  });

  it('can see table headers', () => {
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    const headers = [
      'Market',
      'Description',
      'Trading mode',
      'Status',
      'Best bid',
      'Best offer',
      'Mark price',
      'Settlement asset',
      '',
    ];
    cy.getByTestId('tab-all-markets').within(($headers) => {
      cy.wrap($headers)
        .get('.ag-header-cell-text')
        .each(($header, i) => {
          cy.wrap($header).should('have.text', headers[i]);
        });
    });
  });

  it('markets tab should be rendered properly', () => {
    cy.get('[data-testid="All markets"]').should(
      'have.attr',
      'data-state',
      'active'
    );
    cy.get('[data-testid="Proposed markets"]').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.get('[data-testid="Closed markets"]').should(
      'have.attr',
      'data-state',
      'inactive'
    );
  });
  it('renders markets correctly', () => {
    // 6001-MARK-035
    cy.get(rowSelector)
      .first()
      .find('[col-id="tradableInstrument.instrument.code"]')
      .should('have.text', 'SOLUSD');

    //  6001-MARK-036
    cy.get(rowSelector)
      .first()
      .find('[col-id="tradableInstrument.instrument.name"]')
      .should('have.text', 'SUSPENDED MARKET');

    //  6001-MARK-037
    cy.get(rowSelector)
      .first()
      .find('[col-id="tradingMode"]')
      .should('have.text', 'Continuous');

    //  6001-MARK-038
    cy.get(rowSelector)
      .first()
      .find('[col-id="state"]')
      .should('have.text', 'Active');

    //  6001-MARK-039
    cy.get(rowSelector)
      .first()
      .find('[col-id="data.bestBidPrice"]')
      .should('have.text', '0.00');

    //  6001-MARK-040
    cy.get(rowSelector)
      .first()
      .find('[col-id="data.bestOfferPrice"]')
      .should('have.text', '0.00');

    //  6001-MARK-041
    cy.get(rowSelector)
      .first()
      .find('[col-id="data.markPrice"]')
      .should('have.text', '84.41');

    //  6001-MARK-042
    cy.get(rowSelector)
      .first()
      .find(
        '[col-id="tradableInstrument.instrument.product.settlementAsset.symbol"]'
      )
      .should('have.text', 'XYZalpha');

    // 6001-MARK-043
    cy.get(rowSelector)
      .first()
      .find(
        '[col-id="tradableInstrument.instrument.product.settlementAsset.symbol"] button'
      )
      .click();
    cy.getByTestId('dialog-title').should('have.text', 'Asset details - tEURO');
    cy.getByTestId('close-asset-details-dialog').click();
  });

  it('can open row actions', () => {
    // 6001-MARK-044
    cy.get('.ag-pinned-right-cols-container')
      .find('[col-id="market-actions"]')
      .first()
      .find('button')
      .click();

    // 6001-MARK-045
    const dropdownContent = '[data-testid="market-actions-content"]';
    const dropdownContentItem = '[role="menuitem"]';
    cy.get(dropdownContent)
      .find(dropdownContentItem)
      .eq(0)
      // Cannot click the copy button as it falls back to window.prompt, blocking the test.
      .should('have.text', 'Copy Market ID');

    // 6001-MARK-046
    cy.get(dropdownContent)
      .find(dropdownContentItem)
      .eq(1)
      .find('a')
      .then(($el) => {
        const href = $el.attr('href');
        expect(/\/markets\/market-1/.test(href || '')).to.equal(true);
      })
      .should('have.text', 'View on Explorer');

    // 6001-MARK-047
    cy.get(dropdownContent)
      .find(dropdownContentItem)
      .eq(2)
      .should('have.text', 'View asset');
    cy.getByTestId('market-actions-content').click();
  });

  it('able to open and sort full market list - market page', () => {
    const ExpectedSortedMarkets = [
      'AAPL.MF21',
      'BTCUSD.MF21',
      'ETHBTC.QM21',
      'SOLUSD',
    ];
    cy.get('[data-testid="All markets"]').click({ force: true });
    cy.url().should('eq', Cypress.config('baseUrl') + '/#/markets/all');
    cy.contains('AAPL.MF21').should('be.visible');
    cy.get('.ag-header-cell-label').contains('Market').click(); // sort by market name
    for (let i = 0; i < ExpectedSortedMarkets.length; i++) {
      cy.get(`[row-index=${i}]`)
        .find('[col-id="tradableInstrument.instrument.code"]')
        .should('have.text', ExpectedSortedMarkets[i]);
    }
  });
});
