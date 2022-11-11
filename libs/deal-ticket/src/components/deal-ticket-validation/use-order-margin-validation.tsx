import { useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountType } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/react-helpers';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated__/DealTicket';
import type { OrderMargin } from '../../hooks/use-order-margin';
import { usePartyBalanceQuery, useSettlementAccount } from '../../hooks';

interface Props {
  market: DealTicketMarketFragment;
  estMargin: OrderMargin | null;
}

export const useOrderMarginValidation = ({ market, estMargin }: Props) => {
  const { pubKey } = useVegaWallet();

  const { data: partyBalance } = usePartyBalanceQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
    fetchPolicy: 'no-cache',
  });

  const settlementAccount = useSettlementAccount(
    market.tradableInstrument.instrument.product.settlementAsset.id,
    partyBalance?.party?.accounts || [],
    AccountType.ACCOUNT_TYPE_GENERAL
  );
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  const balance = settlementAccount
    ? toBigNum(
        settlementAccount.balance || 0,
        settlementAccount.asset.decimals || 0
      )
    : toBigNum('0', assetDecimals);
  const margin = toBigNum(estMargin?.margin || 0, assetDecimals);
  const { id, symbol, decimals } =
    market.tradableInstrument.instrument.product.settlementAsset;
  const balanceString = balance.toString();
  const marginString = margin.toString();
  const memoizedValue = useMemo(() => {
    return {
      balance: balanceString,
      margin: marginString,
      id,
      symbol,
      decimals,
    };
  }, [balanceString, marginString, id, symbol, decimals]);

  if (balance.isZero() || balance.isLessThan(margin)) {
    return memoizedValue;
  }
  return false;
};
