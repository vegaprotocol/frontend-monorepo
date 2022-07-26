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
      pollInterval: 1000 * 30,
      variables: { partyId },
    }
  );
  const markets =
    data?.party?.positionsConnection?.edges
      ?.filter((nodes) => nodes.node.market.id === marketId)
      .map((nodes) => nodes.node) || [];
  if (markets.length) {
    return {
      openVolume: markets.reduce((agg, item) => agg + +item.openVolume, 0),
      balanceSum: markets.reduce(
        (agg, item) =>
          agg +
          (item.market.accounts?.reduce(
            (acagg, account) => acagg + (+account.balance || 0),
            0
          ) || 0),
        0
      ),
    };
  }
  return null;
};
