import { connectVegaWallet } from '../support/connect-wallet';
import { aliasQuery } from '@vegaprotocol/cypress';
import {
  generateMarketsCandles,
  generateMarketsData,
  generateSimpleMarkets,
} from '../support/mocks/generate-markets';
import { generateDealTicket } from '../support/mocks/generate-deal-ticket';
import { generateMarketTags } from '../support/mocks/generate-market-tags';
import { generateMarketPositions } from '../support/mocks/generate-market-positions';
import { generateEstimateOrder } from '../support/mocks/generate-estimate-order';
import { generatePartyBalance } from '../support/mocks/generate-party-balance';
import { generatePartyMarketData } from '../support/mocks/generate-party-market-data';
import { generateMarketMarkPrice } from '../support/mocks/generate-market-mark-price';
import { generateMarketNames } from '../support/mocks/generate-market-names';
import { generateMarketDepth } from '../support/mocks/generate-market-depth';
import type { Market, MarketsQuery } from '@vegaprotocol/market-list';

describe('market selector', { tags: '@smoke' }, () => {
  let markets: Market[];
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'Markets', generateSimpleMarkets());
      aliasQuery(req, 'MarketsCandles', generateMarketsCandles());
      aliasQuery(req, 'MarketsData', generateMarketsData());
      aliasQuery(req, 'DealTicket', generateDealTicket());
      aliasQuery(req, 'MarketTags', generateMarketTags());
      aliasQuery(req, 'MarketPositions', generateMarketPositions());
      aliasQuery(req, 'EstimateOrder', generateEstimateOrder());
      aliasQuery(req, 'PartyBalance', generatePartyBalance());
      aliasQuery(req, 'PartyMarketData', generatePartyMarketData());
      aliasQuery(req, 'MarketMarkPrice', generateMarketMarkPrice());
      aliasQuery(req, 'MarketNames', generateMarketNames());
      aliasQuery(req, 'MarketDepth', generateMarketDepth());
    });

    cy.visit('/markets');
    cy.wait('@Markets').then((response) => {
      const data: MarketsQuery | undefined = response?.response?.body?.data;
      if (data?.marketsConnection?.edges.length) {
        markets = data?.marketsConnection?.edges.map((edge) => edge.node);
      }
    });
  });

  it('should be properly rendered', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        markets[0].tradableInstrument.instrument.name
      );
      cy.getByTestId('arrow-button').click();
      cy.getByTestId('market-pane').should('be.visible');
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .first()
        .should('contain.text', markets[0].tradableInstrument.instrument.name);
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .first()
        .click();
      cy.getByTestId('market-pane').should('not.be.visible');
    }
  });

  it('typing should change list', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('input[placeholder="Search"]').type('{backspace}');
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('have.length.at.least', 1);
      cy.get('input[placeholder="Search"]').clear();
      cy.get('input[placeholder="Search"]').type('aa');
      const filtered = markets.filter(
        (market) =>
          market.state === 'STATE_ACTIVE' &&
          market.tradableInstrument.instrument.name.match(/aa/i)
      );
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('have.length', filtered.length);
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .last()
        .click();
      cy.location('pathname').should(
        'eq',
        `/trading/${filtered[filtered.length - 1].id}`
      );
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        filtered[filtered.length - 1].tradableInstrument.instrument.name
      );
    }
  });
  // constantly failing on ci
  it.skip('keyboard navigation should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('input[placeholder="Search"]').type('{backspace}');
      cy.get('input[placeholder="Search"]').clear();
      cy.focused().realPress('ArrowDown');
      cy.focused().should('contain.text', 'AAVEDAI Monthly');
      cy.focused().realPress('ArrowDown');
      cy.focused().should('contain.text', 'ETHBTC').realPress('Enter');
      cy.location('pathname').should('eq', '/trading/ethbtc-quaterly');

      cy.get('input[placeholder="Search"]').type('{backspace}');
      cy.get('input[placeholder="Search"]').clear();
      cy.getByTestId('market-pane').should('be.visible');
      cy.get('body').realPress('ArrowDown');
      cy.get('body').realPress('Tab');
      cy.getByTestId('market-pane').should('not.be.visible');
    }
  });

  it('mobile view', () => {
    if (markets?.length) {
      cy.viewport('iphone-xr');
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('[role="dialog"]').should('not.exist');
      cy.getByTestId('arrow-button').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('input[placeholder="Search"]').clear();
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .should('have.length', 9);
      cy.get('div[role="dialog"]').should('have.class', 'w-screen');
      cy.getByTestId('dialog-close').click();
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        markets[0].tradableInstrument.instrument.name
      );
    }
  });
});
