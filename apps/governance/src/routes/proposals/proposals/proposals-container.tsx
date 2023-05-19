import flow from 'lodash/flow';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { useProposalsQuery } from './__generated__/Proposals';
import { getNodes } from '@vegaprotocol/utils';
import {
  ProposalState,
  ProtocolUpgradeProposalStatus,
} from '@vegaprotocol/types';
import type { NodeConnection, NodeEdge } from '@vegaprotocol/utils';
import type { ProposalFieldsFragment } from './__generated__/Proposals';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { useProtocolUpgradeProposalsQuery } from '@vegaprotocol/proposals';

export function getNotRejectedProposals<T extends ProposalFieldsFragment>(
  data?: NodeConnection<NodeEdge<T>> | null
): T[] {
  return flow([
    (data) =>
      getNodes<ProposalFieldsFragment>(data, (p) =>
        p ? p.state !== ProposalState.STATE_REJECTED : false
      ),
  ])(data);
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
  const { t } = useTranslation();
  const { data, loading, error } = useProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
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
    () => getNotRejectedProposals(data?.proposalsConnection),
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
