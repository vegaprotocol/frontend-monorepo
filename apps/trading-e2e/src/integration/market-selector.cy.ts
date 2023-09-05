import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';

describe('markets selector', { tags: '@smoke' }, () => {
  const list = 'market-selector-list';
  const searchInput = 'search-term';

  beforeEach(() => {
    cy.window().then((window) => {
      window.localStorage.setItem('marketId', 'market-1');
    });
    cy.mockTradingPage(
      MarketState.STATE_ACTIVE,
      MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
    );
    cy.mockSubscription();
    cy.visit('/');

    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.wait('@MarketsCandles');
  });

  // 6001-MARK-066
  it('can toggle the sidebar', () => {
    cy.getByTestId('market-selector').should('be.visible');
    cy.getByTestId('sidebar-toggle').click();
    cy.getByTestId('market-selector').should('not.exist');
    cy.getByTestId('sidebar-toggle').click();
    cy.getByTestId('market-selector').should('be.visible');
  });

  // need function keyword as we need 'this' to access market data
  it('displays data as expected', () => {
    // TODO: load data from mocks in. Using alias and wrap intermittently fails
    const data = [
      {
        code: 'SOLUSD',
        markPrice: '84.41XYZalpha',
        change: '',
        vol: '0.0024h vol',
      },
      {
        code: 'ETHBTC.QM21',
        markPrice: '46,126.90058tBTC',
        change: '',
        vol: '0.0024h vol',
      },
      {
        code: 'BTCUSD.MF21',
        markPrice: '46,126.90058tDAI',
        change: '',
        vol: '0.0024h vol',
      },
      {
        code: 'AAPL.MF21',
        markPrice: '46,126.90058tUSDC',
        change: '',
        vol: '0.0024h vol',
      },
    ];
    cy.getByTestId(list)
      .find('a')
      .each((item, i) => {
        const market = data[i];
        // 6001-MARK-021
        // 6001-MARK-022
        expect(item.find('h3').text()).equals(market.code);
        expect(
          item.find('[data-testid="market-selector-data-row"]').eq(0).text()
        ).contains(market.vol);
        // 6001-MARK-024
        expect(
          item.find('[data-testid="market-selector-data-row"]').eq(1).text()
        ).contains(market.markPrice);
        // 6001-MARK-023
        expect(item.find('[data-testid="market-item-change"]').text()).equals(
          market.change
        );
        // 6001-MARK-025
        expect(item.find('[data-testid="sparkline-svg"]')).to.not.exist;
      });
  });

  it('can see all markets link', () => {
    // 6001-MARK-026
    cy.getByTestId('market-selector').within(() => {
      cy.getByTestId('all-markets-link')
        .should('be.visible')
        .and('have.text', 'All markets')
        .and('have.attr', 'href')
        .and('contain', '#/markets/all');
    });
  });

  it('can use the filter options', () => {
    // 6001-MARK-027
    // product type
    cy.getByTestId('product-Spot').click();
    cy.getByTestId(list).contains('Spot markets coming soon.');
    cy.getByTestId('product-Perpetual').click();
    cy.getByTestId(list).contains('Perpetual markets coming soon.');
    cy.getByTestId('product-Future').click();
    cy.getByTestId(list).find('a').should('have.length', 4);

    // 6001-MARK-029
    cy.getByTestId(searchInput).clear().type('btc');
    cy.getByTestId(list).find('a').should('have.length', 2);
    cy.getByTestId(list).find('a').eq(1).contains('BTCUSD.MF21');
    cy.getByTestId(list).find('a').eq(0).contains('ETHBTC.QM21');

    cy.getByTestId(searchInput).clear();
    cy.getByTestId(list).find('a').should('have.length', 4);
  });

  it('can sort by by top gaining and top losing market', () => {
    // 6001-MARK-030
    // 6001-MARK-031
    // 6001-MARK-032
    // 6001-MARK-033
    cy.getByTestId(' sort-trigger').click();
    cy.getByTestId('sort-item-Gained')
      .contains('Top gaining')
      .should('be.visible');
    cy.getByTestId('sort-item-Lost')
      .contains('Top losing')
      .should('be.visible');
    cy.getByTestId('sort-item-New')
      .contains('New markets')
      .should('be.visible');
  });

  it('can filter by settlement asset', () => {
    // 6001-MARK-028
    cy.getByTestId('asset-trigger').click();
    cy.getByTestId('asset-id-asset-3').contains('tBTC').click();
    cy.getByTestId(list).find('a').should('have.length', 1);
    cy.getByTestId(list).find('a').eq(0).contains('ETHBTC.QM21');
  });
});
