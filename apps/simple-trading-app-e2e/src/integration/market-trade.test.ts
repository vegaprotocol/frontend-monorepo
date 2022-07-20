import { aliasQuery } from '@vegaprotocol/cypress';
import { generateSimpleMarkets } from '../support/mocks/generate-markets';
import { generateDealTicket } from '../support/mocks/generate-deal-ticket';

describe('Market trade', () => {
  let markets;
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'SimpleMarkets', generateSimpleMarkets());
      aliasQuery(req, 'DealTicketQuery', generateDealTicket());
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

  it('mobile view should work well', () => {
    if (markets?.length) {
      cy.viewport('iphone-xr');
      cy.visit(`/trading/${markets[0].id}`);
      cy.get('button').contains('Next').click();

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
      cy.get('button').contains('Next').click();
      cy.get('#step-1-control').should(
        'contain.html',
        'aria-label="Selected value Short"'
      );
    }
  });
});
