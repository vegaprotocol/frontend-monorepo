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
        'Account type',
        'Market',
        'Receiver',
        'Account type',
        'Market',
        'Transfer type',
        'Quantity',
        'Asset',
        'Sender account balance',
        'Receiver account balance',
        'Vega time',
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

    it('account filters should be callable', () => {
      cy.visit('/#/portfolio');
      cy.getByTestId('"Ledger entries"').click();
      cy.get('[role="columnheader"][col-id="fromAccountType"]').realHover();
      cy.get(
        '[role="columnheader"][col-id="fromAccountType"] .ag-header-cell-menu-button'
      ).click();
      cy.get('fieldset.ag-simple-filter-body-wrapper')
        .should('be.visible')
        .within((fields) => {
          cy.wrap(fields).find('label').should('have.length', 19);
        });
      cy.getByTestId('"Ledger entries"').click();
      cy.get('fieldset.ag-simple-filter-body-wrapper').should('not.exist');
    });
  });
});
