import { useVegaWallet } from '@vegaprotocol/wallet';
import compact from 'lodash/compact';
import first from 'lodash/first';
import { useTeamsQuery } from './__generated__/Teams';
import { useTeam } from './use-team';
import { DEFAULT_AGGREGATION_EPOCHS } from './use-teams';
import { useTeamsStatisticsQuery } from './__generated__/TeamsStatistics';
import orderBy from 'lodash/orderBy';

export const useMyTeam = () => {
  const { pubKey } = useVegaWallet();
  const { data: statsData } = useTeamsStatisticsQuery({
    variables: {
      aggregationEpochs: DEFAULT_AGGREGATION_EPOCHS,
    },
    fetchPolicy: 'cache-and-network',
  });
  const allStats = orderBy(
    compact(statsData?.teamsStatistics?.edges).map((e) => e.node),
    (s) => Number(s.totalQuantumRewards) || 0,
    'desc'
  );

  const { data: partyTeams } = useTeamsQuery({
    variables: {
      partyId: pubKey,
    },
    skip: !pubKey,
    fetchPolicy: 'cache-and-network',
  });

  const team = first(compact(partyTeams?.teams?.edges.map((n) => n.node)));
  const rank = allStats.findIndex((t) => t.teamId === team?.teamId) + 1;
  const { games, stats } = useTeam(team?.teamId);

  return { team, stats, games, rank };
};
