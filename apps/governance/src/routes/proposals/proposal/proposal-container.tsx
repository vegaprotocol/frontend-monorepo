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
import { useAssetQuery } from '@vegaprotocol/assets';

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

  const {
    data: originalMarketData,
    loading: originalMarketLoading,
    error: originalMarketError,
  } = useDataProvider({
    dataProvider: marketInfoWithDataProvider,
    skipUpdates: true,
    variables: {
      marketId:
        (data?.proposal?.terms.change.__typename === 'UpdateMarket' &&
          data?.proposal?.terms?.change?.marketId) ||
        '',
      skip:
        data?.proposal?.terms.change.__typename !== 'UpdateMarket' ||
        !data?.proposal?.id,
    },
  });

  const {
    data: assetData,
    loading: assetLoading,
    error: assetError,
  } = useAssetQuery({
    fetchPolicy: 'network-only',
    variables: {
      assetId:
        (data?.proposal?.terms.change.__typename === 'NewAsset' &&
          data?.proposal?.id) ||
        (data?.proposal?.terms.change.__typename === 'UpdateAsset' &&
          data.proposal.terms.change.assetId) ||
        '',
    },
    skip: !['NewAsset', 'UpdateAsset'].includes(
      data?.proposal?.terms?.change?.__typename || ''
    ),
  });

  useEffect(() => {
    const interval = setInterval(refetch, 2000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <AsyncRenderer
      loading={
        loading || newMarketLoading || originalMarketLoading || assetLoading
      }
      error={error || newMarketError || originalMarketError || assetError}
      data={{
        ...data,
        ...(newMarketData ? { newMarketData } : {}),
        ...(originalMarketData ? { originalMarketData } : {}),
        ...(assetData ? { assetData } : {}),
      }}
    >
      {data?.proposal ? (
        <Proposal
          proposal={data.proposal}
          restData={restData}
          newMarketData={newMarketData}
          originalMarketData={originalMarketData}
          assetData={assetData}
        />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
