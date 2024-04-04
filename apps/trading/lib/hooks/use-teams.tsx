import orderBy from 'lodash/orderBy';
import { useMemo } from 'react';
import { useTeamsQuery } from './__generated__/Teams';
import { useTeamsStatisticsQuery } from './__generated__/TeamsStatistics';
import compact from 'lodash/compact';
import {
  type TeamFieldsFragment,
  type TeamStatsFieldsFragment,
} from './__generated__/Team';
import { TEAMS_STATS_EPOCHS } from './constants';
import { removePaginationWrapper } from '@vegaprotocol/utils';

const EMPTY_STATS: Partial<TeamStatsFieldsFragment> = {
  totalQuantumVolume: '0',
  totalQuantumRewards: '0',
  totalGamesPlayed: 0,
  gamesPlayed: [],
  quantumRewards: [],
};

export const useTeams = (aggregationEpochs = TEAMS_STATS_EPOCHS) => {
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
      ...(stats.find((s) => s.teamId === t.teamId) || EMPTY_STATS),
    }));

    return orderBy(data, (d) => Number(d.totalQuantumRewards || 0), 'desc').map(
      (d, i) => ({ ...d, rank: i + 1 })
    );
  }, [teams, stats]);

  return {
    data,
    loading: teamsLoading && statsLoading,
    error: teamsError || statsError,
  };
};

export const useTeamsMap = () => {
  const { data: teamsData, loading } = useTeamsQuery();
  const teams = removePaginationWrapper(teamsData?.teams?.edges).reduce(
    (all, t) => {
      return { ...all, [t.teamId]: t } as Record<string, TeamFieldsFragment>;
    },
    {} as Record<string, TeamFieldsFragment>
  );

  return { data: teams, loading };
};
