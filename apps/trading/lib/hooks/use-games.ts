import compact from 'lodash/compact';
import { useActiveRewardsQuery } from '../../components/rewards-container/__generated__/Rewards';
import { isActiveReward } from '../../components/rewards-container/active-rewards';
import {
  EntityScope,
  IndividualScope,
  type TransferNode,
} from '@vegaprotocol/types';

const isScopedToTeams = (node: TransferNode) =>
  node.transfer.kind.__typename === 'RecurringTransfer' &&
  // scoped to teams
  (node.transfer.kind.dispatchStrategy?.entityScope ===
    EntityScope.ENTITY_SCOPE_TEAMS ||
    // or to individuals
    (node.transfer.kind.dispatchStrategy?.entityScope ===
      EntityScope.ENTITY_SCOPE_INDIVIDUALS &&
      // but they have to be in a team
      node.transfer.kind.dispatchStrategy.individualScope ===
        IndividualScope.INDIVIDUAL_SCOPE_IN_TEAM));

export const useGames = ({
  currentEpoch,
  onlyActive,
}: {
  currentEpoch: number;
  onlyActive: boolean;
}) => {
  const { data, loading, error } = useActiveRewardsQuery({
    variables: {
      isReward: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  const games = compact(data?.transfersConnection?.edges?.map((n) => n?.node))
    .map((n) => n as TransferNode)
    .filter((node) => {
      const active = onlyActive ? isActiveReward(node, currentEpoch) : true;
      return active && isScopedToTeams(node);
    });

  return {
    data: games,
    loading,
    error,
  };
};
