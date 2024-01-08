import {
  useTeamQuery,
  type TeamFieldsFragment,
  type TeamStatsFieldsFragment,
  type TeamRefereeFieldsFragment,
} from './__generated__/Team';

export type Team = TeamFieldsFragment;
export type TeamStats = TeamStatsFieldsFragment;
export type Member = TeamRefereeFieldsFragment;

export const useTeam = (teamId?: string, partyId?: string) => {
  const { data, loading, error } = useTeamQuery({
    variables: { teamId: teamId || '', partyId },
    skip: !teamId,
  });

  const teamEdge = data?.teams?.edges.find((e) => e.node.teamId === teamId);
  const partyTeamEdge = data?.partyTeams?.edges[0];
  const teamStatsEdge = data?.teamsStatistics?.edges.find(
    (e) => e.node.teamId === teamId
  );
  const members = data?.teamReferees?.edges
    .filter((e) => e.node.teamId === teamId)
    .map((e) => e.node);

  return {
    data,
    loading,
    error,
    stats: teamStatsEdge?.node,
    team: teamEdge?.node,
    members,
    partyInTeam: Boolean(partyTeamEdge),
  };
};
