import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { ledgerEntriesQuery } from '@vegaprotocol/mock';

describe('Portfolio page', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'LedgerEntries', ledgerEntriesQuery());
    });
    cy.mockSubscription();
    cy.setVegaWallet();
  });
  describe('Ledger entries', () => {
    it('List should be properly rendered', () => {
      cy.visit('/#/portfolio');
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
