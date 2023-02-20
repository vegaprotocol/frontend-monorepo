import { createWalletClient, sendVegaTx } from '../capsule/wallet-client';
import type { ProposalSubmissionBody } from '@vegaprotocol/wallet';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      VegaWalletSubmitProposal(proposalTx: ProposalSubmissionBody): void;
    }
  }
}

export const addVegaWalletSubmitProposal = () => {
  Cypress.Commands.add('VegaWalletSubmitProposal', (proposalTx) => {
    const vegaWalletUrl = Cypress.env('VEGA_WALLET_URL');
    const token = Cypress.env('VEGA_WALLET_API_TOKEN');
    const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');

    createWalletClient(vegaWalletUrl, token);

    cy.highlight('Submitting proposal');
    sendVegaTx(vegaPubKey, proposalTx);
  });
};
