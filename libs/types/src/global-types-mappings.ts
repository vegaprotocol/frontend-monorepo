import {
  type LiquidityFeeMethod,
  type ConditionOperator,
  type EntityScope,
  type GovernanceTransferKind,
  type GovernanceTransferType,
  type IndividualScope,
  type PeggedReference,
  type ProposalChange,
  type TransferStatus,
  MarketUpdateType,
} from './__generated__/types';
import type {
  AccountType,
  DispatchStrategy,
  StopOrderRejectionReason,
} from './__generated__/types';
import {
  type AuctionTrigger,
  type DataSourceSpecStatus,
  type DepositStatus,
  type Interval,
  type LiquidityProvisionStatus,
  type MarketState,
  type MarketTradingMode,
  type NodeStatus,
  type OrderRejectionReason,
  type OrderStatus,
  type OrderTimeInForce,
  type OrderType,
  type PositionStatus,
  type ProposalRejectionReason,
  type ProposalState,
  type Side,
  type StakeLinkingStatus,
  type TransferType,
  type ValidatorStatus,
  type VoteValue,
  type WithdrawalStatus,
  type DispatchMetric,
  type StopOrderStatus,
} from './__generated__/types';
import type { ProductType, ProposalProductType } from './product';

export const AccountTypeMapping: {
  [T in AccountType]: string;
} = {
  ACCOUNT_TYPE_BOND: 'Bond account',
  ACCOUNT_TYPE_EXTERNAL: 'External account',
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE: 'Infrastructure fees account',
  ACCOUNT_TYPE_FEES_LIQUIDITY: 'Liquidity fees account',
  ACCOUNT_TYPE_FEES_MAKER: 'Maker fees account',
  ACCOUNT_TYPE_GENERAL: 'General account',
  ACCOUNT_TYPE_GLOBAL_INSURANCE: 'Global insurance account',
  ACCOUNT_TYPE_GLOBAL_REWARD: 'Global reward account',
  ACCOUNT_TYPE_INSURANCE: 'Insurance account',
  ACCOUNT_TYPE_MARGIN: 'Margin account',
  ACCOUNT_TYPE_ORDER_MARGIN: 'Order margin account',
  ACCOUNT_TYPE_PENDING_TRANSFERS: 'Pending transfers account',
  ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD:
    'Pending fee referral reward account',
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: 'LP received fees reward account',
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: 'Maker received fees reward account',
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: 'Market proposers reward account',
  ACCOUNT_TYPE_REWARD_AVERAGE_POSITION: 'Average position reward account',
  ACCOUNT_TYPE_REWARD_RELATIVE_RETURN: 'Relative return reward account',
  ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY: 'Volatility return reward account',
  ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING: 'Validator ranking reward account',
  ACCOUNT_TYPE_VESTED_REWARDS: 'Vested rewards account',
  ACCOUNT_TYPE_VESTING_REWARDS: 'Vesting rewards account',
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: 'Maker fees paid account',
  ACCOUNT_TYPE_SETTLEMENT: 'Settlement account',
  ACCOUNT_TYPE_HOLDING: 'Holding account',
  ACCOUNT_TYPE_LP_LIQUIDITY_FEES: 'LP liquidity fees account',
  ACCOUNT_TYPE_NETWORK_TREASURY: 'Network treasury account',
  ACCOUNT_TYPE_REWARD_REALISED_RETURN: 'Realised return reward account',
};

/**
 * Status of a liquidity provision order
 */
export const LiquidityProvisionStatusMapping: {
  [T in LiquidityProvisionStatus]: string;
} = {
  STATUS_ACTIVE: 'Active',
  STATUS_CANCELLED: 'Cancelled',
  STATUS_PENDING: 'Pending',
  STATUS_REJECTED: 'Rejected',
  STATUS_STOPPED: 'Stopped',
  STATUS_UNDEPLOYED: 'Undeployed',
};

export const AuctionTriggerMapping: {
  [T in AuctionTrigger]: string;
} = {
  AUCTION_TRIGGER_BATCH: 'batch',
  AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET: 'liquidity (target not met)',
  AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS:
    'liquidity (unable to deploy liquidity provision orders)',
  AUCTION_TRIGGER_OPENING: 'opening',
  AUCTION_TRIGGER_PRICE: 'price',
  AUCTION_TRIGGER_UNSPECIFIED: 'unspecified',
  AUCTION_TRIGGER_GOVERNANCE_SUSPENSION: 'governance suspension',
};

/**
 * The status of a deposit
 */
export const DepositStatusMapping: {
  [T in DepositStatus]: string;
} = {
  STATUS_CANCELLED: 'Cancelled',
  STATUS_FINALIZED: 'Finalized',
  STATUS_DUPLICATE_REJECTED: 'Duplicate rejected',
  STATUS_OPEN: 'Open',
};

/**
 * The interval for trade candles when subscribing via Vega GraphQL, default is I15M
 */
export const IntervalMapping: {
  [T in Interval]: string;
} = {
  // @ts-ignore - temporarily suppressing this as it's a valid value
  INTERVAL_BLOCK: '1 block',
  INTERVAL_I15M: 'I15M',
  INTERVAL_I1D: 'I1D',
  INTERVAL_I7D: 'I7D',
  INTERVAL_I1H: 'I1H',
  INTERVAL_I4H: 'I4H',
  INTERVAL_I8H: 'I8H',
  INTERVAL_I12H: 'I12H',
  INTERVAL_I1M: 'I1M',
  INTERVAL_I5M: 'I5M',
  INTERVAL_I30M: 'I30M',
  INTERVAL_I6H: 'I6H',
};

/**
 * The current state of a market
 */
