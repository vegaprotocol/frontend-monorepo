import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useProposalQuery } from '@vegaprotocol/governance';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();
  const { data, loading, error, refetch } = useProposalQuery({
    fetchPolicy: 'network-only',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
  });

  useEffect(() => {
    const interval = setInterval(refetch, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && <Proposal proposal={data.proposal} />}
    </AsyncRenderer>
  );
};
