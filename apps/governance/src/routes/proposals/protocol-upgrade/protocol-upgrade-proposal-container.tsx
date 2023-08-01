import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import {
  convertToCountdownString,
  formatDateWithLocalTimezone,
  removePaginationWrapper,
  stripFullStops,
} from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';

import { ProtocolUpgradeProposal } from './protocol-upgrade-proposal';
import { ProposalNotFound } from '../components/proposal-not-found';
import { useNodesQuery } from '../../staking/home/__generated__/Nodes';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import {
  useProtocolUpgradeProposalsQuery,
  useTimeToUpgrade,
} from '@vegaprotocol/proposals';
import { useBlockInfo } from '@vegaprotocol/tendermint';

export const ProtocolUpgradeProposalContainer = () => {
  const params = useParams<{ proposalReleaseTag: string }>();

  const { data, loading, error, refetch } = useProtocolUpgradeProposalsQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    skip: !params.proposalReleaseTag,
  });

  useEffect(() => {
    const interval = setInterval(refetch, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  const {
    data: nodesData,
    error: nodesError,
    loading: nodesLoading,
    refetch: nodesRefetch,
  } = useNodesQuery();

  useRefreshAfterEpoch(nodesData?.epoch.timestamps.expiry, nodesRefetch);

  const protocolUpgradeProposal = useMemo(() => {
    if (!data?.protocolUpgradeProposals) return null;

    const proposals = removePaginationWrapper(
      data.protocolUpgradeProposals.edges
    );

    return proposals.find(
      ({ vegaReleaseTag }) =>
        params.proposalReleaseTag &&
        params.proposalReleaseTag === stripFullStops(vegaReleaseTag)
    );
  }, [data, params.proposalReleaseTag]);

  const consensusValidators = useMemo(() => {
    if (!nodesData?.nodesConnection.edges) return null;

    const nodes = removePaginationWrapper(nodesData.nodesConnection.edges);

    return nodes.filter(
      ({ rankingScore: { status } }) =>
        status === Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT
    );
  }, [nodesData]);

  const pending =
    Number(protocolUpgradeProposal?.upgradeBlockHeight) >
    Number(data?.lastBlockHeight);

  const {
    state: { data: blockInfo },
  } = useBlockInfo(
    Number(protocolUpgradeProposal?.upgradeBlockHeight),
    !pending
  );
  const time = useTimeToUpgrade(
    Number(protocolUpgradeProposal?.upgradeBlockHeight)
  );

  return (
    <AsyncRenderer
      loading={loading || nodesLoading}
      error={error || nodesError}
      data={{ ...data, ...nodesData }}
    >
      {protocolUpgradeProposal ? (
        <ProtocolUpgradeProposal
          proposal={protocolUpgradeProposal}
          lastBlockHeight={data?.lastBlockHeight}
          consensusValidators={consensusValidators}
          time={
            pending && time ? (
              convertToCountdownString(time, '0:00:00:00')
            ) : blockInfo?.result ? (
              <span title={blockInfo.result.block.header.time}>
                {formatDateWithLocalTimezone(
                  new Date(blockInfo.result.block.header.time)
                )}
              </span>
            ) : (
              '-'
            )
          }
        />
      ) : (
        <ProposalNotFound />
      )}
    </AsyncRenderer>
  );
};
