import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useProposalQuery } from './__generated__/Proposal';
import { useFetch } from '@vegaprotocol/react-helpers';
import { ENV } from '../../../config';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketInfoWithDataProvider } from '@vegaprotocol/markets';

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

  const {
    data: newMarketData,
    loading: newMarketLoading,
    error: newMarketError,
  } = useDataProvider({
    dataProvider: marketInfoWithDataProvider,
    skipUpdates: true,
    variables: {
      marketId: data?.proposal?.id || '',
      skip: !data?.proposal?.id,
    },
  });

  useEffect(() => {
    const interval = setInterval(refetch, 2000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer
      loading={loading || newMarketLoading}
      error={error || newMarketError}
      data={newMarketData ? { newMarketData, data } : data}
    >
      {data?.proposal ? (
        <Proposal
          proposal={data.proposal}
          restData={restData}
          newMarketData={newMarketData}
        />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
