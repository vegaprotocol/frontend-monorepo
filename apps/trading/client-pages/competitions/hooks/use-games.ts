import compact from 'lodash/compact';
import { useActiveRewardsQuery } from '../../../components/rewards-container/__generated__/Rewards';
import { isActiveReward } from '../../../components/rewards-container/active-rewards';
import { EntityScope, type TransferNode } from '@vegaprotocol/types';

const isScopedToTeams = (node: TransferNode) =>
  node.transfer.kind.__typename === 'RecurringTransfer' &&
  node.transfer.kind.dispatchStrategy?.entityScope ===
    EntityScope.ENTITY_SCOPE_TEAMS;

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
  });

  const games = compact(data?.transfersConnection?.edges?.map((n) => n?.node))
    .map((n) => n as TransferNode)
    .filter((node) => {
      const recurring = node.transfer.kind.__typename !== 'RecurringTransfer';
      const active = onlyActive ? isActiveReward(node, currentEpoch) : true;
      return active && recurring && isScopedToTeams(node);
    });

  return {
    data: games,
    loading,
    error,
  };
};
