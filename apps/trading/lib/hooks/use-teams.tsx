import orderBy from 'lodash/orderBy';
import { useCallback, useMemo } from 'react';
import { type TeamsFieldsFragment, useTeamsQuery } from './__generated__/Teams';
import {
  type TeamStatisticsFieldsFragment,
  useTeamsStatisticsQuery,
} from './__generated__/TeamsStatistics';
import { TEAMS_STATS_EPOCHS } from './constants';
import omit from 'lodash/omit';
import { removePaginationWrapper } from '@vegaprotocol/utils';

const EMPTY_STATS: Omit<TeamStatisticsFieldsFragment, '__typename' | 'teamId'> =
  {
    totalQuantumVolume: '0',
    totalQuantumRewards: '0',
    totalGamesPlayed: 0,
    gamesPlayed: [],
  };

type Team = Omit<
  TeamsFieldsFragment & TeamStatisticsFieldsFragment,
  '__typename'
>;
export type TeamWithRank = Team & { rank?: number };

export const useTeams = (aggregationEpochs = TEAMS_STATS_EPOCHS) => {
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
    refetch: teamsRefetch,
  } = useTeamsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: statsRefetch,
  } = useTeamsStatisticsQuery({
    variables: {
      aggregationEpochs,
    },
    fetchPolicy: 'cache-and-network',
  });

  const refetch = useCallback(() => {
    teamsRefetch();
    statsRefetch();
  }, [statsRefetch, teamsRefetch]);

  const teams = removePaginationWrapper(teamsData?.teams?.edges);
  const stats = removePaginationWrapper(statsData?.teamsStatistics?.edges);

  const data = useMemo(() => {
    const data: Team[] = orderBy(
      teams.map((t) => ({
        ...t,
        ...(stats.find((s) => s.teamId === t.teamId) || EMPTY_STATS),
      })),
      [(d) => Number(d.totalQuantumRewards || 0), (d) => d.name.toUpperCase()],
      ['desc', 'asc']
    );

    return data.reduce((all, entry, i) => {
      const ranked: TeamWithRank = {
        ...omit(entry, '__typename'),
        rank: i + 1,
      };
      if (Number(entry.totalQuantumRewards) === 0) {
        ranked.rank = undefined;
      }
      if (i > 0) {
        const prev = all[i - 1];
        if (prev.totalQuantumRewards === entry.totalQuantumRewards) {
          ranked.rank = prev.rank;
        }
      }
      return [...all, ranked];
    }, [] as TeamWithRank[]);
  }, [teams, stats]);

  return {
    data,
    loading: teamsLoading && statsLoading,
    error: teamsError || statsError,
    refetch,
  };
};

export const useTeamsMap = () => {
  const { data: teamsData, loading } = useTeamsQuery();
  const teams = removePaginationWrapper(teamsData?.teams?.edges).reduce(
    (all, t) => {
      return { ...all, [t.teamId]: t } as Record<string, TeamsFieldsFragment>;
    },
    {} as Record<string, TeamsFieldsFragment>
  );

  return { data: teams, loading };
};
