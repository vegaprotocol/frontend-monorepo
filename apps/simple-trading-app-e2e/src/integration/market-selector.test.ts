import { connectVegaWallet } from '../support/connect-wallet';
import { aliasQuery } from '@vegaprotocol/cypress';
import { generateSimpleMarkets } from '../support/mocks/generate-markets';
import { generateDealTicket } from '../support/mocks/generate-deal-ticket';
import { generateMarketTags } from '../support/mocks/generate-market-tags';
import { generateMarketPositions } from '../support/mocks/generate-market-positions';
import { generateEstimateOrder } from '../support/mocks/generate-estimate-order';
import { generatePartyBalance } from '../support/mocks/generate-party-balance';
import { generatePartyMarketData } from '../support/mocks/generate-party-market-data';
import { generateMarketMarkPrice } from '../support/mocks/generate-market-mark-price';
import { generateMarketNames } from '../support/mocks/generate-market-names';

describe('market selector', () => {
  let markets;
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'SimpleMarkets', generateSimpleMarkets());
      aliasQuery(req, 'DealTicketQuery', generateDealTicket());
      aliasQuery(req, 'MarketTags', generateMarketTags());
      aliasQuery(req, 'MarketPositions', generateMarketPositions());
      aliasQuery(req, 'EstimateOrder', generateEstimateOrder());
      aliasQuery(req, 'PartyBalanceQuery', generatePartyBalance());
      aliasQuery(req, 'PartyMarketData', generatePartyMarketData());
      aliasQuery(req, 'MarketMarkPrice', generateMarketMarkPrice());
      aliasQuery(req, 'MarketNames', generateMarketNames());
    });

    cy.visit('/markets');
    cy.wait('@SimpleMarkets').then((response) => {
      if (response.response.body.data?.markets?.length) {
        markets = response.response.body.data.markets;
      }
    });
  });

  it('should be properly rendered', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        markets[0].name
      );
      cy.getByTestId('arrow-button').click();
      cy.getByTestId('market-pane').should('be.visible');
      cy.getByTestId('market-pane')
        .children()
        .find('[role="button"]')
        .first()
        .should('contain.text', markets[0].name);
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
        (market) => market.state === 'Active' && market.name.match(/aa/i)
      );
      cy.log('filtered', filtered);
      console.log('filtered', filtered);
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
        filtered[filtered.length - 1].name
      );
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
        .should('have.length', 3);
      cy.get('div[role="dialog"]').should('have.class', 'w-full');
      cy.getByTestId('dialog-close').click();
      cy.get('input[placeholder="Search"]').should(
        'have.value',
        markets[0].name
      );
    }
  });
});