export const MarketStateMapping: {
  [T in MarketState]: string;
} = {
  STATE_ACTIVE: 'Active',
  STATE_CANCELLED: 'Cancelled',
  STATE_CLOSED: 'Closed',
  STATE_PENDING: 'Pending',
  STATE_PROPOSED: 'Proposed',
  STATE_REJECTED: 'Rejected',
  STATE_SETTLED: 'Settled',
  STATE_SUSPENDED: 'Suspended',
  STATE_TRADING_TERMINATED: 'Trading Terminated',
  STATE_SUSPENDED_VIA_GOVERNANCE: 'Suspended via governance',
};

/**
 * What market trading mode is the market in
 */
export const MarketTradingModeMapping: {
  [T in MarketTradingMode]: string;
} = {
  TRADING_MODE_BATCH_AUCTION: 'Batch auction',
  TRADING_MODE_CONTINUOUS: 'Continuous',
  TRADING_MODE_MONITORING_AUCTION: 'Monitoring auction',
  TRADING_MODE_NO_TRADING: 'No trading',
  TRADING_MODE_OPENING_AUCTION: 'Opening auction',
  TRADING_MODE_SUSPENDED_VIA_GOVERNANCE: 'Suspended via governance',
};

export const NodeStatusMapping: {
  [T in NodeStatus]: string;
} = {
  NODE_STATUS_NON_VALIDATOR: 'Non validator',
  NODE_STATUS_VALIDATOR: 'Validator',
};

/**
 * Status describe the status of the oracle spec
 */
export const DataSourceSpecStatusMapping: {
  [T in DataSourceSpecStatus]: string;
} = {
  STATUS_ACTIVE: 'Active',
  STATUS_DEACTIVATED: 'Deactivated',
};

/**
 * Reason for the order being rejected by the core node
 */
export const OrderRejectionReasonMapping: {
  [T in OrderRejectionReason]: string;
} = {
  ORDER_ERROR_AMEND_FAILURE: 'Amend failure',
  ORDER_ERROR_BUY_CANNOT_REFERENCE_BEST_ASK_PRICE:
    'Buy cannot reference best ask price',
  ORDER_ERROR_CANNOT_AMEND_FROM_GFA_OR_GFN: 'Cannot amend from GFA or GFN',
  ORDER_ERROR_CANNOT_AMEND_PEGGED_ORDER_DETAILS_ON_NON_PEGGED_ORDER:
    'Cannot amend pegged order details on non pegged order',
  ORDER_ERROR_CANNOT_AMEND_TO_FOK_OR_IOC: 'Cannot amend to FOK or IOC',
  ORDER_ERROR_CANNOT_AMEND_TO_GFA_OR_GFN: 'Cannot amend to GFA or GFN',
  ORDER_ERROR_CANNOT_AMEND_TO_GTT_WITHOUT_EXPIRYAT:
    'Cannot amend to GTT without expiry time specified',
  ORDER_ERROR_CANNOT_HAVE_GTC_AND_EXPIRYAT:
    'Cannot have GTC and expiry time specified',
  ORDER_ERROR_CANNOT_SEND_FOK_ORDER_DURING_AUCTION:
    'Cannot send FOK order during auction',
  ORDER_ERROR_CANNOT_SEND_GFN_ORDER_DURING_AN_AUCTION:
    'Cannot send GFN order during auction',
  ORDER_ERROR_CANNOT_SEND_IOC_ORDER_DURING_AUCTION:
    'Cannot send IOC order during auction',
  ORDER_ERROR_EDIT_NOT_ALLOWED: 'Edit not allowed',
  ORDER_ERROR_EXPIRYAT_BEFORE_CREATEDAT: 'Expiry time before creation time',
  ORDER_ERROR_CANNOT_SEND_GFA_ORDER_DURING_CONTINUOUS_TRADING:
    'Cannot send GFA order during continuous trading',
  ORDER_ERROR_INSUFFICIENT_ASSET_BALANCE: 'Insufficient asset balance',
  ORDER_ERROR_INSUFFICIENT_FUNDS_TO_PAY_FEES: 'Insufficient funds to pay fees',
  ORDER_ERROR_INTERNAL_ERROR: 'Internal error',
  ORDER_ERROR_INVALID_EXPIRATION_DATETIME: 'Invalid expiration date time',
  ORDER_ERROR_INVALID_MARKET_ID: 'Invalid market ID',
  ORDER_ERROR_INVALID_ORDER_ID: 'Invalid order ID',
  ORDER_ERROR_INVALID_ORDER_REFERENCE: 'Invalid order reference',
  ORDER_ERROR_INVALID_PARTY_ID: 'Invalid party ID',
  ORDER_ERROR_INVALID_PERSISTENCE: 'Invalid persistence',
  ORDER_ERROR_INVALID_REMAINING_SIZE: 'Invalid remaining size',
  ORDER_ERROR_INVALID_SIZE: 'Invalid size',
  ORDER_ERROR_INVALID_TIME_IN_FORCE: 'Invalid time in force',
  ORDER_ERROR_INVALID_TYPE: 'Invalid type',
  ORDER_ERROR_ISOLATED_MARGIN_CHECK_FAILED:
    'Party has insufficient funds to cover for the order margin for the new or amended order',
  ORDER_ERROR_MARGIN_CHECK_FAILED: 'Margin check failed',
  ORDER_ERROR_MARKET_CLOSED: 'Market closed',
  ORDER_ERROR_MISSING_GENERAL_ACCOUNT: 'Missing general account',
  ORDER_ERROR_MUST_BE_GTT_OR_GTC: 'Must be GTT or GTC',
  ORDER_ERROR_MUST_BE_LIMIT_ORDER: 'Must be limit order',
  ORDER_ERROR_NON_PERSISTENT_ORDER_OUT_OF_PRICE_BOUNDS:
    'Non persistent order out of price bounds',
  ORDER_ERROR_NOT_FOUND: 'Not found',
  ORDER_ERROR_OFFSET_MUST_BE_GREATER_OR_EQUAL_TO_ZERO:
    'Offset must be greater or equal to zero',
  ORDER_ERROR_PEGGED_ORDERS_NOT_ALLOWED_IN_ISOLATED_MARGIN_MODE:
    'Pegged orders are not allowed for a party in isolated margin mode',
  ORDER_ERROR_OFFSET_MUST_BE_GREATER_THAN_ZERO:
    'Offset must be greater than zero',
  ORDER_ERROR_OUT_OF_SEQUENCE: 'Out of sequence',
  ORDER_ERROR_REMOVAL_FAILURE: 'Removal failure',
  ORDER_ERROR_SELF_TRADING: '  Self trading',
  ORDER_ERROR_SELL_CANNOT_REFERENCE_BEST_BID_PRICE:
    'Sell cannot reference best bid price',
  ORDER_ERROR_TIME_FAILURE: 'Time failure',
  ORDER_ERROR_UNABLE_TO_AMEND_PRICE_ON_PEGGED_ORDER:
    'Unable to amend price on pegged order',
  ORDER_ERROR_UNABLE_TO_REPRICE_PEGGED_ORDER: 'Unable to reprice pegged order',
  ORDER_ERROR_WITHOUT_REFERENCE_PRICE: 'Without reference price',
  ORDER_ERROR_INCORRECT_MARKET_TYPE: 'Incorrect market type',
  ORDER_ERROR_POST_ONLY_ORDER_WOULD_TRADE: 'Post only order would trade',
  ORDER_ERROR_REDUCE_ONLY_ORDER_WOULD_NOT_REDUCE:
    'Reduce only order would not reduce',
  ORDER_ERROR_TOO_MANY_PEGGED_ORDERS: 'Too many pegged orders',
};

