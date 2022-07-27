import { gql, useQuery } from '@apollo/client';
import type {
  marketPositions,
  marketPositionsVariables,
} from './__generated__/marketPositions';

const MARKET_POSITIONS_QUERY = gql`
  query marketPositions($partyId: ID!) {
    party(id: $partyId) {
      id
      positionsConnection {
        edges {
          node {
            openVolume
            market {
              id
              accounts {
                balance
              }
            }
          }
        }
      }
    }
  }
`;

interface Props {
  marketId: string;
  partyId: string;
}

type PositionMargin = {
  openVolume: number;
  balanceSum: number;
} | null;

export default ({ marketId, partyId }: Props): PositionMargin => {
  const { data } = useQuery<marketPositions, marketPositionsVariables>(
    MARKET_POSITIONS_QUERY,
    {
      pollInterval: 15000,
      variables: { partyId },
      skip: !partyId,
    }
  );

  const markets =
    data?.party?.positionsConnection?.edges
      ?.filter((nodes) => nodes.node.market.id === marketId)
      .map((nodes) => nodes.node) || [];

  return markets.length
    ? markets.reduce(
        (agg, item) => {
          const balance = item.market.accounts?.reduce(
            (acagg, account) => acagg + (+account.balance || 0),
            0
          );
          if (balance) {
            agg.balanceSum += balance;
            agg.openVolume += +item.openVolume;
          }
          return agg;
        },
        { openVolume: 0, balanceSum: 0 }
      )
    : null;
};
