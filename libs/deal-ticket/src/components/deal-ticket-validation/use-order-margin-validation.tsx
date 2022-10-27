import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountType } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/react-helpers';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated___/DealTicket';
import type { OrderMargin } from '../../hooks/use-order-margin';
import { usePartyBalanceQuery, useSettlementAccount } from '../../hooks';
import { useMemo } from 'react';

interface Props {
  market: DealTicketMarketFragment;
  estMargin: OrderMargin | null;
}

export const useOrderMarginValidation = ({ market, estMargin }: Props) => {
  const { pubKey } = useVegaWallet();

  const { data: partyBalance } = usePartyBalanceQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const settlementAccount = useSettlementAccount(
    market.tradableInstrument.instrument.product.settlementAsset.id,
    partyBalance?.party?.accounts || [],
    AccountType.ACCOUNT_TYPE_GENERAL
  );
  if (settlementAccount) {
    const balance = toBigNum(
      settlementAccount.balance || 0,
      settlementAccount.asset.decimals || 0
    );
    const margin = toBigNum(estMargin?.margin || 0, 0);
    const { id, symbol } = settlementAccount.asset;
    if (balance.isZero() || balance.isLessThan(margin)) {
      return {
        balance: balance.toString(),
        margin: margin.toString(),
        id,
        symbol,
        decimals: settlementAccount.asset.decimals || 0,
      };
    }
  }
  return false;
};
