import * as Schema from '@vegaprotocol/types';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { accountsQuery, amendGeneralAccountBalance } from '@vegaprotocol/mock';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import { createOrder } from '../support/create-order';

describe(
  'account validation',
  { tags: '@regression', testIsolation: true },
  () => {
    describe('zero balance error', () => {
      beforeEach(() => {
        cy.setVegaWallet();
        cy.mockTradingPage();
        const accounts = accountsQuery();
        amendGeneralAccountBalance(accounts, 'market-0', '0');
        cy.mockGQL((req) => {
          aliasGQLQuery(req, 'Accounts', accounts);
        });
        cy.mockSubscription();
        cy.visit('/#/markets/market-0');
        cy.wait('@Markets');
      });

      it('should show an error if your balance is zero', () => {
        cy.getByTestId('place-order').should('not.be.disabled');
        // 7002-SORD-003
        cy.getByTestId('dealticket-error-message-zero-balance').should(
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
        const accounts = accountsQuery();
        amendGeneralAccountBalance(accounts, 'market-0', '1');
        cy.mockGQL((req) => {
          aliasGQLQuery(req, 'Accounts', accounts);
        });
        cy.mockSubscription();
        cy.visit('/#/markets/market-0');
        cy.wait('@Markets');
      });

      it('should display info and button for deposit', () => {
        // 7002-SORD-003

        // warning should show immediately
        cy.getByTestId('dealticket-warning-margin').should(
          'contain.text',
          'You may not have enough margin available to open this position'
        );
        cy.getByTestId('dealticket-warning-margin').should(
          'contain.text',
          'You may not have enough margin available to open this position. 5.00 tDAI is currently required. You have only 0.01001 tDAI available.'
        );
        cy.getByTestId('deal-ticket-deposit-dialog-button').click();
        cy.getByTestId('dialog-content')
          .find('h1')
          .eq(0)
          .should('have.text', 'Deposit');
      });
    });

    describe('must submit order', { tags: '@smoke' }, () => {
      // 7002-SORD-039
      beforeEach(() => {
        cy.setVegaWallet();
        cy.mockTradingPage();
        cy.mockSubscription();
        cy.visit('/#/markets/market-0');
        cy.wait('@Markets');
      });

      it('must see a prompt to check connected vega wallet to approve transaction', () => {
        // 0003-WTXN-002
        cy.mockVegaWalletTransaction(1000);
        const order: OrderSubmission = {
          marketId: 'market-0',
          type: Schema.OrderType.TYPE_MARKET,
          side: Schema.Side.SIDE_BUY,
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
          size: '100',
        };
        createOrder(order);
        cy.getByTestId('toast-content').should(
          'contain.text',
          'Please go to your Vega wallet application and approve or reject the transaction.'
        );
      });

      it('must show error returned by wallet ', () => {
        // 0003-WTXN-009
        // 0003-WTXN-011
        // 0002-WCON-016
        // 0003-WTXN-008

        //trigger error from the wallet
        cy.intercept('POST', 'http://localhost:1789/api/v2/requests', (req) => {
          req.on('response', (res) => {
            res.send({
              jsonrpc: '2.0',
              id: '1',
            });
          });
        });

        const order: OrderSubmission = {
          marketId: 'market-0',
          type: Schema.OrderType.TYPE_MARKET,
          side: Schema.Side.SIDE_BUY,
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
          size: '100',
        };
        createOrder(order);
        cy.getByTestId('toast-content').should(
          'contain.text',
          'The connection to your Vega Wallet has been lost.'
        );
        cy.getByTestId('connect-vega-wallet').click();
        cy.getByTestId('dialog-content').should('be.visible');
      });

      it('must see that the order was rejected by the connected wallet', () => {
        // 0003-WTXN-007

        //trigger rejection error from the wallet
        cy.intercept('POST', 'http://localhost:1789/api/v2/requests', (req) => {
          req.alias = 'client.send_transaction';
          req.reply({
            statusCode: 400,
            body: {
              jsonrpc: '2.0',
              error: {
                code: 3001,
                data: 'the user rejected the wallet connection',
                message: 'User error',
              },
              id: '0',
            },
          });
        });

        const order: OrderSubmission = {
          marketId: 'market-0',
          type: Schema.OrderType.TYPE_MARKET,
          side: Schema.Side.SIDE_BUY,
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
          size: '100',
        };
        createOrder(order);
        cy.getByTestId('toast-content').should(
          'contain.text',
          'Error occurredthe user rejected the wallet connection'
        );
      });
    });
  }
);
