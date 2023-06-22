import { createWalletClient } from '../capsule/wallet-client';
import type { ProposalSubmissionBody } from '@vegaprotocol/wallet';
import { submitProposal } from '../capsule/submit-proposal';

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

    createWalletClient(vegaWalletUrl, token);
    cy.wrap(submitProposal(proposalTx));
  });
};
