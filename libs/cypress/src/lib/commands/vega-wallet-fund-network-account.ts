import { AccountType } from '@vegaprotocol/types';
import type { TransferBody } from '@vegaprotocol/wallet';
import { createWalletClient, sendVegaTx } from '../capsule/wallet-client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      VegaWalletTopUpNetworkAccount(amount: string): void;
    }
  }
}

export function addVegaWalletTopUpNetworkAccount() {
  Cypress.Commands.add('VegaWalletTopUpNetworkAccount', (amount: string) => {
    const vegaWalletUrl = Cypress.env('VEGA_WALLET_URL');
    const token = Cypress.env('VEGA_WALLET_API_TOKEN');
    const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');
    const assetAddress =
      'b4f2726571fbe8e33b442dc92ed2d7f0d810e21835b7371a7915a365f07ccd9b';
    createWalletClient(vegaWalletUrl, token);

    const transactionBody: TransferBody = {
      transfer: {
        fromAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
        toAccountType: AccountType.ACCOUNT_TYPE_NETWORK_TREASURY,
        to: '0000000000000000000000000000000000000000000000000000000000000000',
        asset: assetAddress,
        amount: amount + '0'.repeat(18),
        oneOff: {
          deliverOn: 0,
        },
      },
    };

    cy.highlight('Topping network account');

    sendVegaTx(vegaPubKey, transactionBody);
  });
}