/**
 * Valid order statuses, these determine several states for an order that cannot be expressed with other fields in Order.
 */
export const OrderStatusMapping: {
  [T in OrderStatus]: string;
} = {
  STATUS_ACTIVE: 'Active',
  STATUS_CANCELLED: 'Cancelled',
  STATUS_EXPIRED: 'Expired',
  STATUS_FILLED: 'Filled',
  STATUS_PARKED: 'Parked',
  STATUS_PARTIALLY_FILLED: 'Partially Filled',
  STATUS_REJECTED: 'Rejected',
  STATUS_STOPPED: 'Stopped',
};

/**
 * Stop order statuses, these determine several states for an stop order that cannot be expressed with other fields in StopOrder.
 */
export const StopOrderStatusMapping: {
  [T in StopOrderStatus]: string;
} = {
  STATUS_CANCELLED: 'Cancelled',
  STATUS_EXPIRED: 'Expired',
  STATUS_PENDING: 'Pending',
  STATUS_REJECTED: 'Rejected',
  STATUS_STOPPED: 'Stopped',
  STATUS_TRIGGERED: 'Triggered',
  STATUS_UNSPECIFIED: 'Unspecified',
};

/**
 * Stop order rejection reason mappings.
 */
export const StopOrderRejectionReasonMapping: {
  [T in StopOrderRejectionReason]: string;
} = {
  REJECTION_REASON_TRADING_NOT_ALLOWED: 'Trading is not allowed yet',
  REJECTION_REASON_EXPIRY_IN_THE_PAST:
    'Expiry of the stop order is in the past',
  REJECTION_REASON_MUST_BE_REDUCE_ONLY:
    'Stop orders submission must be reduce only',
  REJECTION_REASON_MAX_STOP_ORDERS_PER_PARTY_REACHED:
    'Party has reached the maximum stop orders allowed for this market',
  REJECTION_REASON_STOP_ORDER_NOT_ALLOWED_WITHOUT_A_POSITION:
    'Stop orders are not allowed without a position',
  REJECTION_REASON_STOP_ORDER_NOT_CLOSING_THE_POSITION:
    'This stop order does not close the position',
  REJECTION_REASON_STOP_ORDER_NOT_ALLOWED_DURING_OPENING_AUCTION:
    'Stop orders are not allowed during the opening auction',
  REJECTION_REASON_STOP_ORDER_CANNOT_MATCH_OCO_EXPIRY_TIMES:
    'Stop order cannot have matching OCO expiry times',
  REJECTION_REASON_STOP_ORDER_LINKED_PERCENTAGE_INVALID:
    'The percentage value for the linked stop order is invalid',
  REJECTION_REASON_STOP_ORDER_SIZE_OVERRIDE_UNSUPPORTED_FOR_SPOT:
    'Stop order size override is not supported for spot markets',
};

/**
 * Valid order types, these determine what happens when an order is added to the book
 */
type OrderTimeInForceMap = {
  [T in OrderTimeInForce]: string;
};
export const OrderTimeInForceMapping: OrderTimeInForceMap = {
  TIME_IN_FORCE_FOK: 'Fill or Kill (FOK)',
  TIME_IN_FORCE_GFA: 'Good for Auction (GFA)',
  TIME_IN_FORCE_GFN: 'Good for Normal (GFN)',
  TIME_IN_FORCE_GTC: `Good 'til Cancelled (GTC)`,
  TIME_IN_FORCE_GTT: `Good 'til Time (GTT)`,
  TIME_IN_FORCE_IOC: 'Immediate or Cancel (IOC)',
};

export const OrderTimeInForceCode: OrderTimeInForceMap = {
  TIME_IN_FORCE_FOK: 'FOK',
  TIME_IN_FORCE_GFA: 'GFA',
  TIME_IN_FORCE_GFN: 'GFN',
  TIME_IN_FORCE_GTC: 'GTC',
  TIME_IN_FORCE_GTT: 'GTT',
  TIME_IN_FORCE_IOC: 'IOC',
};

export const OrderTypeMapping: {
  [T in OrderType]: string;
} = {
  TYPE_LIMIT: 'Limit',
  TYPE_MARKET: 'Market',
  TYPE_NETWORK: 'Network',
};

