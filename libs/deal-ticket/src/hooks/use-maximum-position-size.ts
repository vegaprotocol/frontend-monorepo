import * as Schema from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useAccountBalance } from '@vegaprotocol/accounts';
import { BigNumber } from 'bignumber.js';
import { useMarketPositions } from './use-market-positions';

interface Props {
  marketId: string;
  price?: string;
  settlementAssetId: string;
  order: OrderSubmissionBody['orderSubmission'];
}

const getSize = (balance: string, price: string) =>
  new BigNumber(balance).dividedBy(new BigNumber(price));

export const useMaximumPositionSize = ({
  marketId,
  price,
  settlementAssetId,
  order,
}: Props): number => {
  const { accountBalance } = useAccountBalance(settlementAssetId) || {};
  const marketPositions = useMarketPositions({ marketId: marketId });
  if (!accountBalance || new BigNumber(accountBalance || 0).isZero()) {
    return 0;
  }

  const size = getSize(accountBalance, price || '');

  if (!marketPositions) {
    return size.toNumber() || 0;
  }

  const isSameSide =
    (new BigNumber(marketPositions.openVolume).isPositive() &&
      order.side === Schema.Side.SIDE_BUY) ||
    (new BigNumber(marketPositions.openVolume).isNegative() &&
      order.side === Schema.Side.SIDE_SELL);

  const adjustedForVolume = new BigNumber(size)[isSameSide ? 'minus' : 'plus'](
    marketPositions.openVolume
  );

  return adjustedForVolume.isNegative() ? 0 : adjustedForVolume.toNumber();
};
