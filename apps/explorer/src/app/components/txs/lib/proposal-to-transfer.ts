import type { components } from '../../../../types/explorer';

type TransferProposal = components['schemas']['vegaNewTransferConfiguration'];
type ActualTransfer = components['schemas']['commandsv1Transfer'];

/**
 * Converts a governance proposal for a transfer in to a transfer command that the
 * TransferDetails component can then render. The types are very similar, but do not
 * map precisely to each other due to some missing fields and some different field
 * names.
 *
 * @param proposal Governance proposal for a transfer
 * @returns transfer a Transfer object as if it had been submitted
 */
export function proposalToTransfer(proposal: TransferProposal): ActualTransfer {
  return {
    amount: proposal.amount,
    asset: proposal.asset,
    // On a transfer, 'from' is determined by the submitter, so there is no 'from' field
    // fromAccountType does exist and is just named differently on the proposal
    fromAccountType: proposal.sourceType,
    oneOff: proposal.oneOff,
    recurring: proposal.recurring,
    // There is no reference applied on governance initiated transfers
    reference: '',
    to: proposal.destination,
    toAccountType: proposal.destinationType,
  };
}
