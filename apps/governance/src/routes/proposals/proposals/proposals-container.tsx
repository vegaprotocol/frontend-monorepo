import flow from 'lodash/flow';
import compact from 'lodash/compact';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { getNodes } from '@vegaprotocol/utils';
import {
  ProposalState,
  ProtocolUpgradeProposalStatus,
} from '@vegaprotocol/types';
import { type NodeConnection, type NodeEdge } from '@vegaprotocol/utils';
import { useProposalsQuery } from './__generated__/Proposals';
import { type ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { useProtocolUpgradeProposalsQuery } from '@vegaprotocol/proposals';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { type ListProposals } from '../types';

export function getNotRejectedProposals(data?: ListProposals) {
  if (!data) return [];
  return data.filter((p) => p.state !== ProposalState.STATE_REJECTED);
}

export function getNotRejectedProtocolUpgradeProposals<
  T extends ProtocolUpgradeProposalFieldsFragment
>(data?: NodeConnection<NodeEdge<T>> | null): T[] {
  return flow([
    (data) =>
      getNodes<ProtocolUpgradeProposalFieldsFragment>(data, (p) =>
        p
          ? p.status !==
            ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED
          : false
      ),
  ])(data);
}

export const ProposalsContainer = () => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: {
      includeNewMarketProductFields: !!featureFlags.PRODUCT_PERPETUALS,
      includeUpdateMarketStates: !!featureFlags.UPDATE_MARKET_STATE,
      includeUpdateReferralPrograms: !!featureFlags.REFERRALS,
    },
  });

  const {
    data: protocolUpgradesData,
    loading: protocolUpgradesLoading,
    error: protocolUpgradesError,
  } = useProtocolUpgradeProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  });

  const proposals = useMemo(
    () =>
      getNotRejectedProposals(
        compact(data?.proposalsConnection?.edges?.map((e) => e?.proposalNode))
      ),
    [data]
  );

  const protocolUpgradeProposals = useMemo(
    () =>
      protocolUpgradesData
        ? getNotRejectedProtocolUpgradeProposals(
            protocolUpgradesData.protocolUpgradeProposals
          )
        : [],
    [protocolUpgradesData]
  );

  if (error || protocolUpgradesError) {
    return (
      <Callout intent={Intent.Danger} title={t('Something went wrong')}>
        <pre>{error?.message || protocolUpgradesError?.message}</pre>
      </Callout>
    );
  }

  if (loading || protocolUpgradesLoading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <ProposalsList
      proposals={proposals}
      protocolUpgradeProposals={protocolUpgradeProposals}
      lastBlockHeight={protocolUpgradesData?.lastBlockHeight}
    />
  );
};
