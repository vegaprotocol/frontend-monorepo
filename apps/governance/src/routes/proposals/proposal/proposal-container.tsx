import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Proposal } from '../components/proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useProposalQuery } from '../__generated__/Proposals';
import { useFetch } from '@vegaprotocol/react-helpers';
import { ENV } from '../../../config';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketInfoProvider } from '@vegaprotocol/markets';
import { useAssetQuery } from '@vegaprotocol/assets';
import {
  NetworkParams,
  useNetworkParams,
  type NetworkParamsResult,
} from '@vegaprotocol/network-parameters';
import { useParentMarketIdQuery } from '@vegaprotocol/markets';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { useSuccessorMarketProposalDetails } from '@vegaprotocol/proposals';
import { type BatchProposal, type Proposal as IProposal } from '../types';

export const ProposalContainer = () => {
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
    NetworkParams.governance_proposal_referralProgram_minVoterBalance,
    NetworkParams.governance_proposal_VolumeDiscountProgram_minVoterBalance,
    NetworkParams.spam_protection_voting_min_tokens,
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_updateAsset_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredMajority,
    NetworkParams.governance_proposal_referralProgram_requiredMajority,
    NetworkParams.governance_proposal_VolumeDiscountProgram_requiredMajority,
  ]);

  const {
    state: { data: restData, loading: restLoading, error: restError },
  } = useFetch(`${ENV.rest}governance?proposalId=${params.proposalId}`);

  const { data, loading, error, refetch } = useProposalQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: {
      proposalId: params.proposalId || '',
    },
    skip: !params.proposalId,
  });

  const proposal = data?.proposal;

  useEffect(() => {
    const interval = setInterval(refetch, 2000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (proposal?.__typename === 'Proposal') {
    return (
      <AsyncRenderer
        loading={Boolean(loading || networkParamsLoading || restLoading)}
        error={error || networkParamsError || restError}
        data={{
          ...data,
          ...networkParams,
          ...(restData ? { restData } : {}),
        }}
      >
        {data?.proposal ? (
          <SingleProposalContainer
            proposal={proposal}
            networkParams={networkParams}
            restData={restData}
          />
        ) : (
          <ProposalNotFound />
        )}
      </AsyncRenderer>
    );
  }

  if (proposal?.__typename === 'BatchProposal') {
    return <BatchProposalContainer proposal={proposal} />;
  }

  return null;
};

export const SingleProposalContainer = ({
  proposal,
  networkParams,
  restData,
}: {
  proposal: IProposal;
  networkParams: Partial<NetworkParamsResult>;
  restData: unknown;
}) => {
  const featureFlags = useFeatureFlags((store) => store.flags);
  const [
    mostRecentlyEnactedAssociatedMarketProposal,
    setMostRecentlyEnactedAssociatedMarketProposal,
  ] = useState(undefined);

  const successor = useSuccessorMarketProposalDetails(proposal.id);
  const isSuccessor = !!successor?.parentMarketId || !!successor.code;

  const {
    state: {
      data: originalMarketProposalRestData,
      loading: originalMarketProposalRestLoading,
      error: originalMarketProposalRestError,
    },
  } = useFetch(
    `${ENV.rest}governance?proposalId=${
      proposal?.terms.change.__typename === 'UpdateMarket' &&
      proposal.terms.change.marketId
    }`,
    undefined,
    true,
    proposal?.terms.change.__typename !== 'UpdateMarket'
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
    proposal?.terms.change.__typename !== 'UpdateMarket'
  );

  const {
    data: marketData,
    loading: marketLoading,
    error: marketError,
  } = useDataProvider({
    dataProvider: marketInfoProvider,
    skipUpdates: true,
    variables: {
      marketId: proposal?.id || '',
      skip: !proposal?.id,
    },
  });

  const {
    data: parentMarketId,
    loading: parentMarketIdLoading,
    error: parentMarketIdError,
  } = useParentMarketIdQuery({
    variables: {
      marketId: marketData?.id || '',
    },
    skip: !featureFlags.SUCCESSOR_MARKETS || !isSuccessor || !marketData?.id,
  });

  const {
    data: parentMarketData,
    loading: parentMarketLoading,
    error: parentMarketError,
  } = useDataProvider({
    dataProvider: marketInfoProvider,
    skipUpdates: true,
    variables: {
      marketId: parentMarketId?.market?.parentMarketID || '',
      skip:
        !featureFlags.SUCCESSOR_MARKETS ||
        !isSuccessor ||
        !parentMarketId?.market?.parentMarketID,
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
        (proposal?.terms.change.__typename === 'NewAsset' && proposal?.id) ||
        (proposal?.terms.change.__typename === 'UpdateAsset' &&
          proposal.terms.change.assetId) ||
        '',
    },
    skip: !['NewAsset', 'UpdateAsset'].includes(
      proposal?.terms?.change?.__typename || ''
    ),
  });

  useEffect(() => {
    if (
      previouslyEnactedMarketProposalsRestData &&
      proposal?.terms.change.__typename === 'UpdateMarket'
    ) {
      const change = proposal?.terms?.change as { marketId: string };

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
    proposal?.terms.change.__typename,
    proposal?.terms.change,
  ]);

  return (
    <AsyncRenderer
      loading={
        marketLoading ||
        assetLoading ||
        parentMarketIdLoading ||
        parentMarketLoading ||
        (originalMarketProposalRestLoading
          ? (originalMarketProposalRestLoading as boolean)
          : false) ||
        (previouslyEnactedMarketProposalsRestLoading
          ? (previouslyEnactedMarketProposalsRestLoading as boolean)
          : false)
      }
      error={
        marketError ||
        assetError ||
        parentMarketIdError ||
        parentMarketError ||
        originalMarketProposalRestError ||
        previouslyEnactedMarketProposalsRestError
      }
      data={{
        ...(marketData ? { newMarketData: marketData } : {}),
        ...(parentMarketData ? { parentMarketData } : {}),
        ...(assetData ? { assetData } : {}),
        ...(originalMarketProposalRestData
          ? { originalMarketProposalRestData }
          : {}),
        ...(previouslyEnactedMarketProposalsRestData
          ? { previouslyEnactedMarketProposalsRestData }
          : {}),
      }}
    >
      {proposal ? (
        <Proposal
          proposal={proposal}
          networkParams={networkParams}
          restData={restData}
          marketData={marketData}
          parentMarketData={parentMarketData}
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

const BatchProposalContainer = ({ proposal }: { proposal: BatchProposal }) => {
  // TODO: handle batch
  return <div>Batch</div>;
};
