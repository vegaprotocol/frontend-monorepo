import { useVegaWallet } from '@vegaprotocol/wallet-react';
import compact from 'lodash/compact';
import first from 'lodash/first';
import { useTeamsQuery } from './__generated__/Teams';
import { useTeam } from './use-team';
import { useTeams } from './use-teams';
import { areTeamGames, useGames } from './use-games';

export const useMyTeam = () => {
  const { pubKey } = useVegaWallet();
  const { data: teams } = useTeams();

  const { data: maybeMyTeam } = useTeamsQuery({
    variables: {
      partyId: pubKey,
    },
    skip: !pubKey,
    fetchPolicy: 'cache-and-network',
  });

  const team = first(compact(maybeMyTeam?.teams?.edges.map((n) => n.node)));
  const rank = teams.findIndex((t) => t.teamId === team?.teamId) + 1;
  const { stats } = useTeam(team?.teamId);
  const { data: games } = useGames(team?.teamId);

  return { team, stats, games: areTeamGames(games) ? games : undefined, rank };
};
