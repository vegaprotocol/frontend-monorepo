import useMarketPositions from './use-market-positions';
import type { Order } from '@vegaprotocol/orders';
import type { PartyBalanceQuery_party_accounts } from '../components/deal-ticket/__generated__/PartyBalanceQuery';
import { useSettlementAccount } from './use-settlement-account';
import { AccountType } from '@vegaprotocol/types';
import { VegaWalletOrderSide } from '@vegaprotocol/wallet';
import { BigNumber } from 'bignumber.js';

interface Props {
  partyId: string;
  accounts: PartyBalanceQuery_party_accounts[];
  marketId: string;
  price?: string;
  settlementAssetId: string;
  order: Order;
}

const getSize = (balance: string, price: string) =>
  new BigNumber(balance).dividedBy(new BigNumber(price));

export default ({
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
    AccountType.General
  );

  const marketPositions = useMarketPositions({ marketId: marketId, partyId });

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
    (marketPositions.openVolume.isPositive() &&
      order.side === VegaWalletOrderSide.Buy) ||
    (marketPositions.openVolume.isNegative() &&
      order.side === VegaWalletOrderSide.Sell);

  return (
    new BigNumber(size)
      [isSameSide ? 'minus' : 'plus'](marketPositions.openVolume)
      .toNumber() || 0
  );
};
