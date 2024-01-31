import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import {
  useTeamQuery,
  type TeamFieldsFragment,
  type TeamStatsFieldsFragment,
  type TeamRefereeFieldsFragment,
  type TeamEntityFragment,
  type TeamMemberStatsFieldsFragment,
} from './__generated__/Team';
import { DEFAULT_AGGREGATION_EPOCHS } from './use-teams';

export type Team = TeamFieldsFragment;
export type TeamStats = TeamStatsFieldsFragment;
export type Member = TeamRefereeFieldsFragment & {
  isCreator: boolean;
  totalGamesPlayed: number;
  totalQuantumVolume: string;
  totalQuantumRewards: string;
};
export type TeamEntity = TeamEntityFragment;
export type TeamGame = ReturnType<typeof useTeam>['games'][number];
export type MemberStats = TeamMemberStatsFieldsFragment;

export const useTeam = (teamId?: string, partyId?: string) => {
  const queryResult = useTeamQuery({
    variables: {
      teamId: teamId || '',
      partyId,
      aggregationEpochs: DEFAULT_AGGREGATION_EPOCHS,
    },
    skip: !teamId,
    fetchPolicy: 'cache-and-network',
  });

  const { data } = queryResult;

  const teamEdge = data?.teams?.edges.find((e) => e.node.teamId === teamId);
  const team = teamEdge?.node;

  const partyTeam = data?.partyTeams?.edges?.length
    ? data.partyTeams.edges[0].node
    : undefined;

  const teamStatsEdge = data?.teamsStatistics?.edges.find(
    (e) => e.node.teamId === teamId
  );

  const memberStats = data?.teamMembersStatistics?.edges.length
    ? data.teamMembersStatistics.edges.map((e) => e.node)
    : [];

  const members: Member[] = data?.teamReferees?.edges.length
    ? data.teamReferees.edges
        .filter((e) => e.node.teamId === teamId)
        .map((e) => {
          const member = e.node;
          const stats = memberStats.find((m) => m.partyId === member.referee);
          return {
            ...member,
            isCreator: false,
            totalQuantumVolume: stats ? stats.totalQuantumVolume : '0',
            totalQuantumRewards: stats ? stats.totalQuantumRewards : '0',
            totalGamesPlayed: stats ? stats.totalGamesPlayed : 0,
          };
        })
    : [];

  if (team) {
    const ownerStats = memberStats.find((m) => m.partyId === team.referrer);
    members.unshift({
      teamId: team.teamId,
      referee: team.referrer,
      joinedAt: team?.createdAt,
      joinedAtEpoch: team?.createdAtEpoch,
      isCreator: true,
      totalQuantumVolume: ownerStats ? ownerStats.totalQuantumVolume : '0',
      totalQuantumRewards: ownerStats ? ownerStats.totalQuantumRewards : '0',
      totalGamesPlayed: ownerStats ? ownerStats.totalGamesPlayed : 0,
    });
  }

  // Find games where the current team participated in
  const gamesWithTeam = compact(data?.games.edges).map((edge) => {
    const team = edge.node.entities.find((e) => {
      if (e.__typename !== 'TeamGameEntity') return false;
      if (e.team.teamId !== teamId) return false;
      return true;
    });

    if (!team) return null;

    return {
      id: edge.node.id,
      epoch: edge.node.epoch,
      numberOfParticipants: edge.node.numberOfParticipants,
      entities: edge.node.entities,
      team: team as TeamEntity, // TS can't infer that all the game entities are teams
    };
  });

  const games = orderBy(compact(gamesWithTeam), 'epoch', 'desc');

  return {
    ...queryResult,
    stats: teamStatsEdge?.node,
    team,
    members,
    games,
    partyTeam,
  };
};
