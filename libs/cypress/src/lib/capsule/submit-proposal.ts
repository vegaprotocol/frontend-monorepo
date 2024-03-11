import { determineId, type ProposalSubmissionBody } from '@vegaprotocol/wallet';
import { sendVegaTx } from './wallet-client';
import { waitForProposal } from './propose-market';
const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');

export async function submitProposal(proposalTx: ProposalSubmissionBody) {
  cy.highlight('Submitting proposal');
  const result = await sendVegaTx(vegaPubKey, proposalTx);
  await waitForProposal(determineId(result.result.transaction.signature.value));
}
