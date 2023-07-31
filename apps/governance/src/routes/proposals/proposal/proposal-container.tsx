import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useProposalQuery } from './__generated__/Proposal';
import { useFetch } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketInfoWithDataProvider } from '@vegaprotocol/markets';
import { useAssetQuery } from '@vegaprotocol/assets';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useEnvironment } from '@vegaprotocol/environment';

export const ProposalContainer = () => {
  const { VEGA_REST_URL } = useEnvironment();
  const REST_ENDPOINT = VEGA_REST_URL;
  const [
    mostRecentlyEnactedAssociatedMarketProposal,
    setMostRecentlyEnactedAssociatedMarketProposal,
  ] = useState(undefined);
  const params = useParams<{ proposalId: string }>();

  const {
    params: networkParams,
    loading: networkParamsLoading,
    error: networkParamsError,
  } = useNetworkParams([
    NetworkParams.governance_proposal_market_minVoterBalance,
    NetworkParams.governance_proposal_updateMarket_minVoterBalance,
    NetworkParams.governance_proposal_asset_minVoterBalance,
    NetworkParams.governance_proposal_updateAsset_minVoterBalance,
    NetworkParams.governance_proposal_updateNetParam_minVoterBalance,
    NetworkParams.governance_proposal_freeform_minVoterBalance,
    NetworkParams.spam_protection_voting_min_tokens,
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_updateAsset_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredMajority,
  ]);

  const {
    state: { data: restData, loading: restLoading, error: restError },
  } = useFetch(`${REST_ENDPOINT}governance?proposalId=${params.proposalId}`);

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
    `${REST_ENDPOINT}governance?proposalId=${
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
    `${REST_ENDPOINT}governances?proposalState=STATE_ENACTED&proposalType=TYPE_UPDATE_MARKET`,
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
        networkParamsLoading ||
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
        previouslyEnactedMarketProposalsRestError ||
        networkParamsError
      }
      data={{
        ...data,
        ...networkParams,
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
          networkParams={networkParams}
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
