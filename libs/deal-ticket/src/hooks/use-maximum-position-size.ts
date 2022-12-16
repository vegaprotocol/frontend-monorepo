import { useMarketPositions } from './use-market-positions';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useSettlementAccount } from './use-settlement-account';
import * as Schema from '@vegaprotocol/types';
import { BigNumber } from 'bignumber.js';
import type { AccountFragment as Account } from './__generated__/PartyBalance';

interface Props {
  partyId: string;
  accounts: Account[];
  marketId: string;
  price?: string;
  settlementAssetId: string;
  order: OrderSubmissionBody['orderSubmission'];
}

const getSize = (balance: string, price: string) =>
  new BigNumber(balance).dividedBy(new BigNumber(price));

export const useMaximumPositionSize = ({
  marketId,
  accounts,
  partyId,
  price,
  settlementAssetId,
  order,
}: Props): number => {
  const settlementAccount = useSettlementAccount(
    settlementAssetId,
    accounts,
    Schema.AccountType.ACCOUNT_TYPE_GENERAL
  );

  const marketPositions = useMarketPositions({ marketId: marketId });

  if (
    !settlementAccount?.balance ||
    new BigNumber(settlementAccount?.balance || 0).isZero()
  ) {
    return 0;
  }

  const size = getSize(settlementAccount.balance, price || '');

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
