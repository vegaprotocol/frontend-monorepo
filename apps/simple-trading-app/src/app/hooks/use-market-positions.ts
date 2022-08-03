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
      accounts {
        type
        balance
        asset {
          decimals
        }
        market {
          id
        }
      }
      positionsConnection {
        edges {
          node {
            openVolume
            market {
              id
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

export type PositionMargin = {
  openVolume: BigNumber;
  balance: BigNumber;
  balanceDecimals?: number;
} | null;

export default ({ marketId, partyId }: Props): PositionMargin => {
  const { data } = useQuery<MarketPositions, MarketPositionsVariables>(
    MARKET_POSITIONS_QUERY,
    {
      pollInterval: 5000,
      variables: { partyId },
      skip: !partyId,
    }
  );

  const account = data?.party?.accounts?.find(
    (nodes) => nodes.market?.id === marketId
  );

  if (account) {
    const balance = new BigNumber(account.balance || 0);
    const openVolume = new BigNumber(
      data?.party?.positionsConnection?.edges?.find(
        (nodes) => nodes.node.market.id === marketId
      )?.node.openVolume || 0
    );
    if (!balance.isZero() && !openVolume.isZero()) {
      return {
        balance,
        balanceDecimals: account?.asset.decimals,
        openVolume,
      };
    }
  }
  return null;
};
