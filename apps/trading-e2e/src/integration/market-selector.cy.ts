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
        code: 'AAPL.MF21',
        name: 'Apple Monthly (30 Jun 2022)',
        markPrice: '46,126.90058',
        change: '+200.00%',
      },
      {
        code: 'BTCUSD.MF21',
        name: 'ACTIVE MARKET',
        markPrice: '46,126.90058',
        change: '+200.00%',
      },
      {
        code: 'ETHBTC.QM21',
        name: 'ETHBTC Quarterly (30 Jun 2022)',
        markPrice: '46,126.90058',
        change: '+200.00%',
      },
      {
        code: 'SOLUSD',
        name: 'SUSPENDED MARKET',
        markPrice: '84.41',
        change: '+200.00%',
      },
    ];
    cy.getByTestId(list)
      .find('a')
      .each((item, i) => {
        const market = data[i];
        // 6001-MARK-021
        expect(item.find('h3').text()).equals(market.code);
        // 6001-MARK-022
        expect(item.find('h4').text()).equals(market.name);
        // 6001-MARK-024
        expect(item.find('[data-testid="market-item-price"]').text()).equals(
          market.markPrice
        );
        // 6001-MARK-023
        expect(item.find('[data-testid="market-item-change"]').text()).equals(
          market.change
        );
        // 6001-MARK-025
        expect(item.find('[data-testid="sparkline-svg"]')).to.exist;
      });
  });

  // 6001-MARK-27
  it('can use the filter options', () => {
    // product type
    cy.getByTestId('product-Spot').click();
    cy.getByTestId(list).contains('Spot markets coming soon.');
    cy.getByTestId('product-Perpetual').click();
    cy.getByTestId(list).contains('Perpetual markets coming soon.');
    cy.getByTestId('product-Future').click();
    cy.getByTestId(list).find('a').should('have.length', 4);

    // 6001-MARK-29
    cy.getByTestId(searchInput).clear().type('btc');
    cy.getByTestId(list).find('a').should('have.length', 2);
    cy.getByTestId(list).find('a').eq(0).contains('BTCUSD.MF21');
    cy.getByTestId(list).find('a').eq(1).contains('ETHBTC.QM21');

    cy.getByTestId(searchInput).clear();
    cy.getByTestId(list).find('a').should('have.length', 4);
  });
});
