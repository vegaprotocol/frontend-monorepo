import * as Schema from '@vegaprotocol/types';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import { createOrder } from '../support/create-order';

describe(
  'vega wallet - prompt',
  { tags: '@regression', testIsolation: true },
  () => {
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