/**
 * Proposal change type mapping
 */
export const ProposalChangeMapping: Record<
  NonNullable<ProposalChange['__typename']>,
  string
> = {
  NewMarket: 'New market',
  UpdateMarket: 'Update market',
  UpdateNetworkParameter: 'Update network parameter',
  NewAsset: 'New asset',
  UpdateAsset: 'Update asset',
  /* cspell:disable-next-line */
  NewFreeform: 'New free-form',
  NewTransfer: 'New transfer',
  CancelTransfer: 'Cancel transfer',
  UpdateMarketState: 'Update market state',
  NewSpotMarket: 'New spot market',
  UpdateSpotMarket: 'Update spot market',
  UpdateVolumeDiscountProgram: 'Update volume discount program',
  UpdateReferralProgram: 'Update referral program',
};

/**
 * Reason for the proposal being rejected by the core node
 */
export const ProposalRejectionReasonMapping: {
  [T in ProposalRejectionReason]: string;
} = {
  PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE: 'Close time too late',
  PROPOSAL_ERROR_CLOSE_TIME_TOO_SOON: 'Close time too soon',
  PROPOSAL_ERROR_COULD_NOT_INSTANTIATE_MARKET: 'Could not instantiate market',
  PROPOSAL_ERROR_ENACT_TIME_TOO_LATE: 'Enact time too late',
  PROPOSAL_ERROR_ENACT_TIME_TOO_SOON: 'Enact time too soon',
  PROPOSAL_ERROR_INCOMPATIBLE_TIMESTAMPS: 'Incompatible timestamps',
  PROPOSAL_ERROR_INSUFFICIENT_EQUITY_LIKE_SHARE:
    'Insufficient equity like share',
  PROPOSAL_ERROR_INSUFFICIENT_TOKENS: 'Insufficient tokens',
  PROPOSAL_ERROR_INVALID_ASSET: 'Invalid asset',
  PROPOSAL_ERROR_INVALID_ASSET_DETAILS: 'Invalid asset details',
  PROPOSAL_ERROR_INVALID_FEE_AMOUNT: 'Invalid fee amount',
  PROPOSAL_ERROR_INVALID_FREEFORM: 'Invalid freeform',
  PROPOSAL_ERROR_INVALID_FUTURE_PRODUCT: 'Invalid future product',
  PROPOSAL_ERROR_INVALID_INSTRUMENT_SECURITY: 'Invalid instrument security',
  PROPOSAL_ERROR_INVALID_MARKET: 'Invalid market',
  PROPOSAL_ERROR_INVALID_RISK_PARAMETER: 'Invalid risk parameter',
  PROPOSAL_ERROR_INVALID_SHAPE: 'Invalid shape',
  PROPOSAL_ERROR_MAJORITY_THRESHOLD_NOT_REACHED:
    'Majority threshold not reached',
  PROPOSAL_ERROR_MARKET_MISSING_LIQUIDITY_COMMITMENT:
    'Market missing liquidity commitment',
  PROPOSAL_ERROR_MISSING_BUILTIN_ASSET_FIELD: 'Missing built-in asset field',
  PROPOSAL_ERROR_MISSING_COMMITMENT_AMOUNT: 'Missing commitment amount',
  PROPOSAL_ERROR_MISSING_ERC20_CONTRACT_ADDRESS:
    'Missing ERC20 contract address',
  PROPOSAL_ERROR_NETWORK_PARAMETER_INVALID_KEY: 'Network parameter invalid key',
  PROPOSAL_ERROR_NETWORK_PARAMETER_INVALID_VALUE:
    'Network parameter invalid value',
  PROPOSAL_ERROR_NETWORK_PARAMETER_VALIDATION_FAILED:
    'Network parameter validation failed',
  PROPOSAL_ERROR_NODE_VALIDATION_FAILED: 'Node validation failed',
  PROPOSAL_ERROR_NO_PRODUCT: 'No product',
  PROPOSAL_ERROR_NO_RISK_PARAMETERS: 'No risk parameters',
  PROPOSAL_ERROR_NO_TRADING_MODE: 'No trading mode',
  PROPOSAL_ERROR_OPENING_AUCTION_DURATION_TOO_LARGE:
    'Opening auction duration too large',
  PROPOSAL_ERROR_OPENING_AUCTION_DURATION_TOO_SMALL:
    'Opening auction duration too small',
  PROPOSAL_ERROR_PARTICIPATION_THRESHOLD_NOT_REACHED:
    'Participation threshold not reached',
  PROPOSAL_ERROR_TOO_MANY_MARKET_DECIMAL_PLACES:
    'Too many market decimal places',
  PROPOSAL_ERROR_TOO_MANY_PRICE_MONITORING_TRIGGERS:
    'Too many price monitoring triggers',
  PROPOSAL_ERROR_UNKNOWN_RISK_PARAMETER_TYPE: 'Unknown risk parameter type',
  PROPOSAL_ERROR_UNKNOWN_TYPE: 'Unknown type',
  PROPOSAL_ERROR_UNSUPPORTED_PRODUCT: 'Unsupported product',
  PROPOSAL_ERROR_UNSUPPORTED_TRADING_MODE: 'Unsupported trading mode',
  PROPOSAL_ERROR_ERC20_ADDRESS_ALREADY_IN_USE:
    'ERC20 address already in use by an existing asset',
  PROPOSAL_ERROR_GOVERNANCE_CANCEL_TRANSFER_PROPOSAL_INVALID:
    'Governance cancel transfer proposal invalid',
  PROPOSAL_ERROR_GOVERNANCE_TRANSFER_PROPOSAL_FAILED:
    'Governance transfer proposal failed',
  PROPOSAL_ERROR_GOVERNANCE_TRANSFER_PROPOSAL_INVALID:
    'Governance transfer proposal invalid',
  PROPOSAL_ERROR_INVALID_SPOT: 'Invalid spot',
  PROPOSAL_ERROR_INVALID_SUCCESSOR_MARKET: 'Invalid successor market',
  PROPOSAL_ERROR_SPOT_PRODUCT_DISABLED: 'Spot product disabled',
  PROPOSAL_ERROR_INVALID_MARKET_STATE_UPDATE: 'Invalid market state update',
  PROPOSAL_ERROR_INVALID_PERPETUAL_PRODUCT: 'Invalid perpetual product',
  PROPOSAL_ERROR_INVALID_SLA_PARAMS: 'Invalid SLA params',
  PROPOSAL_ERROR_MISSING_SLA_PARAMS: 'Missing SLA params',
  // @ts-ignore - temporarily suppressing this as it's a valid value
  PROPOSAL_ERROR_PROPOSAL_IN_BATCH_REJECTED:
    'One or more sub proposals are invalid',
  PROPOSAL_ERROR_INVALID_REFERRAL_PROGRAM:
    'Proposal error invalid referral program',
  PROPOSAL_ERROR_INVALID_SIZE_DECIMAL_PLACES: 'Invalid size decimal places',
  PROPOSAL_ERROR_INVALID_VOLUME_DISCOUNT_PROGRAM:
    'Proposal error invalid volume discount program',
  PROPOSAL_ERROR_LINEAR_SLIPPAGE_FACTOR_OUT_OF_RANGE:
    'Proposal error linear slippage factor out of range',
  PROPOSAL_ERROR_LP_PRICE_RANGE_NONPOSITIVE:
    'Proposal error LP price range non-positive',
  PROPOSAL_ERROR_LP_PRICE_RANGE_TOO_LARGE:
    'Proposal error LP price range too large',
  PROPOSAL_ERROR_PROPOSAL_IN_BATCH_DECLINED:
    'Proposal error proposal in batch declined',
  PROPOSAL_ERROR_QUADRATIC_SLIPPAGE_FACTOR_OUT_OF_RANGE:
    'Proposal error quadratic slippage factor out of range',
};

