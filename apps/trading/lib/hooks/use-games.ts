import {
  type GameFieldsFragment,
  type TeamEntityFragment,
  GamesDocument,
  type GamesQuery,
} from './__generated__/Games';
import orderBy from 'lodash/orderBy';
import { isSafeInteger, removePaginationWrapper } from '@vegaprotocol/utils';
import { useEpochInfoQuery } from './__generated__/Epoch';
import { useApolloClient, type ApolloError } from '@apollo/client';
import { TEAMS_STATS_EPOCHS } from './constants';
import { useEffect, useMemo, useState } from 'react';

const findTeam = (entities: GameFieldsFragment['entities'], teamId: string) => {
  const team = entities.find(
    (ent) => ent.__typename === 'TeamGameEntity' && ent.team.teamId === teamId
  );
  if (team?.__typename === 'TeamGameEntity') return team; // drops __typename === 'IndividualGameEntity' from team object
  return undefined;
};

export type Game = GameFieldsFragment & {
  /** The team entity data accessible only if scoped to particular team.  */
  team?: TeamEntityFragment;
};
export type TeamGame = Game & { team: NonNullable<Game['team']> };

const isTeamGame = (game: Game): game is TeamGame => game.team !== undefined;
export const areTeamGames = (games?: Game[]): games is TeamGame[] =>
  Boolean(games && games.filter((g) => isTeamGame(g)).length > 0);

type GamesData = {
  data?: Game[];
  loading: boolean;
  error?: Error | ApolloError;
};

const MAX_EPOCHS = 30;
/**
 * Converts the given variables (`teamId`, `epochFrom`, `epochTo`) of
 * `GamesQuery` into chunks so that the maximum difference between given
 * `epochFrom` and `epochTo` is not greater than the limit of `MAX_EPOCHS`.
 *
 * Example: When `epochFrom == 1` and `epochTo == 59` this function should
 * produce an array of variables consisting of two entries where:
 * - 1st chunk: `epochFrom == 1` and `epochTo == 31`
 * - 2nd chunk: `epochFrom == 32` and `epochTo == 59`
 */
const prepareVariables = (
  teamId?: string,
  epochFrom?: number,
  epochTo?: number
) => {
  let from = epochFrom;
  const to = epochTo;

  if (isSafeInteger(from) && from < 1) from = 1; // make sure it's not negative

  let variables = [
    {
      teamId,
      epochFrom: from,
      epochTo: to,
    },
  ];

  if (isSafeInteger(from) && isSafeInteger(to)) {
    // if the difference between "from" and "to" is greater than MAX_EPOCHS
    // then we need to divide the variables into N chunks.
    if (to - from > MAX_EPOCHS) {
      const N = Math.ceil((to - from) / MAX_EPOCHS);
      variables = Array(N)
        .fill(null)
        .map((_, i) => {
          const segmentFrom = Number(from) + MAX_EPOCHS * i;
          let segmentTo = Number(from) + MAX_EPOCHS * (i + 1) - 1;
          if (segmentTo > to) segmentTo = to;
          return {
            teamId,
            epochFrom: segmentFrom,
            epochTo: segmentTo,
          };
        });
    }
  }

  return variables;
};

export const useGames = (
  teamId?: string,
  epochFrom?: number,
  epochTo?: number
): GamesData => {
  const client = useApolloClient();

  const {
    data: epochData,
    loading: epochLoading,
    error: epochError,
  } = useEpochInfoQuery({
    skip: Boolean(epochFrom),
  });

  const [games, setGames] = useState<Game[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | ApolloError | undefined>(
    undefined
  );

  const variables = useMemo(() => {
    let from = epochFrom;
    let to = epochTo;

    if (epochData?.epoch.id && !epochFrom) {
      const currentEpoch = Number(epochData.epoch.id);
      from = currentEpoch - TEAMS_STATS_EPOCHS;
      to = currentEpoch;
    }

    if (!from) return [];
    return prepareVariables(teamId, from, to);
  }, [epochData?.epoch.id, epochFrom, epochTo, teamId]);

  /**
   * Because of the games API limitation to alway return max up to 30 epochs
   * worth of data (regardless of the actual span of given variables
   * `epochFrom` and `epochTo`) we need to do a trick of asking for longer
   * periods in a way of chunks that are then combined into one `games`.
   *
   * The code below uses the direct reference to the `ApolloClient` and runs
   * N queries (see `prepareVariables` function) in order to obtain the whole
   * set of data.
   */
  useEffect(() => {
    if (loading || games || variables.length === 0) return;
    if (!loading) setLoading(true);
    const processChunks = async () => {
      const chunks = variables.map((v) =>
        client
          .query<GamesQuery>({
            query: GamesDocument,
            variables: v,
            context: { isEnlargedTimeout: true },
          })
          .then(({ data, loading, error }) => ({ data, loading, error }))
          .catch(() => {
            /* NOOP */
          })
      );
      try {
        const results = await Promise.allSettled(chunks);
        const games = results.reduce((all, r) => {
          if (r.status === 'fulfilled' && r.value) {
            const { data, error } = r.value;
            if (error) setError(error);
            const allGames = removePaginationWrapper(data?.games.edges);
            const allOrScoped = allGames
              .map((g) => ({
                ...g,
                team: teamId ? findTeam(g.entities, teamId) : undefined,
              }))
              .filter((g) => {
                // passthrough if not scoped to particular team
                if (!teamId) return true;
                return isTeamGame(g);
              });
            return [...all, ...allOrScoped];
          }
          return all;
        }, [] as Game[]);

        if (games.length > 0) setGames(orderBy(games, 'epoch', 'desc'));
      } finally {
        setLoading(false);
      }
    };
    processChunks();
  }, [client, games, loading, teamId, variables]);

  return {
    data: games,
    loading: loading || epochLoading,
    error: error || epochError,
  };
};
