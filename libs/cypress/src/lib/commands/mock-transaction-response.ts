import merge from 'lodash/merge';
import type { TransactionResponse } from '@vegaprotocol/wallet';
import type { PartialDeep } from 'type-fest';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockVegaWalletTransaction(
        delayValue?: number,
        override?: PartialDeep<TransactionResponse>
      ): void;
    }
  }
}

export function addMockTransactionResponse() {
  Cypress.Commands.add(
    'mockVegaWalletTransaction',
    (delayValue?: number, override?: PartialDeep<TransactionResponse>) => {
      const defaultTransactionResponse = {
        transactionHash: 'test-tx-hash',
        sentAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        transaction: {
          input_data:
            'CPe6vpiqsPqxDBDC1w7KPkoKQGE4Y2M0NjUwMjhiMGY4OTM4YTYzZTEzNDViYzM2ODc3ZWRmODg4MjNmOWU0ZmI4ZDRlN2VkMmFlMzAwNzA3ZTMYASABKAM4Ag==',
          signature: {
            // sig value needs to be 'real' so sigToId function doesn't error out
            value:
              'd86138bba739bbc1069b3dc975d20b3a1517c2b9bdd401c70eeb1a0ecbc502ec268cf3129824841178b8b506b0b7d650c76644dbd96f524a6cb2158fb7121800',
            algo: 'vega/ed25519',
            version: 1,
          },
          From: {
            PubKey: Cypress.env('VEGA_PUBLIC_KEY'),
          },
          version: 3,
          pow: {
            tid: '0CEEC2FDFDB5D68BC0C1E2640440E4AA11E49986CB2929E0F3572E16CB7DC59C',
            nonce: 23525,
          },
        },
      };

      cy.intercept('POST', 'http://localhost:1789/api/v2/requests', (req) => {
        req.on('response', (res) => {
          res.setDelay(delayValue ?? 0);
          res.statusCode = 400;
          res.send({
            jsonrpc: '2.0',
            result: merge(defaultTransactionResponse, override),
            id: '1',
          });
        });
      }).as('VegaWalletTransaction');
    }
  );
}
