import { type ProposalNode } from '@vegaprotocol/types';
import {
  type BatchProposalFieldsFragment,
  type ProposalFieldsFragment,
} from './__generated__/Proposals';

/**
 * The default Proposal type needs extracting from the ProposalNode union type
 * as lots of fields on the original type don't exist on BatchProposal. Eventually
 * we will support BatchProposal but for now we don't
 */
export type Proposal = ProposalFieldsFragment;
export type BatchProposal = BatchProposalFieldsFragment;

export type ProposalChangeType = NonNullable<
  Proposal['terms']['change']['__typename']
>;

export type ProposalType = NonNullable<ProposalNode['__typename']>;
