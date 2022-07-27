import { BigNumber } from 'bignumber.js';
import type { Order } from '@vegaprotocol/orders';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import type { PartyBalanceQuery } from '../components/deal-ticket/__generated__/PartyBalanceQuery';
import { useSettlementAccount } from './use-settlement-account';
import { VegaWalletOrderSide } from '@vegaprotocol/wallet';
import { addDecimal, formatNumber } from '@vegaprotocol/react-helpers';

interface Props {
  order: Order;
  market: DealTicketQuery_market;
  partyData?: PartyBalanceQuery;
}

const useOrderCloseOut = ({ order, market, partyData }: Props): string => {
  const account = useSettlementAccount(
    market.tradableInstrument.instrument.product.settlementAsset.id,
    partyData?.party?.accounts || []
  );
  if (account?.balance && market.depth.lastTrade) {
    const price = new BigNumber(
      addDecimal(market.depth.lastTrade.price, market.decimalPlaces)
    );
    const balance = new BigNumber(
      addDecimal(account.balance, account.asset.decimals)
    );
    const { size, side } = order;
    const bigOne = new BigNumber(1);
    return formatNumber(
      side === VegaWalletOrderSide.Buy
        ? bigOne.minus(balance.div(price.times(size))).times(price)
        : bigOne.plus(balance.div(price.times(size))).times(price),
      market.decimalPlaces
    );
  }
  return ' - ';
};

export default useOrderCloseOut;
