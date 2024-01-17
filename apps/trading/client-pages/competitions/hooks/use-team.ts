import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import {
  useTeamQuery,
  type TeamFieldsFragment,
  type TeamStatsFieldsFragment,
  type TeamRefereeFieldsFragment,
  type TeamEntityFragment,
} from './__generated__/Team';
import { useVegaWallet } from '@vegaprotocol/wallet';

export type Team = TeamFieldsFragment;
export type TeamStats = TeamStatsFieldsFragment;
export type Member = TeamRefereeFieldsFragment;
export type TeamEntity = TeamEntityFragment;
export type TeamGame = ReturnType<typeof useTeam>['games'][number];
export type PartyStatus = 'member' | 'creator' | undefined;

export const useTeam = (teamId?: string) => {
  const { pubKey } = useVegaWallet();

  const { data, loading, error } = useTeamQuery({
    variables: { teamId: teamId || '' },
    skip: !teamId,
  });

  const teamEdge = data?.teams?.edges.find((e) => e.node.teamId === teamId);
  const teamStatsEdge = data?.teamsStatistics?.edges.find(
    (e) => e.node.teamId === teamId
  );
  const members = data?.teamReferees?.edges
    .filter((e) => e.node.teamId === teamId)
    .map((e) => e.node);

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
      team: team as TeamEntity, // TS can't infer that all the game entities are teams
    };
  });

  const games = orderBy(compact(gamesWithTeam), 'epoch', 'desc');

  const team = teamEdge?.node;

  let partyStatus: PartyStatus;

  if (team && members) {
    if (team.referrer === pubKey) {
      partyStatus = 'creator';
    } else if (members.find((m) => m.referee === pubKey)) {
      partyStatus = 'member';
    }
  }

  return {
    data,
    loading,
    error,
    stats: teamStatsEdge?.node,
    team,
    members,
    games,
    partyStatus,
  };
};
