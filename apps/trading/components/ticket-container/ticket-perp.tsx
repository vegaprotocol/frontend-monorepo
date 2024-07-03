import { type MarginMode } from '@vegaprotocol/types';
import { type TicketType } from './types';
import { type MarketInfo, getAsset } from '@vegaprotocol/markets';
import {
  useAccountBalance,
  useMarginAccountBalance,
  useMarginMode,
} from '@vegaprotocol/accounts';
import { useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';

import { TicketMarket } from './ticket-perp/ticket-market';
import { TicketLimit } from './ticket-perp/ticket-limit';

export type FormProps = {
  market: MarketInfo;
  asset: AssetFieldsFragment;
  balances: { margin: string; general: string };
  margin: { mode?: MarginMode; factor?: string };
  onTypeChange: (value: TicketType) => void;
};

export const TicketPerp = ({ market }: { market: MarketInfo }) => {
  const [ticketType, setTicketType] = useState<TicketType>('market');
  const { pubKey } = useVegaWallet();
  const asset = getAsset(market);
  const marginAccount = useMarginAccountBalance(market.id);
  const generalAccount = useAccountBalance(asset.id);
  const marginMode = useMarginMode({ marketId: market.id, partyId: pubKey });

  const props: FormProps = {
    market,
    onTypeChange: (value: TicketType) => setTicketType(value),
    asset,
    balances: {
      margin: marginAccount.marginAccountBalance,
      general: generalAccount.accountBalance,
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

    case 'limit': {
      return <TicketLimit {...props} />;
    }

    case 'stopMarket': {
      // @ts-ignore add props here
      return <FormStopMarket {...props} />;
    }

    case 'stopLimit': {
      // @ts-ignore add props here
      return <FormStopLimit {...props} />;
    }

    default: {
      throw new Error('invalid order type');
    }
  }
};

const FormStopMarket = () => {
  return <div>Form stop market</div>;
};

const FormStopLimit = () => {
  return <div>Form stop limit</div>;
};
