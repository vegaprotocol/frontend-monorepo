import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
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
  const [
    mostRecentlyEnactedAssociatedMarketProposal,
    setMostRecentlyEnactedAssociatedMarketProposal,
  ] = useState(undefined);
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
    state: {
      data: previouslyEnactedMarketProposalsRestData,
      loading: previouslyEnactedMarketProposalsRestLoading,
      error: previouslyEnactedMarketProposalsRestError,
    },
  } = useFetch(
    `${ENV.rest}governances?proposalState=STATE_ENACTED&proposalType=TYPE_UPDATE_MARKET`,
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
    if (
      previouslyEnactedMarketProposalsRestData &&
      data?.proposal?.terms.change.__typename === 'UpdateMarket'
    ) {
      const change = data?.proposal?.terms?.change as { marketId: string };

      const filteredProposals =
        // @ts-ignore rest data is not typed
        previouslyEnactedMarketProposalsRestData.connection.edges.filter(
          // @ts-ignore rest data is not typed
          ({ node }) =>
            node?.proposal?.terms?.updateMarket?.marketId === change.marketId
        );

      const sortedProposals = filteredProposals.sort(
        // @ts-ignore rest data is not typed
        (a, b) =>
          new Date(a?.node?.terms?.enactmentTimestamp).getTime() -
          new Date(b?.node?.terms?.enactmentTimestamp).getTime()
      );

      setMostRecentlyEnactedAssociatedMarketProposal(
        sortedProposals[sortedProposals.length - 1]
      );
    }
  }, [
    previouslyEnactedMarketProposalsRestData,
    params.proposalId,
    data?.proposal?.terms.change.__typename,
    data?.proposal?.terms.change,
  ]);

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
          : false) ||
        (previouslyEnactedMarketProposalsRestLoading
          ? (previouslyEnactedMarketProposalsRestLoading as boolean)
          : false)
      }
      error={
        error ||
        newMarketError ||
        assetError ||
        restError ||
        originalMarketProposalRestError ||
        previouslyEnactedMarketProposalsRestError
      }
      data={{
        ...data,
        ...(newMarketData ? { newMarketData } : {}),
        ...(assetData ? { assetData } : {}),
        ...(restData ? { restData } : {}),
        ...(originalMarketProposalRestData
          ? { originalMarketProposalRestData }
          : {}),
        ...(previouslyEnactedMarketProposalsRestData
          ? { previouslyEnactedMarketProposalsRestData }
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
          mostRecentlyEnactedAssociatedMarketProposal={
            mostRecentlyEnactedAssociatedMarketProposal
          }
        />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
