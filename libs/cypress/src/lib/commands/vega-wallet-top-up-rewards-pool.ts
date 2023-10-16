import { AccountType } from '@vegaprotocol/types';
import type { TransferBody } from '@vegaprotocol/wallet';
import { createWalletClient, sendVegaTx } from '../capsule/wallet-client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      VegaWalletTopUpRewardsPool(): void;
    }
  }
}

export function addVegaWalletTopUpRewardsPool() {
  Cypress.Commands.add('VegaWalletTopUpRewardsPool', () => {
    let transferStartEpoch = 0;
    let transferEndEpoch = 0;
    const vegaWalletUrl = Cypress.env('VEGA_WALLET_URL');
    const token = Cypress.env('VEGA_WALLET_API_TOKEN');
    const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');
    const assetAddress =
      'b4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b';

    cy.getByTestId('epoch-countdown')
      .within(() => {
        cy.get('h3')
          .invoke('text')
          .then((epochText) => {
            transferStartEpoch = Number(epochText.replace('Epoch', '')) + 5;
            transferEndEpoch = transferStartEpoch + 100;
          });
      })
      .then(() => {
        createWalletClient(vegaWalletUrl, token);

        const transactionBody: TransferBody = {
          transfer: {
            fromAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
            toAccountType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
            to: '0000000000000000000000000000000000000000000000000000000000000000',
            asset: assetAddress,
            amount: '1000000000000000000',
            recurring: {
              factor: '1',
              startEpoch: transferStartEpoch,
              endEpoch: transferEndEpoch,
            },
          },
        };

        cy.highlight('Topping up rewards pool');

        sendVegaTx(vegaPubKey, transactionBody);
      });
  });
}
