import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useProtocolUpgradeProposalsQuery } from './__generated__/ProtocolUpgradeProposals';

export const useNextProtocolUpgradeProposals = (since?: number) => {
  const { data, loading, error } = useProtocolUpgradeProposalsQuery({
    pollInterval: 5000,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    variables: {
      inState:
        Schema.ProtocolUpgradeProposalStatus
          .PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED,
    },
  });

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

export const useNextProtocolUpgradeProposal = (since?: number) => {
  const { data, lastBlockHeight, loading, error } =
    useNextProtocolUpgradeProposals(since);

  return {
    data: !data ? undefined : data[0],
    lastBlockHeight,
    loading,
    error,
  };
};
