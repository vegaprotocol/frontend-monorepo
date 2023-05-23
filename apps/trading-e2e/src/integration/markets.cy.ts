import * as Schema from '@vegaprotocol/types';
import { aliasGQLQuery, checkSorting } from '@vegaprotocol/cypress';
import { marketsQuery } from '@vegaprotocol/mock';
import { getDateTimeFormat } from '@vegaprotocol/utils';

describe('markets table', { tags: '@smoke' }, () => {
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

  it('renders markets correctly', () => {
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.get('[data-testid^="market-link-"]').should('not.be.empty');
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('settlement-asset').should('not.be.empty');
    cy.getByTestId('price-change-percentage').should('not.be.empty');
    cy.getByTestId('price-change').should('not.be.empty');
  });

  it('able to open and sort full market list - market page', () => {
    const ExpectedSortedMarkets = [
      'AAPL.MF21',
      'BTCUSD.MF21',
      'ETHBTC.QM21',
      'SOLUSD',
    ];
    cy.url().should('eq', Cypress.config('baseUrl') + '/#/markets/all');
    cy.contains('AAPL.MF21').should('be.visible');
    cy.get('.ag-header-cell-label').contains('Market').click(); // sort by market name
    for (let i = 0; i < ExpectedSortedMarkets.length; i++) {
      cy.get(`[row-index=${i}]`)
        .find('[col-id="tradableInstrument.instrument.code"]')
        .should('have.text', ExpectedSortedMarkets[i]);
    }
  });

  it('proposed markets tab should be rendered properly', () => {
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
    cy.get('[data-testid="Proposed markets"]').click();
    cy.get('[data-testid="Proposed markets"]').should(
      'have.attr',
      'data-state',
      'active'
    );
    cy.getByTestId('tab-proposed-markets').should('be.visible');
    cy.get('.ag-body-viewport .ag-center-cols-container .ag-row').should(
      'have.length',
      10
    );
    cy.getByTestId('tab-proposed-markets')
      .find('[data-testid="external-link"]')
      .should('have.length', 11)
      .last()
      .should('have.text', 'Propose a new market')
      .and(
        'have.attr',
        'href',
        `${Cypress.env('VEGA_TOKEN_URL')}/proposals/propose/new-market`
      );
  });

  it('proposed markets tab should be sorted properly', () => {
    cy.get('[data-testid="Proposed markets"]').click();
    const marketColDefault = [
      'ETHUSD',
      'LINKUSD',
      'ETHUSD',
      'ETHDAI.MF21',
      'AAPL.MF21',
      'BTCUSD.MF21',
      'TSLA.QM21',
      'AAVEDAI.MF21',
      'ETHBTC.QM21',
      'UNIDAI.MF21',
    ];
    const marketColAsc = [
      'AAPL.MF21',
      'AAVEDAI.MF21',
      'BTCUSD.MF21',
      'ETHBTC.QM21',
      'ETHDAI.MF21',
      'ETHUSD',
      'ETHUSD',
      'LINKUSD',
      'TSLA.QM21',
      'UNIDAI.MF21',
    ];
    const marketColDesc = [
      'UNIDAI.MF21',
      'TSLA.QM21',
      'LINKUSD',
      'ETHUSD',
      'ETHUSD',
      'ETHDAI.MF21',
      'ETHBTC.QM21',
      'BTCUSD.MF21',
      'AAVEDAI.MF21',
      'AAPL.MF21',
    ];
    checkSorting('market', marketColDefault, marketColAsc, marketColDesc);

    const stateColDefault = [
      'Open',
      'Passed',
      'Waiting for Node Vote',
      'Open',
      'Passed',
      'Open',
      'Passed',
      'Open',
      'Waiting for Node Vote',
      'Open',
    ];
    const stateColAsc = [
      'Open',
      'Open',
      'Open',
      'Open',
      'Open',
      'Passed',
      'Passed',
      'Passed',
      'Waiting for Node Vote',
      'Waiting for Node Vote',
    ];
    const stateColDesc = [
      'Waiting for Node Vote',
      'Waiting for Node Vote',
      'Passed',
      'Passed',
      'Passed',
      'Open',
      'Open',
      'Open',
      'Open',
      'Open',
    ];
    checkSorting('state', stateColDefault, stateColAsc, stateColDesc);
  });

  it.skip('opening auction subsets should be properly displayed', () => {
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
    );
    cy.mockGQL((req) => {
      const override = {
        marketsConnection: {
          edges: [
            {
              node: {
                tradableInstrument: {
                  instrument: {
                    name: `opening auction MARKET`,
                  },
                },
                state: Schema.MarketState.STATE_ACTIVE,
                tradingMode:
                  Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
              },
            },
          ],
        },
      };
      // @ts-ignore partial deep check failing
      const market = marketsQuery(override);
      aliasGQLQuery(req, 'Market', market);
      aliasGQLQuery(req, 'ProposalOfMarket', {
        proposal: { terms: { enactmentDatetime: '2023-01-31 12:00:01' } },
      });
    });
    cy.visit('#/markets/market-0');
    cy.url().should('contain', 'market-0');
    cy.getByTestId('item-value').contains('Opening auction').realHover();
    cy.getByTestId('opening-auction-sub-status').should(
      'contain.text',
      'Opening auction: Not enough liquidity to open'
    );

    const now = new Date(Date.parse('2023-01-30 12:00:01')).getTime();
    cy.clock(now, ['Date']); // Set "now" to BEFORE reservation
    cy.reload();
    cy.getByTestId('item-value').contains('Opening auction').realHover();
    cy.getByTestId('opening-auction-sub-status').should(
      'contain.text',
      `Opening auction: Closing on ${getDateTimeFormat().format(
        new Date('2023-01-31 12:00:01')
      )}`
    );
    cy.clock().then((clock) => {
      clock.restore();
    });
  });
});
