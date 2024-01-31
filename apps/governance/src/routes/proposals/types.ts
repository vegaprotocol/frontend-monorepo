import { type ProposalQuery } from './proposal/__generated__/Proposal';
import {
  type BatchProposalFieldsFragment,
  type ProposalFieldsFragment,
} from './proposals/__generated__/Proposals';

/**
 * The default Proposal type needs extracting from the ProposalNode union type
 * as lots of fields on the original type don't exist on BatchProposal. Eventually
 * we will support BatchProposal but for now we don't
 */
export type Proposal = Extract<
  ProposalQuery['proposal'],
  { __typename?: 'Proposal' }
>;
export type BatchProposal = Extract<
  ProposalQuery['proposal'],
  { __typename?: 'BatchProposal' }
>;

export type ListProposal = ProposalFieldsFragment;
export type ListBatchProposal = BatchProposalFieldsFragment;
export type ListProposals = Array<ListProposal | ListBatchProposal>;

export type ProposalType = NonNullable<
  Proposal['terms']['change']['__typename']
>;