/**
 * Various states a proposal can transition through:
 * Open ->
 * - Passed -> Enacted.
 * - Rejected.
 * Proposal can enter Failed state from any other state.
 */
export const ProposalStateMapping: {
  [T in ProposalState]: string;
} = {
  STATE_DECLINED: 'Declined',
  STATE_ENACTED: 'Enacted',
  STATE_FAILED: 'Failed',
  STATE_OPEN: 'Open',
  STATE_PASSED: 'Passed',
  STATE_REJECTED: 'Rejected',
  STATE_WAITING_FOR_NODE_VOTE: 'Waiting for Node Vote',
};

/**
 * Whether the placer of an order is aiming to buy or sell on the market
 */
export const SideMapping: {
  [T in Side]: string;
} = {
  SIDE_BUY: 'Long',
  SIDE_SELL: 'Short',
  SIDE_UNSPECIFIED: 'Unspecified',
};

/**
 * The status of the stake linking
 */
export const StakeLinkingStatusMapping: {
  [T in StakeLinkingStatus]: string;
} = {
  STATUS_ACCEPTED: 'Accepted',
  STATUS_PENDING: 'Pending',
  STATUS_REJECTED: 'Rejected',
};

export const ValidatorStatusMapping: {
  [T in ValidatorStatus]: string;
} = {
  VALIDATOR_NODE_STATUS_ERSATZ: 'Ersatz',
  VALIDATOR_NODE_STATUS_PENDING: 'Pending',
  VALIDATOR_NODE_STATUS_TENDERMINT: 'Tendermint',
};

export const VoteValueMapping: {
  [T in VoteValue]: string;
} = {
  VALUE_NO: 'No',
  VALUE_YES: 'Yes',
};

/**
 * The status of a withdrawal
 */
export const WithdrawalStatusMapping: {
  [T in WithdrawalStatus]: string;
} = {
  STATUS_FINALIZED: 'Finalized',
  STATUS_OPEN: 'Open',
  STATUS_REJECTED: 'Rejected',
};

