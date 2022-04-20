import merge from 'lodash/merge';
import type { TransactionResponse } from '@vegaprotocol/vegawallet-service-api-client';
import type { PartialDeep } from 'type-fest';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockVegaCommandSync(override: PartialDeep<TransactionResponse>): void;
    }
  }
}

export function addMockVegaWalletCommands() {
  Cypress.Commands.add(
    // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
    'mockVegaCommandSync',
    (override?: PartialDeep<TransactionResponse>) => {
      const defaultTransactionResponse = {
        txHash: 'tx-hash',
        tx: {
          input_data:
            'CPe6vpiqsPqxDBDC1w7KPkoKQGE4Y2M0NjUwMjhiMGY4OTM4YTYzZTEzNDViYzM2ODc3ZWRmODg4MjNmOWU0ZmI4ZDRlN2VkMmFlMzAwNzA3ZTMYASABKAM4Ag==',
          signature: {
            // sig value needs to be 'real' so sigToId function doesn't error out
            value: 'signature',
            algo: 'vega/ed25519',
            version: 1,
          },
          From: {
            PubKey: Cypress.env('vegaPublicKey'),
          },
          version: 2,
          pow: {
            tid: '0CEEC2FDFDB5D68BC0C1E2640440E4AA11E49986CB2929E0F3572E16CB7DC59C',
            nonce: 23525,
          },
        },
      };

      cy.intercept('POST', 'http://localhost:1789/api/v1/command/sync', {
        body: merge(defaultTransactionResponse, override),
      }).as('VegaCommandSync');
    }
  );
}
