import { useParams } from 'react-router-dom';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useFetch } from '@vegaprotocol/react-helpers';
import { ENV } from '../../../config';
import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useProposalQuery } from '../__generated__/Proposals';

export const ProposalContainer = () => {
  const params = useParams<{ proposalId: string }>();

  const {
    state: { data: restData, loading: restLoading, error: restError },
  } = useFetch(`${ENV.rest}governance?proposalId=${params.proposalId}`);

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
      error={error || restError}
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
