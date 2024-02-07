import orderBy from 'lodash/orderBy';
import { useMemo } from 'react';
import { useTeamsQuery } from './__generated__/Teams';
import { useTeamsStatisticsQuery } from './__generated__/TeamsStatistics';
import compact from 'lodash/compact';

// 192
export const DEFAULT_AGGREGATION_EPOCHS = 192;

export const useTeams = (aggregationEpochs = DEFAULT_AGGREGATION_EPOCHS) => {
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useTeamsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useTeamsStatisticsQuery({
    variables: {
      aggregationEpochs,
    },
    fetchPolicy: 'cache-and-network',
  });

  const teams = compact(teamsData?.teams?.edges).map((e) => e.node);
  const stats = compact(statsData?.teamsStatistics?.edges).map((e) => e.node);

  const data = useMemo(() => {
    const data = teams.map((t) => ({
      ...t,
      ...stats.find((s) => s.teamId === t.teamId),
    }));

    return orderBy(data, (d) => Number(d.totalQuantumRewards || 0), 'desc');
  }, [teams, stats]);

  return {
    data,
    loading: teamsLoading && statsLoading,
    error: teamsError || statsError,
  };
};
