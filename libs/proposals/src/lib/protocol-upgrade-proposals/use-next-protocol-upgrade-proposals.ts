import { useMemo, useEffect } from 'react';
import * as Schema from '@vegaprotocol/types';
import { removePaginationWrapper, isTestEnv } from '@vegaprotocol/utils';
import { useProtocolUpgradeProposalsQuery } from './__generated__/ProtocolUpgradeProposals';
import { useLocalStorageSnapshot } from '@vegaprotocol/react-helpers';
import pick from 'lodash/pick';

const POLL_INTERVAL = 5000; // ms

export const NEXT_PROTOCOL_UPGRADE_PROPOSAL_SNAPSHOT =
  'next_protocol_upgrade_proposal';

export const useNextProtocolUpgradeProposals = (since?: number) => {
  const { data, loading, error, startPolling, stopPolling } =
    useProtocolUpgradeProposalsQuery({
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
      variables: {
        inState:
          Schema.ProtocolUpgradeProposalStatus
            .PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED,
      },
    });

  useEffect(() => {
    if (error) {
      stopPolling();
      return;
    }

    if (!isTestEnv() && window.location.hostname !== 'localhost') {
      startPolling(POLL_INTERVAL);
    }
  }, [error, startPolling, stopPolling]);

  const nextUpgrades = useMemo(() => {
    if (!data) return [];

    const proposals = removePaginationWrapper(
      data?.protocolUpgradeProposals?.edges
    );

    return proposals
      .filter(
        (p) =>
          Number(p.upgradeBlockHeight) > (since || Number(data.lastBlockHeight))
      )
      .sort(
        (a, b) => Number(a.upgradeBlockHeight) - Number(b.upgradeBlockHeight)
      );
  }, [data, since]);

  return {
    data: nextUpgrades,
    lastBlockHeight: data?.lastBlockHeight,
    loading,
    error,
  };
};

export type StoredNextProtocolUpgradeData = {
  vegaReleaseTag: string;
  upgradeBlockHeight: string;
};
export const useNextProtocolUpgradeProposal = (
  since?: number,
  persist = false
) => {
  const { data, lastBlockHeight, loading, error } =
    useNextProtocolUpgradeProposals(since);

  const [, setNextUpgrade] = useLocalStorageSnapshot(
    NEXT_PROTOCOL_UPGRADE_PROPOSAL_SNAPSHOT
  );
  useEffect(() => {
    if (data && persist) {
      setNextUpgrade(
        JSON.stringify(pick(data, 'upgradeBlockHeight', 'vegaReleaseTag'))
      );
    }
  }, [data, persist, setNextUpgrade]);

  return {
    data: !data ? undefined : data[0],
    lastBlockHeight,
    loading,
    error,
  };
};