// https://docs.vega.xyz/testnet/api/grpc/vega/vega.proto#transfertype
type TransferTypeMap = {
  [T in TransferType]: string;
};
export const TransferTypeMapping: TransferTypeMap = {
  TRANSFER_TYPE_UNSPECIFIED: 'Default value, always invalid',
  TRANSFER_TYPE_LOSS: 'Final settlement loss',
  TRANSFER_TYPE_WIN: 'Final settlement gain',
  TRANSFER_TYPE_MTM_LOSS: 'Mark to market loss',
  TRANSFER_TYPE_MTM_WIN: 'Mark to market gain',
  TRANSFER_TYPE_ORDER_MARGIN_HIGH: 'From order margin account to general',
  TRANSFER_TYPE_ORDER_MARGIN_LOW:
    'From general account to order margin account',
  TRANSFER_TYPE_MARGIN_LOW: 'Margin topped up',
  TRANSFER_TYPE_MARGIN_HIGH: 'Margin returned',
  TRANSFER_TYPE_MARGIN_CONFISCATED: 'Margin confiscated',
  TRANSFER_TYPE_MAKER_FEE_PAY: 'Maker fee paid',
  TRANSFER_TYPE_MAKER_FEE_RECEIVE: 'Maker fee received',
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_PAY: 'Infrastructure fee paid',
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_DISTRIBUTE: 'Infrastructure fee distributed',
  TRANSFER_TYPE_ISOLATED_MARGIN_LOW:
    'From order margin account to margin account',
  TRANSFER_TYPE_LIQUIDITY_FEE_PAY: 'Liquidity fee paid',
  TRANSFER_TYPE_LIQUIDITY_FEE_DISTRIBUTE: 'Liquidity fee received',
  TRANSFER_TYPE_BOND_LOW: 'Bond account funded',
  TRANSFER_TYPE_BOND_HIGH: 'Bond returned',
  TRANSFER_TYPE_WITHDRAW: 'Withdrawal',
  TRANSFER_TYPE_DEPOSIT: 'Deposit',
  TRANSFER_TYPE_BOND_SLASHING: 'Bond slashed',
  TRANSFER_TYPE_REWARD_PAYOUT: 'Rewards funded',
  TRANSFER_TYPE_TRANSFER_FUNDS_SEND: 'Transfer sent',
  TRANSFER_TYPE_TRANSFER_FUNDS_DISTRIBUTE: 'Transfer received',
  TRANSFER_TYPE_CLEAR_ACCOUNT: 'Market accounts cleared',
  TRANSFER_TYPE_CHECKPOINT_BALANCE_RESTORE: 'Balances restored',
  TRANSFER_TYPE_HOLDING_LOCK: 'Holding locked',
  TRANSFER_TYPE_HOLDING_RELEASE: 'Holding released',
  TRANSFER_TYPE_SPOT: 'Spot',
  TRANSFER_TYPE_LIQUIDITY_FEE_ALLOCATE: 'Liquidity fee allocated',
  TRANSFER_TYPE_LIQUIDITY_FEE_NET_DISTRIBUTE: 'Liquidity fee net distributed',
  TRANSFER_TYPE_LIQUIDITY_FEE_UNPAID_COLLECT: 'Liquidity fee unpaid collected',
  TRANSFER_TYPE_PERPETUALS_FUNDING_WIN: 'Perpetuals funding gain',
  TRANSFER_TYPE_PERPETUALS_FUNDING_LOSS: 'Perpetuals funding loss',
  TRANSFER_TYPE_REWARDS_VESTED: 'Rewards vested',
  TRANSFER_TYPE_SLA_PENALTY_BOND_APPLY: 'SLA penalty bond applied',
  TRANSFER_TYPE_SLA_PENALTY_LP_FEE_APPLY: 'SLA penalty LP fee applied',
  TRANSFER_TYPE_SLA_PERFORMANCE_BONUS_DISTRIBUTE:
    'SLA performance bonus distributed',
  TRANSFER_TYPE_SUCCESSOR_INSURANCE_FRACTION: 'Successor insurance fraction',
};

export const DescriptionTransferTypeMapping: TransferTypeMap = {
  TRANSFER_TYPE_LOSS: `Funds deducted after final settlement loss`,
  TRANSFER_TYPE_WIN: `Funds added to your general account after final settlement gain`,
  TRANSFER_TYPE_MTM_LOSS: `Funds deducted from your margin account after mark to market loss`,
  TRANSFER_TYPE_MTM_WIN: `Funds added to your margin account after mark to market gain`,
  TRANSFER_TYPE_ORDER_MARGIN_HIGH:
    'Funds released from order margin account to general',
  TRANSFER_TYPE_ORDER_MARGIN_LOW:
    'Funds moved from general account to order margin account',
  TRANSFER_TYPE_MARGIN_LOW: `Funds deducted from your general account to meet margin requirement`,
  TRANSFER_TYPE_MARGIN_HIGH: `Excess margin amount returned to your general account`,
  TRANSFER_TYPE_MARGIN_CONFISCATED: `Margin confiscated from your margin account to fulfil closeout`,
  TRANSFER_TYPE_MAKER_FEE_PAY: `Maker fee paid from your general account when your aggressive trade was filled`,
  TRANSFER_TYPE_MAKER_FEE_RECEIVE: `Maker fee received into your general account when your passive order was filled`,
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_PAY: `Infrastructure fee paid from your general account when your order was filled`,
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_DISTRIBUTE: `Infrastructure fee received: Infrastructure fee, paid by traders, received into your general account`,
  TRANSFER_TYPE_ISOLATED_MARGIN_LOW:
    'Funds moved from order margin account to margin account',
  TRANSFER_TYPE_LIQUIDITY_FEE_PAY: `Liquidity fee paid from your general account to market's liquidity providers`,
  TRANSFER_TYPE_LIQUIDITY_FEE_DISTRIBUTE: `Liquidity fee received into your general account from traders`,
  TRANSFER_TYPE_BOND_LOW: `Funds deducted from your general account to meet your required liquidity bond amount`,
  TRANSFER_TYPE_BOND_HIGH: `Bond returned to your general account after your liquidity commitment was reduced`,
  TRANSFER_TYPE_WITHDRAW: `Funds withdrawn from your general account`,
  TRANSFER_TYPE_DEPOSIT: `Funds deposited to your general account`,
  TRANSFER_TYPE_BOND_SLASHING: `Bond account penalized when liquidity commitment not met`,
  TRANSFER_TYPE_REWARD_PAYOUT: `Collateral deducted from your general account to fund rewards you've set up`,
  TRANSFER_TYPE_TRANSFER_FUNDS_SEND: `Funds deducted from your general account to fulfil a transfer`,
  TRANSFER_TYPE_TRANSFER_FUNDS_DISTRIBUTE: `Funds added to your general account to fulfil a transfer`,
  TRANSFER_TYPE_CLEAR_ACCOUNT: `Market-related accounts emptied, and balances moved, because the market has closed`,
  TRANSFER_TYPE_UNSPECIFIED: 'Default value, always invalid',
  TRANSFER_TYPE_CHECKPOINT_BALANCE_RESTORE: `Balances are being restored to the user's account following a checkpoint restart of the network`,
  TRANSFER_TYPE_HOLDING_LOCK: 'Holdings locked',
  TRANSFER_TYPE_HOLDING_RELEASE: 'Holdings released',
  TRANSFER_TYPE_SPOT: 'Spot',
  TRANSFER_TYPE_LIQUIDITY_FEE_ALLOCATE: 'Liquidity fee allocated',
  TRANSFER_TYPE_LIQUIDITY_FEE_NET_DISTRIBUTE: 'Liquidity fee net distributed',
  TRANSFER_TYPE_LIQUIDITY_FEE_UNPAID_COLLECT: 'Liquidity fee unpaid collected',
  TRANSFER_TYPE_PERPETUALS_FUNDING_WIN: 'Perpetuals funding gain',
  TRANSFER_TYPE_PERPETUALS_FUNDING_LOSS: 'Perpetuals funding loss',
  TRANSFER_TYPE_REWARDS_VESTED: 'Rewards vested',
  TRANSFER_TYPE_SLA_PENALTY_BOND_APPLY: 'SLA penalty bond applied',
  TRANSFER_TYPE_SLA_PENALTY_LP_FEE_APPLY: 'SLA penalty LP fee applied',
  TRANSFER_TYPE_SLA_PERFORMANCE_BONUS_DISTRIBUTE:
    'SLA performance bonus distributed',
  TRANSFER_TYPE_SUCCESSOR_INSURANCE_FRACTION: 'Successor insurance fraction',
};

