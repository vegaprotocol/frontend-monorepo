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
    state: { data: restData, loading: restLoading, error: restError },
  } = useFetch(`${ENV.rest}governance?proposalId=${params.proposalId}`);

  const { data, loading, error, refetch } = useProposalQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: { proposalId: params.proposalId || '' },
    skip: !params.proposalId,
  });

  const {
    state: {
      data: originalMarketProposalRestData,
      loading: originalMarketProposalRestLoading,
      error: originalMarketProposalRestError,
    },
  } = useFetch(
    `${ENV.rest}governance?proposalId=${
      data?.proposal?.terms.change.__typename === 'UpdateMarket' &&
      data?.proposal.terms.change.marketId
    }`,
    undefined,
    true,
    data?.proposal?.terms.change.__typename !== 'UpdateMarket'
  );

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
        loading ||
        newMarketLoading ||
        assetLoading ||
        (restLoading ? (restLoading as boolean) : false) ||
        (originalMarketProposalRestLoading
          ? (originalMarketProposalRestLoading as boolean)
          : false)
      }
      error={
        error ||
        newMarketError ||
        assetError ||
        restError ||
        originalMarketProposalRestError
      }
      data={{
        ...data,
        ...(newMarketData ? { newMarketData } : {}),
        ...(assetData ? { assetData } : {}),
        ...(restData ? { restData } : {}),
        ...(originalMarketProposalRestData
          ? { originalMarketProposalRestData }
          : {}),
      }}
    >
      {data?.proposal ? (
        <Proposal
          proposal={data.proposal}
          restData={restData}
          newMarketData={newMarketData}
          assetData={assetData}
          originalMarketProposalRestData={originalMarketProposalRestData}
        />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
