import { t } from '@vegaprotocol/react-helpers';

export const EST_MARGIN_TOOLTIP_TEXT = t(
  'When opening a position on a futures market, you must post margin to cover any potential losses that you may incur. The margin is typically a fraction of the notional position size. For example, for a notional position size of $500, if the margin requirement is 10%, then the estimated margin would be approximately $50.'
);
export const CONTRACTS_MARGIN_TOOLTIP_TEXT = t(
  'The number of contracts determines how many units of the futures contract to buy or sell. For example, this is similar to buying one share of a listed company. The value of 1 contract is equivalent to the price of the contract. For example, if the current price is $50, then one contract is worth $50.'
);
export const EST_CLOSEOUT_TOOLTIP_TEXT = t(
  'Because you only need to post a fraction of your position size as margin when trading futures, it is possible to obtain leverage meaning your notional position size exceeds your account balance. In this scenario, if the market moves against your position, it will sometimes be necessary to force close your position due to insufficient funds. The estimated close out tells you the price at which that would happen based on current position and account balance.'
);
export const NOTIONAL_SIZE_TOOLTIP_TEXT = t(
  'The notional size represents the position size in the settlement asset of the futures contract. The notional size is calculated by multiplying the number of contracts by the price of the contract. For example, ten contracts traded at a price of $50 has a notional size of $500.'
);
export const EST_FEES_TOOLTIP_TEXT = t(
  'When you execute a new buy or sell order, you must pay a small amount of commission to the network for doing so. This fee is used to provide income to the node operates of the network and market makers who make prices on the futures market you are trading.'
);