/**
 * Governance transfers
 */
type GovernanceTransferTypeMap = {
  [T in GovernanceTransferType]: string;
};
export const GovernanceTransferTypeMapping: GovernanceTransferTypeMap = {
  GOVERNANCE_TRANSFER_TYPE_ALL_OR_NOTHING: 'All or nothing',
  GOVERNANCE_TRANSFER_TYPE_BEST_EFFORT: 'Best effort',
  GOVERNANCE_TRANSFER_TYPE_UNSPECIFIED: 'Unspecified',
};
export const DescriptionGovernanceTransferTypeMapping: GovernanceTransferTypeMap =
  {
    GOVERNANCE_TRANSFER_TYPE_ALL_OR_NOTHING:
      'Transfers the specified amount or does not transfer anything',
    GOVERNANCE_TRANSFER_TYPE_BEST_EFFORT:
      'Transfers the specified amount or the max allowable amount if this is less than the specified amount',
    GOVERNANCE_TRANSFER_TYPE_UNSPECIFIED: 'Default value, always invalid',
  };

type GovernanceTransferKindMap = {
  [T in NonNullable<GovernanceTransferKind['__typename']>]: string;
};
export const GovernanceTransferKindMapping: GovernanceTransferKindMap = {
  OneOffGovernanceTransfer: 'One off',
  RecurringGovernanceTransfer: 'Recurring',
};

/**
 * The below dispatch metric labels are extended by additional
 * `StakingRewardMetric` which handles the case when a reward (transfer)
 * has undefined dispatch strategy and it targetted to
 * `AccountType.ACCOUNT_TYPE_GLOBAL_REWARD`.
 */

export type StakingRewardMetric = 'STAKING_REWARD_METRIC';

export type StakingDispatchStrategy = Omit<
  DispatchStrategy,
  'dispatchMetric'
> & {
  dispatchMetric: StakingRewardMetric;
};

type DispatchMetricLabel = {
  [T in DispatchMetric | StakingRewardMetric]: string;
};

export const DispatchMetricLabels: DispatchMetricLabel = {
  DISPATCH_METRIC_LP_FEES_RECEIVED: 'Liquidity provision fees received',
  DISPATCH_METRIC_MAKER_FEES_PAID: 'Price maker fees paid',
  DISPATCH_METRIC_MAKER_FEES_RECEIVED: 'Price maker fees earned',
  DISPATCH_METRIC_MARKET_VALUE: 'Total market value',
  DISPATCH_METRIC_AVERAGE_POSITION: 'Average position',
  DISPATCH_METRIC_RELATIVE_RETURN: 'Relative return',
  DISPATCH_METRIC_RETURN_VOLATILITY: 'Return volatility',
  DISPATCH_METRIC_VALIDATOR_RANKING: 'Validator ranking',
  STAKING_REWARD_METRIC: 'Staking rewards',
  DISPATCH_METRIC_REALISED_RETURN: 'Realised return',
};

export const DispatchMetricDescription: DispatchMetricLabel = {
  DISPATCH_METRIC_LP_FEES_RECEIVED: 'Get rewards for providing liquidity.',
  DISPATCH_METRIC_MAKER_FEES_PAID:
    'Get rewards for taking prices off the order book and paying fees.',
  DISPATCH_METRIC_MAKER_FEES_RECEIVED:
    'Get rewards for making prices on the order book.',
  DISPATCH_METRIC_MARKET_VALUE:
    'Get rewards if a market you proposed attracts a high trading volume.',
  DISPATCH_METRIC_AVERAGE_POSITION:
    'Get rewards for having an open position that is consistently larger than that of other traders.',
  DISPATCH_METRIC_RELATIVE_RETURN:
    'Get rewards for having a high profit in relation to your position size.',
  DISPATCH_METRIC_RETURN_VOLATILITY:
    'Get rewards for having the least amount of variance in your returns while you have a position open during the rewards window.',
  DISPATCH_METRIC_VALIDATOR_RANKING:
    'Get rewards if you run a validator node with a high ranking score.',
  STAKING_REWARD_METRIC:
    'Global staking reward for staking $VEGA on the network via the Governance app',
  DISPATCH_METRIC_REALISED_RETURN:
    'Get rewards for having a high profit in relation to your position size.',
};

export const PositionStatusMapping: {
  [T in PositionStatus]: string;
} = {
  POSITION_STATUS_CLOSED_OUT: 'Closed by network',
  POSITION_STATUS_ORDERS_CLOSED: 'Maintained by network',
  POSITION_STATUS_UNSPECIFIED: 'Normal',
  POSITION_STATUS_DISTRESSED: 'Distressed',
};

