import { aliasQuery } from '@vegaprotocol/cypress';
import { generateFill, generateFills } from '../support/mocks/generate-fills';
import { Side } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';
import { connectVegaWallet } from '../support/vega-wallet';
import { mockTradingPage } from '../support/trading';
import { generateNetworkParameters } from '../support/mocks/generate-network-parameters';

const fills = [
  generateFill({
    buyer: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
    },
  }),
  generateFill({
    id: '1',
    seller: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
    },
    aggressor: Side.SIDE_SELL,
    buyerFee: {
      infrastructureFee: '5000',
    },
    market: {
      tradableInstrument: {
        instrument: {
          name: 'Apples Daily v3',
        },
      },
      positionDecimalPlaces: 2,
    },
  }),
  generateFill({
    id: '2',
    seller: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
    },
    aggressor: Side.SIDE_BUY,
  }),
  generateFill({
    id: '3',
    aggressor: Side.SIDE_SELL,
    market: {
      tradableInstrument: {
        instrument: {
          name: 'ETHBTC Quarterly (30 Jun 2022)',
        },
      },
    },
    buyer: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
    },
  }),
];
const result = generateFills({
  party: {
    tradesConnection: {
      edges: fills.map((f, i) => {
        return {
          __typename: 'TradeEdge',
          node: f,
          cursor: i.toString(),
        };
      }),
    },
  },
});

describe('fills', () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'Fills', result);
      aliasQuery(req, 'NetworkParamsQuery', generateNetworkParameters());
    });
  });

  it('renders fills on portfolio page', () => {
    cy.visit('/portfolio');
    cy.get('main[data-testid="portfolio"]').should('exist');
    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').contains('Connect your Vega wallet');
    connectVegaWallet();
    validateFillsDisplayed();
  });

  it('renders fills on trading tab', () => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.STATE_ACTIVE);
    });
    cy.visit('/markets/market-0');
    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').contains('Please connect Vega wallet');
    connectVegaWallet();
    validateFillsDisplayed();
  });

  function validateFillsDisplayed() {
    cy.getByTestId('tab-fills').should('be.visible');

    cy.getByTestId('tab-fills')
      .get(
        '[role="gridcell"][col-id="market.tradableInstrument.instrument.name"]'
      )
      .each(($marketSymbol) => {
        cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-fills')
      .get('[role="gridcell"][col-id="size"]')
      .each(($amount) => {
        cy.wrap($amount).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[role="gridcell"][col-id="price"]')
      .each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[role="gridcell"][col-id="price_1"]')
      .each(($total) => {
        cy.wrap($total).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[role="gridcell"][col-id="aggressor"]')
      .each(($role) => {
        cy.wrap($role)
          .invoke('text')
          .then((text) => {
            const roles = ['Maker', 'Taker'];
            expect(roles.indexOf(text.trim())).to.be.greaterThan(-1);
          });
      });
    cy.getByTestId('tab-positions')
      .get(
        '[role="gridcell"][col-id="market.tradableInstrument.instrument.product"]'
      )
      .each(($fees) => {
        cy.wrap($fees).invoke('text').should('not.be.empty');
      });
    const dateTimeRegex =
      /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;
    cy.get('[col-id="createdAt"]').each(($tradeDateTime, index) => {
      if (index != 0) {
        //ignore header
        cy.wrap($tradeDateTime).invoke('text').should('match', dateTimeRegex);
      }
    });
  }
});
