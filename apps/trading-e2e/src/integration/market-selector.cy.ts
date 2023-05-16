import orderBy from 'lodash/orderBy';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import type {
  MarketFieldsFragment,
  MarketsDataFieldsFragment,
} from '@vegaprotocol/market-list';

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

    cy.get('@Markets').then((r) => {
      // @ts-ignore cypress thinks r is a query element
      // its actually a response object
      cy.wrap(r.response.body.data).as('markets');
    });

    cy.get('@MarketsData').then((r) => {
      // @ts-ignore cypress thinks r is a query element
      // its actually a response object
      cy.wrap(r.response.body.data).as('marketsData');
    });
  });

  it('can toggle the sidebar', () => {
    cy.getByTestId('market-selector').should('be.visible');
    cy.getByTestId('sidebar-toggle').click();
    cy.getByTestId('market-selector').should('not.exist');
    cy.getByTestId('sidebar-toggle').click();
    cy.getByTestId('market-selector').should('be.visible');
  });

  // need function keyword as we need 'this' to access market data
  it('displays data as expected', function () {
    const markets: MarketFieldsFragment[] = removePaginationWrapper(
      this.markets.marketsConnection.edges
    );
    const data: Array<{
      __typname: 'Market';
      data: MarketsDataFieldsFragment;
    }> = removePaginationWrapper(this.marketsData.marketsConnection.edges);
    const sortedMarkets = orderBy(
      markets.map((m) => {
        const d = data.find((d) => d.data.market.id === m.id);
        return {
          ...m,
          data: d?.data,
        };
      }),
      ['tradableInstrument.instrument.code'],
      ['asc']
    );

    cy.getByTestId(list)
      .find('a')
      .each((item, i) => {
        const market = sortedMarkets[i];
        expect(item.find('h3').text()).equals(
          market.tradableInstrument.instrument.code
        );
        expect(item.find('h4').text()).equals(
          market.tradableInstrument.instrument.name
        );
        expect(item.find('[data-testid="market-item-price"]').text()).equals(
          addDecimalsFormatNumber(
            market.data?.markPrice || '',
            market.decimalPlaces
          )
        );
        expect(item.find('[data-testid="market-item-change"]').text()).equals(
          '+200.00%'
        );
        expect(item.find('[data-testid="sparkline-svg"]')).to.exist;
      });
  });

  it('can use the filter options', () => {
    // product type
    cy.getByTestId('product-Spot').click();
    cy.getByTestId(list).contains('Spot markets coming soon.');
    cy.getByTestId('product-Perpetual').click();
    cy.getByTestId(list).contains('Perpetual markets coming soon.');
    cy.getByTestId('product-Future').click();
    cy.getByTestId(list).find('a').should('have.length', 4);

    cy.getByTestId(searchInput).clear().type('btc');
    cy.getByTestId(list).find('a').should('have.length', 2);
    cy.getByTestId(list).find('a').eq(0).contains('BTCUSD.MF21');
    cy.getByTestId(list).find('a').eq(1).contains('ETHBTC.QM21');

    cy.getByTestId(searchInput).clear();
    cy.getByTestId(list).find('a').should('have.length', 4);
  });
});
