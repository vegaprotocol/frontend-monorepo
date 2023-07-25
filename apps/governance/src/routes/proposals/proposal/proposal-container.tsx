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
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';

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
        loading || newMarketLoading || assetLoading || networkParamsLoading
      }
      error={error || newMarketError || assetError || networkParamsError}
      data={{
        ...data,
        ...networkParams,
        ...(newMarketData ? { newMarketData } : {}),
        ...(assetData ? { assetData } : {}),
      }}
    >
      {data?.proposal ? (
        <Proposal
          proposal={data.proposal}
          networkParams={networkParams}
          restData={restData}
          newMarketData={newMarketData}
          assetData={assetData}
        />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
