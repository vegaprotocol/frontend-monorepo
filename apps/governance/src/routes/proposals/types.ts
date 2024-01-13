import type { ProposalQuery } from './proposal/__generated__/Proposal';

/**
 * The default Proposal type needs extracting from the ProposalNode union type
 * as lots of fields on the original type don't exist on BatchProposal. Eventually
 * we will support BatchProposal but for now we don't
 */
export type Proposal = Extract<
  ProposalQuery['proposal'],
  { __typename?: 'Proposal' }
>;
