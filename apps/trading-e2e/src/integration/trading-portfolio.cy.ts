import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { partyAssetsQuery } from '@vegaprotocol/mock';

describe('Portfolio page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'PartyAssets', partyAssetsQuery());
    });
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.setVegaWallet();
  });
  describe('Ledger entries', () => {
    it('Download form should be properly rendered', () => {
      cy.visit('/#/portfolio');
      cy.getByTestId('"Ledger entries"').click();
      cy.getByTestId('tab-ledger-entries').within(($headers) => {
        cy.wrap($headers)
          .getByTestId('ledger-download-button')
          .should('be.visible');
      });
    });
  });
});
