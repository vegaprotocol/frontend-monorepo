import {
  useTeamQuery,
  type TeamFieldsFragment,
  type TeamStatsFieldsFragment,
  type TeamRefereeFieldsFragment,
  type TeamMemberStatsFieldsFragment,
} from './__generated__/Team';
import { TEAMS_STATS_EPOCHS } from './constants';

export type Team = TeamFieldsFragment;
export type TeamStats = TeamStatsFieldsFragment;
export type Member = TeamRefereeFieldsFragment & {
  isCreator: boolean;
  totalGamesPlayed: number;
  totalQuantumVolume: string;
  totalQuantumRewards: string;
};
export type MemberStats = TeamMemberStatsFieldsFragment;

export const useTeam = (teamId?: string, partyId?: string) => {
  const queryResult = useTeamQuery({
    variables: {
      teamId: teamId || '',
      partyId,
      aggregationEpochs: TEAMS_STATS_EPOCHS,
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

  return {
    ...queryResult,
    stats: teamStatsEdge?.node,
    team,
    members,
    partyTeam,
  };
};
