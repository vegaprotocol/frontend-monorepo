import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { useProposalsQuery } from './__generated__/Proposals';
import { getNodes } from '@vegaprotocol/utils';
import flow from 'lodash/flow';
import {
  ProposalState,
  ProtocolUpgradeProposalStatus,
} from '@vegaprotocol/types';
import type { NodeConnection, NodeEdge } from '@vegaprotocol/utils';
import type { ProposalFieldsFragment } from './__generated__/Proposals';
import orderBy from 'lodash/orderBy';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';
import { useProtocolUpgradeProposalsQuery } from '@vegaprotocol/proposals';

export const orderByDateAsc = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.closingDatetime).getTime(),
      (p) => new Date(p?.datetime).getTime(),
    ],
    ['asc', 'asc']
  );

export const orderByDateDesc = (arr: ProposalFieldsFragment[]) =>
  orderBy(
    arr,
    [
      (p) => new Date(p?.terms?.closingDatetime).getTime(),
      (p) => new Date(p?.datetime).getTime(),
    ],
    ['desc', 'desc']
  );

const orderByUpgradeBlockHeight = (
  arr: ProtocolUpgradeProposalFieldsFragment[]
) =>
  orderBy(
    arr,
    [(p) => p?.upgradeBlockHeight, (p) => p.vegaReleaseTag],
    ['desc', 'desc']
  );

export function getNotRejectedProposals<T extends ProposalFieldsFragment>(
  data?: NodeConnection<NodeEdge<T>> | null
): T[] {
  return getNodes(data, (p) =>
    p ? p.state !== ProposalState.STATE_REJECTED : false
  );
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
    orderByUpgradeBlockHeight,
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
    () =>
      getNotRejectedProposals<ProposalFieldsFragment>(
        data?.proposalsConnection
      ),
    [data]
  );

  const protocolUpgradeProposals = useMemo(
    () =>
      protocolUpgradesData
        ? getNotRejectedProtocolUpgradeProposals<ProtocolUpgradeProposalFieldsFragment>(
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
