import { aliasQuery } from '@vegaprotocol/cypress';
import {
  assetsQuery,
  ledgerEntriesQuery,
  marketsQuery,
} from '@vegaprotocol/mock';

describe('Portfolio page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'LedgerEntries', ledgerEntriesQuery());
      aliasQuery(req, 'Assets', assetsQuery());
      aliasQuery(req, 'Markets', marketsQuery());
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
      ).should('have.length', ledgerEntriesQuery().ledgerEntries.edges.length);
    });
  });
});
