import { aliasQuery } from '@vegaprotocol/cypress';
import { generateLedgerEntries } from '../support/mocks/generate-ledger-entries';
import { generateAssets } from '../support/mocks/generate-assets';
import { generateMarkets } from '../support/mocks/generate-markets';

describe('Portfolio page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'LedgerEntries', generateLedgerEntries());
      aliasQuery(req, 'Assets', generateAssets());
      aliasQuery(req, 'Markets', generateMarkets());
    });
    cy.mockGQLSubscription();
  });
  describe('Ledger entries', () => {
    it('List should be properly rendered', () => {
      cy.visit('/#/portfolio');
      cy.connectVegaWallet();
      cy.getByTestId('"Ledger entries"').click();
      const headers = [
        'Sender',
        'Receiver',
        'Transfer Type',
        'Quantity',
        'Asset',
        'Vega Time',
      ];
      cy.getByTestId('tab-ledger-entries').within(($headers) => {
        cy.wrap($headers)
          .get('.ag-header-cell-text')
          .each(($header, i) => {
            cy.wrap($header).should('have.text', headers[i]);
          });
      });
      cy.get(
        '[data-testid="tab-ledger-entries"] .ag-center-cols-container .ag-row'
      ).should(
        'have.length',
        generateLedgerEntries().ledgerEntries.edges.length
      );
    });
  });
});
