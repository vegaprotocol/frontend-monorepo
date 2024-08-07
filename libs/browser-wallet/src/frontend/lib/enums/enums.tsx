import {
  AccountType,
  MarginMode,
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  PeggedReference,
  Side,
  StopOrderExpiryStrategy,
  UndelegateSubmissionMethod,
  VoteValue,
} from '@vegaprotocol/enums';

export const EXPIRY_STRATEGY_MAP: Record<StopOrderExpiryStrategy, string> = {
  [StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED]: 'Unspecified',
  [StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS]: 'Cancels',
  [StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT]: 'Submit',
};

export const UNDELEGATE_METHOD_MAP: Record<UndelegateSubmissionMethod, string> =
  {
    [UndelegateSubmissionMethod.METHOD_AT_END_OF_EPOCH]: 'End of epoch',
    [UndelegateSubmissionMethod.METHOD_NOW]: 'Now',
    [UndelegateSubmissionMethod.METHOD_UNSPECIFIED]: 'Unspecified',
  };

export const TIF_MAP: { [key in OrderTimeInForce]: string } = {
  [OrderTimeInForce.TIME_IN_FORCE_GTC]: 'GTC',
  [OrderTimeInForce.TIME_IN_FORCE_GTT]: 'GTT',
  [OrderTimeInForce.TIME_IN_FORCE_IOC]: 'IOC',
  [OrderTimeInForce.TIME_IN_FORCE_FOK]: 'FOK',
  [OrderTimeInForce.TIME_IN_FORCE_GFA]: 'GFA',
  [OrderTimeInForce.TIME_IN_FORCE_GFN]: 'GFN',
  [OrderTimeInForce.TIME_IN_FORCE_UNSPECIFIED]: 'Unspecified',
};

export const VOTE_VALUE_MAP = {
  [VoteValue.VALUE_YES]: 'For',
  [VoteValue.VALUE_NO]: 'Against',
  [VoteValue.VALUE_UNSPECIFIED]: 'Unspecified',
};

export const ACCOUNT_TYPE_MAP: Record<AccountType, string> = {
  [AccountType.ACCOUNT_TYPE_INSURANCE]: 'Insurance',
  [AccountType.ACCOUNT_TYPE_SETTLEMENT]: 'Settlement',
  [AccountType.ACCOUNT_TYPE_MARGIN]: 'Margin',
  [AccountType.ACCOUNT_TYPE_GENERAL]: 'General',
  [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: 'Fees (infra)',
  [AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY]: 'Fees (liquidity)',
  [AccountType.ACCOUNT_TYPE_FEES_MAKER]: 'Fees (maker)',
  [AccountType.ACCOUNT_TYPE_BOND]: 'Bond',
  [AccountType.ACCOUNT_TYPE_EXTERNAL]: 'External',
  [AccountType.ACCOUNT_TYPE_GLOBAL_INSURANCE]: 'Global insurance',
  [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: 'Global reward',
  [AccountType.ACCOUNT_TYPE_PENDING_TRANSFERS]: 'Pending transfers',
  [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: 'Maker paid fees',
  [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: 'Maker received fees',
  [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: 'LP received fees',
  [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: 'Market proposers',
  [AccountType.ACCOUNT_TYPE_UNSPECIFIED]: 'Unspecified',
  [AccountType.ACCOUNT_TYPE_HOLDING]: 'Holding',
  [AccountType.ACCOUNT_TYPE_LP_LIQUIDITY_FEES]: 'LP liquidity fees',
  [AccountType.ACCOUNT_TYPE_LIQUIDITY_FEES_BONUS_DISTRIBUTION]: '',
  [AccountType.ACCOUNT_TYPE_NETWORK_TREASURY]: 'Network treasury',
  [AccountType.ACCOUNT_TYPE_VESTING_REWARDS]: 'Vesting rewards',
  [AccountType.ACCOUNT_TYPE_VESTED_REWARDS]: 'Vested rewards',
  [AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION]:
    'Average position rewards',
  [AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN]: 'Relative return rewards',
  [AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY]: 'Volatility rewards',
  [AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING]:
    'Validator ranking rewards',
  [AccountType.ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD]:
    'Pending fee referral rewards',
  [AccountType.ACCOUNT_TYPE_ORDER_MARGIN]: 'Order Margin',
  [AccountType.ACCOUNT_TYPE_REWARD_REALISED_RETURN]: 'Reward realised return',
};

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  [OrderStatus.STATUS_UNSPECIFIED]: 'Unspecified',
  [OrderStatus.STATUS_ACTIVE]: 'Active',
  [OrderStatus.STATUS_EXPIRED]: 'Expired',
  [OrderStatus.STATUS_CANCELLED]: 'Cancelled',
  [OrderStatus.STATUS_STOPPED]: 'Stopped',
  [OrderStatus.STATUS_FILLED]: 'Filled',
  [OrderStatus.STATUS_REJECTED]: 'Rejected',
  [OrderStatus.STATUS_PARTIALLY_FILLED]: 'Partially FILLED',
  [OrderStatus.STATUS_PARKED]: 'Parked',
};

export const PEGGED_REFERENCE_MAP: Record<PeggedReference, string> = {
  [PeggedReference.PEGGED_REFERENCE_BEST_ASK]: 'best ask',
  [PeggedReference.PEGGED_REFERENCE_BEST_BID]: 'best bid',
  [PeggedReference.PEGGED_REFERENCE_MID]: 'mid',
  [PeggedReference.PEGGED_REFERENCE_UNSPECIFIED]: 'unspecified',
};

export const DERIVATIVE_SIDE_MAP: Record<Side, string> = {
  [Side.SIDE_UNSPECIFIED]: 'Unspecified',
  [Side.SIDE_BUY]: 'Long',
  [Side.SIDE_SELL]: 'Short',
};

export const SPOT_SIDE_MAP: Record<Side, string> = {
  [Side.SIDE_UNSPECIFIED]: 'Unspecified',
  [Side.SIDE_BUY]: 'Buy',
  [Side.SIDE_SELL]: 'Sell',
};

export const MARGIN_MODE_MAP: Record<MarginMode, string> = {
  [MarginMode.MARGIN_MODE_UNSPECIFIED]: 'Unspecified',
  [MarginMode.MARGIN_MODE_CROSS_MARGIN]: 'Cross margin',
  [MarginMode.MARGIN_MODE_ISOLATED_MARGIN]: 'Isolated margin',
};

export const ORDER_TYPE: Record<OrderType, string> = {
  [OrderType.TYPE_LIMIT]: 'Limit',
  [OrderType.TYPE_MARKET]: 'Market',
  [OrderType.TYPE_NETWORK]: 'Network',
  [OrderType.TYPE_UNSPECIFIED]: 'Unspecified',
};
