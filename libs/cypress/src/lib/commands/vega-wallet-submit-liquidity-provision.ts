import type { LiquidityProvisionSubmission } from '@vegaprotocol/wallet';
import { createWalletClient, sendVegaTx } from '../capsule/wallet-client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      VegaWalletSubmitLiquidityProvision(
        marketId: string,
        amount: string
      ): void;
    }
  }
}

export const addVegaWalletSubmitLiquidityProvision = () => {
  Cypress.Commands.add(
    'VegaWalletSubmitLiquidityProvision',
    (marketId, amount) => {
      const vegaWalletUrl = Cypress.env('VEGA_WALLET_URL');
      const token = Cypress.env('VEGA_WALLET_API_TOKEN');
      const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');

      const liquidityProvisionTx: LiquidityProvisionSubmission = {
        liquidityProvisionSubmission: {
          marketId: marketId,
          commitmentAmount: amount,
          fee: '0.001',
          buys: [
            {
              offset: '10',
              proportion: 1,
              reference: 1, //vegaProtos.PeggedReference.PEGGED_REFERENCE_MID,
            },
            {
              offset: '12',
              proportion: 2,
              reference: 1, //vegaProtos.PeggedReference.PEGGED_REFERENCE_MID,
            },
          ],
          sells: [
            {
              offset: '10',
              proportion: 2,
              reference: 1, //vegaProtos.PeggedReference.PEGGED_REFERENCE_MID,
            },
            {
              offset: '12',
              proportion: 2,
              reference: 1, //vegaProtos.PeggedReference.PEGGED_REFERENCE_MID,
            },
          ],
          reference: '',
        },
        pubKey: vegaPubKey,
        propagate: true,
      } as LiquidityProvisionSubmission;

      createWalletClient(vegaWalletUrl, token);

      cy.highlight('Submitting liquidity provision');

      sendVegaTx(vegaPubKey, liquidityProvisionTx);
    }
  );
};
