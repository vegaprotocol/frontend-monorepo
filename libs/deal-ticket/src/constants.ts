import { t } from '@vegaprotocol/i18n';

export const EST_MARGIN_TOOLTIP_TEXT = (settlementAsset: string) =>
  t(
    `A fraction of the notional position size, in the market's settlement asset %s, to cover any potential losses that you may incur.

  For example, for a notional size of $500, if the margin requirement is 10%, then the estimated margin would be approximately $50.`,
    [settlementAsset]
  );
export const EST_TOTAL_MARGIN_TOOLTIP_TEXT = t(
  'Estimated total margin that will cover open positions, active orders and this order.'
);
export const MARGIN_ACCOUNT_TOOLTIP_TEXT = t('Margin account balance.');
export const MARGIN_DIFF_TOOLTIP_TEXT = (settlementAsset: string) =>
  t(
    "The additional margin required for your new position (taking into account volume and open orders), compared to your current margin. Measured in the market's settlement asset (%s).",
    [settlementAsset]
  );
export const DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT = (
  settlementAsset: string
) =>
  t(
    'To cover the required margin, this amount will be drawn from your general (%s) account.',
    [settlementAsset]
  );

export const TOTAL_MARGIN_AVAILABLE = (
  generalAccountBalance: string,
  marginAccountBalance: string,
  marginMaintenance: string,
  settlementAsset: string
) =>
  t(
    'Total margin available = general %s balance (%s) + margin balance (%s) - maintenance level (%s).',
    [
      settlementAsset,
      `${generalAccountBalance} ${settlementAsset}`,
      `${marginAccountBalance} ${settlementAsset}`,
      `${marginMaintenance} ${settlementAsset}`,
    ]
  );

export const CONTRACTS_MARGIN_TOOLTIP_TEXT = t(
  'The number of contracts determines how many units of the futures contract to buy or sell. For example, this is similar to buying one share of a listed company. The value of 1 contract is equivalent to the price of the contract. For example, if the current price is $50, then one contract is worth $50.'
);
export const EST_CLOSEOUT_TOOLTIP_TEXT = (quote: string) =>
  t(
    `If the price drops below this number, measured in the market price quote unit %s, you will be closed out, based on your current position and account balance.`,
    [quote]
  );
export const NOTIONAL_SIZE_TOOLTIP_TEXT = (settlementAsset: string) =>
  t(
    `The notional size represents the position size in the settlement asset %s of the futures contract. This is calculated by multiplying the number of contracts by the prices of the contract.

  For example 10 contracts traded at a price of $50 has a notional size of $500.`,
    [settlementAsset]
  );
export const EST_FEES_TOOLTIP_TEXT = t(
  'When you execute a new buy or sell order, you must pay a small amount of commission to the network for doing so. This fee is used to provide income to the node operates of the network and market makers who make prices on the futures market you are trading.'
);

export const LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT = t(
  'This is an approximation (or a range) for the liquidation price for that particular contract position, assuming nothing else changes, which may affect your margin and collateral balances.'
);

export const EST_SLIPPAGE = t(
  'When you execute a trade on Vega, the price obtained in the market may differ from the best available price displayed at the time of placing the trade. The estimated slippage shows the difference between the best available price and the estimated execution price, determined by market liquidity and your chosen order size.'
);

export const ERROR_SIZE_DECIMAL = t(
  'The size field accepts up to X decimal places.'
);

export enum MarketModeValidationType {
  PriceMonitoringAuction = 'PriceMonitoringAuction',
  LiquidityMonitoringAuction = 'LiquidityMonitoringAuction',
  Auction = 'Auction',
}

export enum SummaryValidationType {
  NoPubKey = 'NoPubKey',
  NoCollateral = 'NoCollateral',
  TradingMode = 'MarketTradingMode',
  MarketState = 'MarketState',
}
