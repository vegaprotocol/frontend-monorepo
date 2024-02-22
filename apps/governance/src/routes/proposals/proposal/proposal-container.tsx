import { useParams } from 'react-router-dom';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useProposalQuery } from '../__generated__/Proposals';
import { useFetchProposal } from '../components/proposal/proposal-utils';

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();

  const { data: restData, loading: restLoading } = useFetchProposal({
    proposalId: params.proposalId,
  });

  const { data, loading, error } = useProposalQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: {
      proposalId: params.proposalId || '',
    },
    skip: !params.proposalId,
    pollInterval: 2000,
  });

  return (
    <AsyncRenderer
      loading={Boolean(loading || restLoading)}
      error={error}
      data={{
        ...data,
        ...(restData ? { restData } : {}),
      }}
    >
      {data?.proposal ? (
        <Proposal proposal={data.proposal} restData={restData} />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
