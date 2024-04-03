import { useVegaWallet } from '@vegaprotocol/wallet-react';
import first from 'lodash/first';
import { type TeamsQuery, useTeamsQuery } from './__generated__/Teams';
import { useTeam } from './use-team';
import { useTeams } from './use-teams';
import { areTeamGames, useGames } from './use-games';
import { removePaginationWrapper } from '@vegaprotocol/utils';

export enum Role {
  /** A pubkey is a member of a team */
  TEAM_MEMBER = 'TEAM_MEMBER',

  /** A pubkey is an owner of a team */
  TEAM_OWNER = 'TEAM_OWNER',

  /** A pubkey is not in team but it is a referrer */
  NOT_IN_TEAM_BUT_REFERRER = 'NOT_IN_TEAM_BUT_REFERRER',

  /** A pubkey is not in team but it is a referee */
  NOT_IN_TEAM_BUT_REFEREE = 'NOT_IN_TEAM_BUT_REFEREE',

  /** A pubkey is neither in team nor a part of referral */
  NONE = 'NONE',
}

export const useMyTeam = () => {
  const { pubKey } = useVegaWallet();
  const { data: teams } = useTeams();

  const { data } = useTeamsQuery({
    variables: {
      partyId: pubKey,
      checkReferrals: true,
    },
    skip: !pubKey,
    fetchPolicy: 'cache-and-network',
  });

  const team = first(removePaginationWrapper(data?.teams?.edges));
  const rank = teams.findIndex((t) => t.teamId === team?.teamId) + 1;
  const { stats } = useTeam(team?.teamId);
  const { data: games } = useGames({ teamId: team?.teamId });
  const role = determineRole(pubKey, data);

  return {
    team,
    stats,
    games: areTeamGames(games) ? games : undefined,
    rank,
    role,
  };
};

const determineRole = (
  pubKey?: string,
  data?: TeamsQuery
): Role | undefined => {
  if (pubKey && data) {
    const team = first(removePaginationWrapper(data.teams?.edges));
    const referrer = first(removePaginationWrapper(data?.referrer?.edges));
    const referee = first(removePaginationWrapper(data?.referee?.edges));

    if (team && team.referrer === pubKey) {
      return Role.TEAM_OWNER;
    }
    if (team && team.referrer !== pubKey) {
      return Role.TEAM_MEMBER;
    }
    if (!team && referrer && referrer?.referrer === pubKey) {
      return Role.NOT_IN_TEAM_BUT_REFERRER;
    }
    if (!team && !referrer && referee && referee.referrer !== pubKey) {
      return Role.NOT_IN_TEAM_BUT_REFEREE;
    }
  }

  return undefined;
};
