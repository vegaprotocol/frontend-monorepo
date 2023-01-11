import { useFetch } from '@vegaprotocol/react-helpers';
import { useEffect, useMemo } from 'react';

export interface Delegation {
  party: string;
  nodeId: string;
  amount: string;
  epochSeq: string;
}

export interface RankingScore {
  stakeScore: string;
  performanceScore: string;
  previousStatus: string;
  status: string;
  votingPower: number;
  rankingScore: string;
}

export interface Node {
  id: string;
  pubKey: string;
  tmPubKey: string;
  ethereumAdddress: string;
  infoUrl: string;
  location: string;
  stakedByOperator: string;
  stakedByDelegates: string;
  stakedTotal: string;
  maxIntendedStake: string;
  pendingStake: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  epochData?: any;
  status: string;
  delegations: Delegation[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rewardScore?: any;
  rankingScore: RankingScore;
  name: string;
  avatarUrl: string;
}

export interface NodesQuery {
  nodes: Node[];
}

export interface DelegationsQuery {
  delegations: Delegation[];
}

export interface DelegationsNode extends Delegation {
  node: Node | undefined;
}

export const usePartyDelegations = (partyId: string | undefined) => {
  const delegationsUrl = `${process.env['NX_VEGA_REST']}delegations?party=${partyId}`;
  const { state: delegationsData, refetch: refetchDelegations } =
    useFetch<DelegationsQuery>(delegationsUrl);
  const { state: nodesData } = useFetch<NodesQuery>(
    `${process.env['NX_VEGA_REST']}nodes`
  );
  useEffect(() => {
    const interval = setInterval(() => refetchDelegations(), 10000);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [refetchDelegations]);

  const delegations = useMemo<DelegationsNode[] | undefined>(() => {
    if (!delegationsData.data) return [];
    return delegationsData.data?.delegations.map((d) => ({
      ...d,
      node: nodesData.data?.nodes.find(({ id }) => d.nodeId === id),
    }));
  }, [delegationsData.data, nodesData.data?.nodes]);
  return delegations;
};
