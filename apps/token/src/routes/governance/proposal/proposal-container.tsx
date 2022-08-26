import { useProposalQuery } from '@vegaprotocol/governance';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();

  const { data, loading, error } = useProposalQuery(params.proposalId);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && (
        <Proposal proposal={data.proposal} terms={data.proposal.terms} />
      )}
    </AsyncRenderer>
  );
};
