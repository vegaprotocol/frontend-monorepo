import { type MarginMode } from '@vegaprotocol/types';
import { type TicketType } from './types';
import { type MarketInfo, getAsset, getBaseAsset } from '@vegaprotocol/markets';
import { useAccountBalance, useMarginMode } from '@vegaprotocol/accounts';
import { useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';

import { TicketMarket } from './ticket-spot/ticket-market';

export type FormProps = {
  market: MarketInfo;
  baseAsset: AssetFieldsFragment;
  quoteAsset: AssetFieldsFragment;
  balances: { base: string; quote: string };
  margin: { mode?: MarginMode; factor?: string };
  onTypeChange: (value: TicketType) => void;
};

export const TicketSpot = ({ market }: { market: MarketInfo }) => {
  const [ticketType, setTicketType] = useState<TicketType>('market');
  const { pubKey } = useVegaWallet();

  const baseAsset = getBaseAsset(market);
  const quoteAsset = getAsset(market);

  const baseAccount = useAccountBalance(baseAsset.id);
  const quoteAccount = useAccountBalance(quoteAsset.id);

  const marginMode = useMarginMode({ marketId: market.id, partyId: pubKey });

  const props: FormProps = {
    market,
    onTypeChange: (value: TicketType) => setTicketType(value),
    baseAsset,
    quoteAsset,
    balances: {
      base: baseAccount.accountBalance,
      quote: quoteAccount.accountBalance,
    },
    margin: {
      mode: marginMode.data?.marginMode,
      factor: marginMode.data?.marginFactor,
    },
  };

  switch (ticketType) {
    case 'market': {
      return <TicketMarket {...props} />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};
