import { useMemo } from 'react';
import { type TeamsQuery, useTeamsQuery } from './__generated__/Teams';
import {
  type TeamsStatisticsQuery,
  useTeamsStatisticsQuery,
} from './__generated__/TeamsStatistics';
import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';
import { type ArrayElement } from 'type-fest/source/internal';

type SortableField = keyof Omit<
  ArrayElement<NonNullable<TeamsQuery['teams']>['edges']>['node'] &
    ArrayElement<
      NonNullable<TeamsStatisticsQuery['teamsStatistics']>['edges']
    >['node'],
  '__typename'
>;

type UseTeamsArgs = {
  aggregationEpochs?: number;
  sortByField?: SortableField[];
  order?: 'asc' | 'desc';
};

const DEFAULT_AGGREGATION_EPOCHS = 10;

export const useTeams = ({
  aggregationEpochs = DEFAULT_AGGREGATION_EPOCHS,
  sortByField = ['createdAtEpoch'],
  order = 'asc',
}: UseTeamsArgs) => {
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useTeamsQuery();

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useTeamsStatisticsQuery({
    variables: {
      aggregationEpochs,
    },
  });

  const teams = compact(teamsData?.teams?.edges).map((e) => e.node);
  const stats = compact(statsData?.teamsStatistics?.edges).map((e) => e.node);

  const data = useMemo(() => {
    const data = teams.map((t) => ({
      ...t,
      ...stats.find((s) => s.teamId === t.teamId),
    }));

    const sorted = sortBy(data, sortByField);
    if (order === 'desc') {
      return sorted.reverse();
    }
    return sorted;
  }, [teams, sortByField, order, stats]);

  return {
    data,
    loading: teamsLoading && statsLoading,
    error: teamsError || statsError,
  };
};
