import { aliasGQLQuery } from '@vegaprotocol/cypress';
import {
  accountsQuery,
  amendGeneralAccountBalance,
  amendMarginAccountBalance,
} from '@vegaprotocol/mock';

describe.skip(
  'account validation',
  { tags: '@regression', testIsolation: true },
  () => {
    describe('zero balance error', () => {
      beforeEach(() => {
        cy.setVegaWallet();
        cy.mockTradingPage();
        let accounts = accountsQuery();
        accounts = amendMarginAccountBalance(accounts, 'market-0', '1000');
        accounts = amendGeneralAccountBalance(accounts, 'market-0', '0');
        cy.mockGQL((req) => {
          aliasGQLQuery(req, 'Accounts', accounts);
        });
        cy.mockSubscription();
        cy.visit('/#/markets/market-0');
        cy.wait('@Markets');
      });

      it('should show an error if your balance is zero', () => {
        const accounts = accountsQuery();
        amendMarginAccountBalance(accounts, 'market-0', '0');
        cy.mockGQL((req) => {
          aliasGQLQuery(req, 'Accounts', accounts);
        });
        // 7002-SORD-060
        cy.getByTestId('place-order').should('be.enabled');
        // 7002-SORD-003
        cy.getByTestId('deal-ticket-error-message-zero-balance').should(
          'have.text',
          'You need ' +
            'tDAI' +
            ' in your wallet to trade in this market. See all your collateral.Make a deposit'
        );
        cy.getByTestId('deal-ticket-deposit-dialog-button').should('exist');
      });
    });

    describe('not enough balance warning', () => {
      beforeEach(() => {
        cy.setVegaWallet();
        cy.mockTradingPage();
        let accounts = accountsQuery();
        accounts = amendMarginAccountBalance(accounts, 'market-0', '1000');
        accounts = amendGeneralAccountBalance(accounts, 'market-0', '1');
        cy.mockGQL((req) => {
          aliasGQLQuery(req, 'Accounts', accounts);
        });
        cy.mockSubscription();
        cy.visit('/#/markets/market-0');
        cy.wait('@Markets');

        cy.get('[data-testid="deal-ticket-form"]').then(($form) => {
          if (!$form.length) {
            cy.getByTestId('Order').click();
          }
        });
      });

      it('should display info and button for deposit', () => {
        // 7002-SORD-003

        // warning should show immediately
        cy.getByTestId('deal-ticket-warning-margin').should(
          'contain.text',
          'You may not have enough margin available to open this position'
        );
        cy.getByTestId('deal-ticket-warning-margin').should(
          'contain.text',
          'You may not have enough margin available to open this position. 5.00 tDAI is currently required. You have only 0.01001 tDAI available.'
        );
        cy.getByTestId('deal-ticket-deposit-dialog-button').click();
        cy.getByTestId('sidebar-content')
          .find('h2')
          .eq(0)
          .should('have.text', 'Deposit');
      });
    });
  }
);
