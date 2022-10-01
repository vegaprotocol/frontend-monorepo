import { aliasQuery } from '@vegaprotocol/cypress';
import {
  generateSimpleMarkets,
  generateMarketsCandles,
  generateMarketsData,
} from '../support/mocks/generate-markets';
import { generateDealTicket } from '../support/mocks/generate-deal-ticket';
import { generateMarketTags } from '../support/mocks/generate-market-tags';
import { generateMarketPositions } from '../support/mocks/generate-market-positions';
import { generateEstimateOrder } from '../support/mocks/generate-estimate-order';
import { generatePartyBalance } from '../support/mocks/generate-party-balance';
import { generatePartyMarketData } from '../support/mocks/generate-party-market-data';
import { generateMarketMarkPrice } from '../support/mocks/generate-market-mark-price';
import { generateMarketDepth } from '../support/mocks/generate-market-depth';
import { connectVegaWallet } from '../support/connect-wallet';
import type { MarketsQuery, Market } from '@vegaprotocol/market-list';

describe('Market trade', { tags: '@smoke' }, () => {
  let markets: Market[];
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'MarketsQuery', generateSimpleMarkets());
      aliasQuery(req, 'MarketsCandlesQuery', generateMarketsCandles());
      aliasQuery(req, 'MarketsDataQuery', generateMarketsData());
      aliasQuery(req, 'SimpleMarkets', generateSimpleMarkets());
      aliasQuery(req, 'DealTicket', generateDealTicket());
      aliasQuery(req, 'MarketTags', generateMarketTags());
      aliasQuery(req, 'MarketPositions', generateMarketPositions());
      aliasQuery(req, 'EstimateOrder', generateEstimateOrder());
      aliasQuery(req, 'PartyBalanceQuery', generatePartyBalance());
      aliasQuery(req, 'PartyMarketData', generatePartyMarketData());
      aliasQuery(req, 'MarketMarkPrice', generateMarketMarkPrice());
      aliasQuery(req, 'MarketDepth', generateMarketDepth());
    });
    cy.visit('/markets');
    cy.wait('@MarketsQuery').then((response) => {
      const data: MarketsQuery | undefined = response?.response?.body?.data;
      if (data.marketsConnection.edges.length) {
        markets = data.marketsConnection.edges.map((edge) => edge.node);
      }
    });
  });

  it('should not display steps if wallet is disconnected', () => {
    cy.visit(`/trading/${markets[0].id}`);
    cy.getByTestId('trading-connect-wallet')
      .find('h3')
      .should('have.text', 'Please connect your Vega wallet to make a trade');
    cy.getByTestId('trading-connect-wallet')
      .find('button')
      .should('have.text', 'Connect Vega wallet');
    cy.getByTestId('trading-connect-wallet')
      .find('a')
      .should('have.text', 'https://vega.xyz/wallet');
  });

  it('side selector should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').should(
        'have.text',
        'Long'
      );
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-1-control [aria-label^="Selected value"]').should(
        'have.text',
        'Short'
      );
    }
  });

  it('side selector mobile view should work well', () => {
    if (markets?.length) {
      cy.viewport('iphone-xr');
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.getByTestId('next-button').scrollIntoView().click();

      cy.get('button[aria-label="Open long position"]').should(
        'have.class',
        'selected'
      );
      cy.get('button[aria-label="Open short position"]').should(
        'not.have.class',
        'selected'
      );

      cy.get('button[aria-label="Open short position"]').click();
      cy.get('button[aria-label="Open long position"]').should(
        'not.have.class',
        'selected'
      );
      cy.get('button[aria-label="Open short position"]').should(
        'have.class',
        'selected'
      );
      cy.getByTestId('next-button').scrollIntoView().click();
      cy.get('#step-1-control').should(
        'contain.html',
        'aria-label="Selected value Short"'
      );
    }
  });

  it('size slider should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '1');
      cy.get('#step-2-panel').find('[role="slider"]').type('{rightarrow}');

      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '2');
    }
  });

  it('percentage selection should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '1');

      cy.getByTestId('max-label').should('have.text', '21');

      cy.getByTestId('percentage-selector')
        .find('button')
        .contains('Max')
        .click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '21');
    }
  });

  it('size input should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '1');
      cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('input')
        .type('{backspace}2');
      cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '2');
      cy.get('button').contains('Max').click();
    }
  });

  it('slippage value should be displayed', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('button').contains('Max').click();
      cy.get('#step-2-panel')
        .find('dl')
        .eq(2)
        .find('dd')
        .should('have.text', '0.02%');
    }
  });

  it('allow slippage value to be adjusted', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('button').contains('Max').click();
      cy.get('#step-2-panel')
        .find('dl')
        .eq(2)
        .find('dd')
        .should('have.text', '0.02%');
      cy.get('#step-2-panel').find('dl').eq(2).find('button').click();
      cy.get('#input-order-slippage')
        .focus()
        .type('{backspace}{backspace}{backspace}1');

      cy.getByTestId('slippage-dialog').find('button').click();

      cy.get('#step-2-panel')
        .find('dl')
        .eq(2)
        .find('dd')
        .should('have.text', '1%');
    }
  });

  it('notional position size should be present', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('button')
        .should('have.text', '1');
      cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
      cy.get('#step-2-panel')
        .find('dd')
        .eq(0)
        .find('input')
        .type('{backspace}2');
      cy.get('#step-2-panel').find('dd').eq(0).find('button').click();
      cy.get('#step-2-panel')
        .find('dt')
        .eq(2)
        .should('have.text', 'Est. Position Size (tDAI)');
      cy.get('#step-2-panel').find('dd').eq(2).should('have.text', '197.86012');
    }
  });

  it('total fees should be displayed', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-2-panel')
        .find('dt')
        .eq(3)
        .should('have.text', 'Est. Fees (tDAI)');
      cy.get('#step-2-panel')
        .find('dd')
        .eq(3)
        .should('have.text', '3.00000 (3.03%)');
    }
  });

  it('order review should display proper calculations', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('#step-3-control').click();

      cy.getByTestId('review-trade')
        .get('#contracts_tooltip_trigger')
        .trigger('click')
        .realTouch();

      cy.get('[data-radix-popper-content-wrapper]').contains(
        'The number of contracts determines'
      );
      cy.get('#step-3-panel').find('dd').eq(1).should('have.text', '1');

      cy.get('#step-3-panel').find('dd').eq(2).should('have.text', '98.93006');

      cy.get('#step-3-panel')
        .find('dd')
        .eq(3)
        .should('have.text', '3.00000 (3.03%)');

      cy.get('#step-3-panel').find('dd').eq(4).should('have.text', ' - ');

      cy.getByTestId('place-order').click();
      cy.getByTestId('dialog-title').should(
        'have.text',
        'Awaiting network confirmation'
      );
    }
  });

  it('info tooltip on mobile view should work well', () => {
    if (markets?.length) {
      cy.viewport('iphone-xr');
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('#step-3-control').click();

      // Start from the bottom tooltip to ensure the tooltip above
      // can be interacted with
      cy.getByTestId('review-trade').get('div.cursor-help').eq(1).realTouch();
      cy.get('[data-radix-popper-content-wrapper]').contains(
        'The notional size represents the position size'
      );

      cy.getByTestId('review-trade')
        .get('#contracts_tooltip_trigger')
        .realTouch();
      cy.get('[data-radix-popper-content-wrapper]').contains(
        'The number of contracts determines'
      );
    }
  });
});
