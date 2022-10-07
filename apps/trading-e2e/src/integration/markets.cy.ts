import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';

describe('markets table', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.mockGQLSubscription();
  });

  it('renders markets correctly', () => {
    cy.visit('/');
    cy.wait('@Market');
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.wait('@MarketsCandles');
    cy.get('[data-testid^="market-link-"]').should('not.be.empty');
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('settlement-asset').should('not.be.empty');
    cy.getByTestId('price-change-percentage').should('not.be.empty');
    cy.getByTestId('price-change').should('not.be.empty');
    cy.getByTestId('sparkline-svg').should('be.visible');
  });

  it('renders market list drop down', () => {
    cy.visit('/');
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.wait('@MarketsCandles');
    openMarketDropDown();
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('trading-mode').should('not.be.empty');
    cy.getByTestId('taker-fee').should('contain.text', '%');
    cy.getByTestId('market-volume').should('not.be.empty');
    cy.getByTestId('market-name').should('not.be.empty');
  });

  it('Able to select market from dropdown', () => {
    cy.visit('/');
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.wait('@MarketsCandles');
    openMarketDropDown();
    cy.getByTestId('market-link-market-0').should('be.visible').click();

    cy.wait('@Market');
    cy.contains('ACTIVE MARKET');
    cy.url().should('include', '/markets/market-0');
    verifyMarketSummaryDisplayed();
  });

  it('Able to open and sort full market list - market page', () => {
    const ExpectedSortedMarkets = [
      'AAPL.MF21',
      'BTCUSD.MF21',
      'ETHBTC.QM21',
      'SOLUSD',
    ];
    cy.visit('/');
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.wait('@MarketsCandles');
    cy.getByTestId('link').should('have.attr', 'href', '/markets').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/markets');
    cy.contains('AAPL.MF21').should('be.visible');
    cy.contains('Market').click(); // sort by market name
    for (let i = 0; i < ExpectedSortedMarkets.length; i++) {
      cy.get(`[row-index=${i}]`)
        .find('[col-id="tradableInstrument.instrument.code"]')
        .should('have.text', ExpectedSortedMarkets[i]);
    }
  });

  it('Settlement expiry is displayed', () => {
    cy.visit('/markets/market-0');
    cy.wait('@Market');

    cy.getByTestId('trading-expiry')
      .should('have.text', 'Not time-based')
      .realHover();
    cy.getByTestId('expiry-tool-tip').should(
      'contain.text',
      'This market expires when triggered by its oracle, not on a set date.'
    );
    cy.getByTestId('link')
      .should('have.attr', 'href')
      .and('include', 'https://explorer.fairground.wtf/');
  });

  it('Auction conditions are displayed', () => {
    const toolTipLabel = 'tooltip-label';
    const toolTipValue = 'tooltip-value';
    const auctionToolTipLabels = [
      'Auction start',
      'Est auction end',
      'Target liquidity',
      'Current liquidity',
      'Est uncrossing price',
      'Est uncrossing vol',
    ];

    cy.visit('/markets/market-0');
    cy.wait('@Market');

    cy.getByTestId('trading-mode').eq(0).realHover();
    cy.getByTestId('tooltip-market-info').within(() => {
      cy.get('span')
        .eq(0)
        .should(
          'contain.text',
          'This market is in auction until it reaches sufficient liquidity.'
        );
      cy.getByTestId('external-link')
        .should('have.attr', 'href')
        .and(
          'include',
          'https://docs.vega.xyz/docs/testnet/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring'
        );
    });

    for (let i = 0; i < 6; i++) {
      cy.getByTestId(toolTipLabel)
        .eq(i)
        .should('have.text', auctionToolTipLabels[i]);
      cy.getByTestId(toolTipValue).eq(i).should('not.be.empty');
    }
  });

  function openMarketDropDown() {
    cy.getByTestId('dialog-close').click();
    cy.getByTestId('popover-trigger').click();
    cy.contains('Loading market data...').should('not.exist');
  }

  function verifyMarketSummaryDisplayed() {
    const marketSummaryBlock = 'header-summary';
    const percentageValue = 'price-change-percentage';
    const priceChangeValue = 'price-change';
    const tradingVolume = 'trading-volume';
    const tradingMode = 'trading-mode';

    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.contains('Change (24h)');
      cy.getByTestId(percentageValue).should('not.be.empty');
      cy.getByTestId(priceChangeValue).should('not.be.empty');
      cy.contains('Volume');
      cy.getByTestId(tradingVolume).should('not.be.empty');
      cy.contains('Trading mode');
      cy.getByTestId(tradingMode).should('not.be.empty');
      cy.getByTestId('mark-price').should('not.be.empty');
    });
  }
});
