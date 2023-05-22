import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useProposalQuery } from './__generated__/Proposal';
import { useFetch } from '@vegaprotocol/react-helpers';
import { ENV } from '../../../config';

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();
  const {
    state: { data: restData },
  } = useFetch(`${ENV.rest}governance?proposalId=${params.proposalId}`);
  const { data, loading, error, refetch } = useProposalQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
  });

  useEffect(() => {
    const interval = setInterval(refetch, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data?.proposal ? (
        <Proposal proposal={data.proposal} restData={restData} />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