export const TransferStatusMapping: {
  [T in TransferStatus]: string;
} = {
  STATUS_DONE: 'Done',
  STATUS_PENDING: 'Pending',
  STATUS_REJECTED: 'Rejected',
  STATUS_CANCELLED: 'Cancelled',
  STATUS_STOPPED: 'Stopped',
};

export const ConditionOperatorMapping: { [C in ConditionOperator]: string } = {
  OPERATOR_EQUALS: 'Equals',
  OPERATOR_GREATER_THAN: 'Greater than',
  OPERATOR_GREATER_THAN_OR_EQUAL: 'Greater than or equal to',
  OPERATOR_LESS_THAN: 'Less than',
  OPERATOR_LESS_THAN_OR_EQUAL: 'Less than or equal to',
};

export const PeggedReferenceMapping: { [R in PeggedReference]: string } = {
  PEGGED_REFERENCE_BEST_ASK: 'Ask',
  PEGGED_REFERENCE_BEST_BID: 'Bid',
  PEGGED_REFERENCE_MID: 'Mid',
};

export const ProductTypeMapping: Record<ProductType, string> = {
  Future: 'Future',
  Spot: 'Spot',
  Perpetual: 'Perpetual',
};

export const ProductTypeShortName: Record<ProductType, string> = {
  Future: 'Futr',
  Spot: 'Spot',
  Perpetual: 'Perp',
};

export const ProposalProductTypeMapping: Record<ProposalProductType, string> = {
  FutureProduct: 'Future',
  SpotProduct: 'Spot',
  PerpetualProduct: 'Perpetual',
};

export const EntityScopeMapping: { [e in EntityScope]: string } = {
  /** Rewards must be distributed directly to eligible parties */
  ENTITY_SCOPE_INDIVIDUALS:
    'Rewards must be distributed directly to eligible parties',
  /** Rewards must be distributed directly to eligible teams, and then amongst team members */
  ENTITY_SCOPE_TEAMS:
    'Rewards must be distributed directly to eligible teams, and then amongst team members',
};

export const EntityScopeLabelMapping: { [e in EntityScope]: string } = {
  /** Rewards must be distributed directly to eligible parties */
  ENTITY_SCOPE_INDIVIDUALS: 'Individual',
  /** Rewards must be distributed directly to eligible teams, and then amongst team members */
  ENTITY_SCOPE_TEAMS: 'Team',
};

export const IndividualScopeMapping: { [e in IndividualScope]: string } = {
  INDIVIDUAL_SCOPE_ALL: 'All',
  INDIVIDUAL_SCOPE_IN_TEAM: 'In team',
  INDIVIDUAL_SCOPE_NOT_IN_TEAM: 'Not in team',
};

export const IndividualScopeDescriptionMapping: {
  [e in IndividualScope]: string;
} = {
  INDIVIDUAL_SCOPE_ALL: 'All parties are eligible',
  INDIVIDUAL_SCOPE_IN_TEAM: 'Parties in teams are eligible',
  INDIVIDUAL_SCOPE_NOT_IN_TEAM: 'Only parties not in teams are eligible',
};

export enum DistributionStrategyMapping {
  /** Rewards funded using the pro-rata strategy should be distributed pro-rata by each entity's reward metric scaled by any active multipliers that party has */
  DISTRIBUTION_STRATEGY_PRO_RATA = 'Pro rata',
  /** Rewards funded using the rank strategy */
  DISTRIBUTION_STRATEGY_RANK = 'Strategy rank',
}

export enum DistributionStrategyDescriptionMapping {
  DISTRIBUTION_STRATEGY_PRO_RATA = "Rewards funded using the pro-rata strategy are distributed pro-rata by each party's reward score scaled by any active multipliers they have.",
  DISTRIBUTION_STRATEGY_RANK = 'Rewards funded using the rank strategy.',
}

export const ProposalProductTypeShortName: Record<ProposalProductType, string> =
  {
    FutureProduct: 'Futr',
    SpotProduct: 'Spot',
    PerpetualProduct: 'Perp',
  };

export const LiquidityFeeMethodMapping: { [e in LiquidityFeeMethod]: string } =
  {
    /** Fee is set by the market to a constant value irrespective of any liquidity provider's nominated fee */
    METHOD_CONSTANT: 'Constant',
    /** Fee is smallest value of all bids, such that liquidity providers with nominated fees less than or equal to this value still have sufficient commitment to fulfil the market's target stake. */
    METHOD_MARGINAL_COST: 'Marginal cost',
    METHOD_UNSPECIFIED: 'Unspecified',
    /** Fee is the weighted average of all liquidity providers' nominated fees, weighted by their commitment */
    METHOD_WEIGHTED_AVERAGE: 'Weighted average',
  };

export const LiquidityFeeMethodMappingDescription: {
  [e in LiquidityFeeMethod]: string;
} = {
  METHOD_CONSTANT: `This liquidity fee is a constant value, set in the market parameters, and overrides the liquidity providers' nominated fees.`,
  METHOD_MARGINAL_COST: `This liquidity fee factor is determined by sorting all LP fee bids from lowest to highest, with LPs' commitments tallied up to the point of fulfilling the market's target stake. The last LP's bid becomes the fee factor.`,
  METHOD_UNSPECIFIED: 'Unspecified',
  METHOD_WEIGHTED_AVERAGE: `This liquidity fee is the weighted average of all liquidity providers' nominated fees, weighted by their commitment.`,
};

export const MarketUpdateTypeMapping = {
  [MarketUpdateType.MARKET_STATE_UPDATE_TYPE_RESUME]: 'Resume',
  [MarketUpdateType.MARKET_STATE_UPDATE_TYPE_SUSPEND]: 'Suspend',
  [MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE]: 'Terminate',
  [MarketUpdateType.MARKET_STATE_UPDATE_TYPE_UNSPECIFIED]: 'Unspecified',
};
