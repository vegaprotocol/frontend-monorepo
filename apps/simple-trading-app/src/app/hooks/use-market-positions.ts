import { gql, useQuery } from '@apollo/client';
import { BigNumber } from 'bignumber.js';
import type {
  MarketPositions,
  MarketPositionsVariables,
} from './__generated__/marketPositions';

const MARKET_POSITIONS_QUERY = gql`
  query MarketPositions($partyId: ID!) {
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
  openVolume: BigNumber;
  balanceSum: BigNumber;
} | null;

export default ({ marketId, partyId }: Props): PositionMargin => {
  const { data } = useQuery<MarketPositions, MarketPositionsVariables>(
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
            (acagg, account) => acagg.plus(account.balance || 0),
            new BigNumber(0)
          );
          if (balance) {
            agg.balanceSum = agg.balanceSum.plus(balance);
            agg.openVolume = agg.openVolume.plus(item.openVolume);
          }
          return agg;
        },
        { openVolume: new BigNumber(0), balanceSum: new BigNumber(0) }
      )
    : null;
};
