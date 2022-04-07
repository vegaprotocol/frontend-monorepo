import { Heading } from "../../../../components/heading";
import { getProposalName } from "../../../../lib/type-policies/proposal";
import { Proposal_proposal } from "../../proposal/__generated__/Proposal";
import { RestProposalResponse } from "../../proposal/proposal-container";
import { ProposalChangeTable } from "../proposal-change-table";
import { ProposalTermsJson } from "../proposal-terms-json";
import { ProposalVotesTable } from "../proposal-votes-table";
import { VoteDetails } from "../vote-details";

interface ProposalProps {
  proposal: Proposal_proposal;
  terms: RestProposalResponse;
}

export const Proposal = ({ proposal, terms }: ProposalProps) => {
  if (!proposal) {
    return null;
  }

  return (
    <>
      <Heading title={getProposalName(proposal.terms.change)} />
      <ProposalChangeTable proposal={proposal} />
      <VoteDetails proposal={proposal} />
      <ProposalVotesTable proposal={proposal} />
      <ProposalTermsJson terms={terms} />
    </>
  );
};
