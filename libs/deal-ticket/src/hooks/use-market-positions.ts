import { BigNumber } from 'bignumber.js';
import compact from 'lodash/compact';
import { useMarketPositionsQuery } from './__generated__/MarketPositions';
interface Props {
  marketId: string;
  partyId: string;
}

export type PositionMargin = {
  openVolume: BigNumber;
  balance: BigNumber;
  balanceDecimals?: number;
} | null;

export const useMarketPositions = ({
  marketId,
  partyId,
}: Props): PositionMargin => {
  const { data } = useMarketPositionsQuery({
    pollInterval: 5000,
    variables: { partyId },
    fetchPolicy: 'no-cache',
  });

  const accounts = compact(data?.party?.accountsConnection?.edges).map(
    (e) => e.node
  );
  const account = accounts.find((nodes) => nodes.market?.id === marketId);

  if (account) {
    const positionConnectionNode =
      data?.party?.positionsConnection?.edges?.find(
        (nodes) => nodes.node.market.id === marketId
      );
    const balance = new BigNumber(account.balance || 0);
    const openVolume = new BigNumber(
      positionConnectionNode?.node.openVolume || 0
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
