import { aliasQuery } from '@vegaprotocol/cypress';
import { generateLedgerEntries } from '../support/mocks/generate-ledger-entries';
import { connectVegaWallet } from '../support/vega-wallet';
import { generateAssets } from '../support/mocks/generate-assets';
import { generateMarkets } from '../support/mocks/generate-markets';

describe('Portfolio page', { tags: '@regression' }, () => {
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
      connectVegaWallet();
      cy.get('[data-testid="Ledger entries"]').click();
      const headers = [
        'Sender',
        'Receiver',
        'Transfer Type',
        'Quantity',
        'Asset',
        'Vega Time',
      ];
      cy.get('.ag-header-row.ag-header-row-column').within(($headers) => {
        cy.wrap($headers)
          .get('.ag-header-cell-text')
          .each(($header, i) => {
            cy.wrap($header).should('have.text', headers[i]);
          });
      });
      cy.get('.ag-center-cols-container .ag-row').should(
        'have.length',
        generateLedgerEntries().ledgerEntries.edges.length
      );
    });
  });
});
