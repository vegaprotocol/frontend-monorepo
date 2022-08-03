import { aliasQuery } from '@vegaprotocol/cypress';
import { generateSimpleMarkets } from '../support/mocks/generate-markets';
import { generateDealTicket } from '../support/mocks/generate-deal-ticket';
import { generateMarketTags } from '../support/mocks/generate-market-tags';
import { generateMarketPositions } from '../support/mocks/generate-market-positions';
import { generateEstimateOrder } from '../support/mocks/generate-estimate-order';
import { generatePartyBalance } from '../support/mocks/generate-party-balance';
import { generatePartyMarketData } from '../support/mocks/generate-party-market-data';
import { generateMarketMarkPrice } from '../support/mocks/generate-market-mark-price';
import { connectVegaWallet } from '../support/connect-wallet';

describe('Market trade', () => {
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
    });
    cy.visit('/markets');
    cy.wait('@SimpleMarkets').then((response) => {
      if (response.response.body.data?.markets?.length) {
        markets = response.response.body.data.markets;
      }
    });
  });

  it('side selector should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
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

  it('size selector should work well', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[1].id}`);
      connectVegaWallet();
      cy.get('#step-1-control [aria-label^="Selected value"]').click();
      cy.get('button[aria-label="Open short position"]').click();
      cy.get('#step-2-control').click();
      cy.get('#step-2-panel').find('dd').eq(0).should('have.text', '1');
      cy.get('#step-2-panel').find('[role="slider"]').type('{rightarrow}');

      cy.get('#step-2-panel').find('dd').eq(0).should('have.text', '2');
    }
  });

  it('order review should display proper calculations', () => {
    if (markets?.length) {
      cy.visit(`/trading/${markets[0].id}`);
      connectVegaWallet();
      cy.get('h3').contains('Review Trade').click();
      cy.getByTestId('key-value-table')
        .find('dl')
        .eq(1)
        .find('dd div')
        .should('have.text', '25.78726');
      cy.getByTestId('key-value-table')
        .find('dl')
        .eq(2)
        .find('dd div')
        .should('have.text', '1.00000');
      cy.getByTestId('key-value-table')
        .find('dl')
        .eq(3)
        .find('dd div')
        .should('have.text', ' - ');
      cy.getByTestId('place-order').click();
      cy.getByTestId('dialog-title').should(
        'have.text',
        'Confirm transaction in wallet'
      );
    }
  });
});
