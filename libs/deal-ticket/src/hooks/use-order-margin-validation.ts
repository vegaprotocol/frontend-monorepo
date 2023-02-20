import { useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useAccountBalance } from '@vegaprotocol/accounts';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useOrderMargin } from './use-order-margin';
import type { Market, MarketData } from '@vegaprotocol/market-list';

interface Props {
  market: Market;
  marketData: MarketData;
  order: OrderSubmissionBody['orderSubmission'];
}

export const useOrderMarginValidation = ({ market, order }: Props) => {
  const { pubKey } = useVegaWallet();
  const estMargin = useOrderMargin({
    ...order,
    marketId: market.id,
    partyId: pubKey || '',
  });
  const { id: assetId, decimals: assetDecimals } =
    market.tradableInstrument.instrument.product.settlementAsset;

  const { accountBalance, accountDecimals } = useAccountBalance(assetId);
  const balance =
    accountBalance && accountDecimals !== null
      ? toBigNum(accountBalance, accountDecimals)
      : toBigNum('0', assetDecimals);
  const margin = toBigNum(estMargin?.margin || 0, assetDecimals);

  // return only simple types (bool, string) for make memo sensible
  const balanceError = balance.isGreaterThan(0) && balance.isLessThan(margin);
  const balanceAsString = balance.toString();
  const marginAsString = margin.toString();
  return useMemo(() => {
    return {
      balance: balanceAsString,
      margin: marginAsString,
      balanceError,
    };
  }, [balanceAsString, marginAsString, balanceError]);
};
