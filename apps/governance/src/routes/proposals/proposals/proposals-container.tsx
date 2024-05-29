import flow from 'lodash/flow';
import compact from 'lodash/compact';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import { ProposalsList } from '../components/proposals-list';
import { getNodes } from '@vegaprotocol/utils';
import {
  ProposalState,
  ProtocolUpgradeProposalStatus,
} from '@vegaprotocol/types';
import { type NodeConnection, type NodeEdge } from '@vegaprotocol/utils';
import { useProposalsQuery } from '../__generated__/Proposals';
import {
  useAverageBlockDuration,
  type ProtocolUpgradeProposalFieldsFragment,
} from '@vegaprotocol/proposals';
import { useProtocolUpgradeProposalsQuery } from '@vegaprotocol/proposals';
import { type BatchProposal, type Proposal } from '../types';
import { retrieveBlockInfo } from '@vegaprotocol/tendermint';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export function getNotRejectedProposals(
  data?: Array<Proposal | BatchProposal>
) {
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

const MAX_PAGE_SIZE = 5000;

type BlockTimesStore = {
  blockTimes: Record<string, string>;
  addBlockTime: (height: string, time: string) => void;
};
const useBlockTimes = create<BlockTimesStore>()(
  immer((set, get) => ({
    blockTimes: {},
    addBlockTime: (height: string, time: string) =>
      set((state) => {
        if (!Object.keys(state.blockTimes).includes(height)) {
          state.blockTimes[height] = time;
        }
      }),
  }))
);

export const ProposalsContainer = () => {
  const { t } = useTranslation();

  const averageBlockDuration = useAverageBlockDuration(10) || 1000;
  const [blockTimes, addBlockTime] = useBlockTimes((state) => [
    state.blockTimes,
    state.addBlockTime,
  ]);

  const { data, loading, error } = useProposalsQuery({
    variables: {
      // The pagination doesn't work FFS
      pagination: { first: MAX_PAGE_SIZE },
    },
    // pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    context: { isEnlargedTimeout: true },
  });

  const {
    data: protocolUpgradesData,
    loading: protocolUpgradesLoading,
    error: protocolUpgradesError,
  } = useProtocolUpgradeProposalsQuery({
    // pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    context: { isEnlargedTimeout: true },
  });

  const protocolUpgradeProposals = compact(
    protocolUpgradesData?.protocolUpgradeProposals?.edges?.map((e) => e.node)
  );
  const lastBlockHeight = protocolUpgradesData
    ? Number(protocolUpgradesData.lastBlockHeight)
    : 0;

  const blocks = protocolUpgradeProposals.map((p) => p.upgradeBlockHeight);

  useEffect(() => {
    if (isNaN(lastBlockHeight) || lastBlockHeight === 0) return;
    const proc = async () => {
      const processed = Object.keys(blockTimes);
      let processable = blocks
        .filter((b) => !processed.includes(b))
        .map((b) => Number(b))
        .filter((b) => !isNaN(b) && b < lastBlockHeight);
      processable = [...processable, lastBlockHeight];
      if (processable.length === 0) return;

      const infos = await Promise.all(
        processable.map((b) => retrieveBlockInfo(b))
      );
      infos.forEach((info) => {
        if (info && 'result' in info) {
          const height = info.result.block.header.height;
          const time = info.result.block.header.time;
          addBlockTime(height, time);
        }
      });
    };
    proc();
  }, [addBlockTime, blockTimes, blocks, lastBlockHeight]);

  const enrichedProtocolUpgradeProposals = protocolUpgradeProposals.map(
    (pup) => {
      const now = blockTimes[lastBlockHeight]
        ? new Date(blockTimes[lastBlockHeight]).getTime()
        : Date.now();
      const height = pup.upgradeBlockHeight;
      let timestamp = blockTimes[height];
      if (!timestamp) timestamp = new Date().toISOString();
      if (Number(height) > lastBlockHeight) {
        const diff = (Number(height) - lastBlockHeight) * averageBlockDuration;
        timestamp = new Date(now + diff).toISOString();
      }
      return { ...pup, timestamp: timestamp };
    }
  );

  const governanceProposals = compact(
    data?.proposalsConnection?.edges?.map((e) => e?.proposalNode)
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

  const all = [...governanceProposals, ...enrichedProtocolUpgradeProposals];

  return (
    <ProposalsList
      proposals={all}
      lastBlockHeight={protocolUpgradesData?.lastBlockHeight}
    />
  );
};
