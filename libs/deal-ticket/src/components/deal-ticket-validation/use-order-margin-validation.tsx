import type { DealTicketMarketFragment } from '../deal-ticket/__generated___/DealTicket';
import type { OrderMargin } from '../../hooks/use-order-margin';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useOrderMargin,
  usePartyBalanceQuery,
  useSettlementAccount,
} from '../../hooks';
import { AccountType } from '@vegaprotocol/types';
import { toBigNum } from '@vegaprotocol/react-helpers';

interface Props {
  market: DealTicketMarketFragment;
  order: OrderSubmissionBody['orderSubmission'];
}

export const useOrderMarginValidation = ({ market, order }: Props) => {
  const { pubKey } = useVegaWallet();
  const estMargin: OrderMargin | null = useOrderMargin({
    order,
    market,
    partyId: pubKey || '',
  });

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
    console.log('balance', balance.toString());
    console.log('margin', margin.toString());
    if (balance.isZero() || balance.isLessThan(margin)) {
      return {
        balance: balance.toString(),
        margin: margin.toString(),
        id,
        symbol,
      };
    }
  }
  return false;
};
