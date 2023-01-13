import type {
  AccountType,
  AuctionTrigger,
  DataSourceSpecStatus,
  DepositStatus,
  Interval,
  LiquidityProvisionStatus,
  MarketState,
  MarketTradingMode,
  NodeStatus,
  OrderRejectionReason,
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  ProposalRejectionReason,
  ProposalState,
  Side,
  StakeLinkingStatus,
  TransferType,
  ValidatorStatus,
  VoteValue,
  WithdrawalStatus,
} from './__generated__/types';

export const AccountTypeMapping: {
  [T in AccountType]: string;
} = {
  ACCOUNT_TYPE_BOND: 'Bond',
  ACCOUNT_TYPE_EXTERNAL: 'External',
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE: 'Fees Infrastructure',
  ACCOUNT_TYPE_FEES_LIQUIDITY: 'Fees Liquidity',
  ACCOUNT_TYPE_FEES_MAKER: 'Fees Maker',
  ACCOUNT_TYPE_GENERAL: 'General',
  ACCOUNT_TYPE_GLOBAL_INSURANCE: 'Global Insurance',
  ACCOUNT_TYPE_GLOBAL_REWARD: 'Global Reward',
  ACCOUNT_TYPE_INSURANCE: 'Insurance',
  ACCOUNT_TYPE_MARGIN: 'Margin',
  ACCOUNT_TYPE_PENDING_TRANSFERS: 'Pending transfers',
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: 'Reward LP received fees',
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: 'Reward Maker received fees',
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: 'Reward Market Proposers',
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: 'Reward Maker paid fees',
  ACCOUNT_TYPE_SETTLEMENT: 'Settlement',
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
  AUCTION_TRIGGER_LIQUIDITY: 'liquidity',
  AUCTION_TRIGGER_OPENING: 'opening',
  AUCTION_TRIGGER_PRICE: 'price',
  AUCTION_TRIGGER_UNSPECIFIED: 'unspecified',
};

/**
 * The status of a deposit
 */
export const DepositStatusMapping: {
  [T in DepositStatus]: string;
} = {
  STATUS_CANCELLED: 'Cancelled',
  STATUS_FINALIZED: 'Finalized',
  STATUS_OPEN: 'Open',
};

/**
 * The interval for trade candles when subscribing via Vega GraphQL, default is I15M
 */
export const IntervalMapping: {
  [T in Interval]: string;
} = {
  INTERVAL_I15M: 'I15M',
  INTERVAL_I1D: 'I1D',
  INTERVAL_I1H: 'I1H',
  INTERVAL_I1M: 'I1M',
  INTERVAL_I5M: 'I5M',
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
  ORDER_ERROR_GFA_CANNOT_SEND_ORDER_DURING_CONTINUOUS_TRADING:
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
  STATUS_PARTIALLY_FILLED: 'PartiallyFilled',
  STATUS_REJECTED: 'Rejected',
  STATUS_STOPPED: 'Stopped',
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
  TRANSFER_TYPE_MARGIN_LOW: 'Margin topped up',
  TRANSFER_TYPE_MARGIN_HIGH: 'Margin returned',
  TRANSFER_TYPE_MARGIN_CONFISCATED: 'Margin confiscated',
  TRANSFER_TYPE_MAKER_FEE_PAY: 'Maker fee paid',
  TRANSFER_TYPE_MAKER_FEE_RECEIVE: 'Maker fee received',
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_PAY: 'Infrastructure fee paid',
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_DISTRIBUTE: 'Infrastructure fee distributed',
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
};

export const DescriptionTransferTypeMapping: TransferTypeMap = {
  TRANSFER_TYPE_LOSS: `Funds deducted after final settlement loss`,
  TRANSFER_TYPE_WIN: `Funds added to your general account after final settlement gain`,
  TRANSFER_TYPE_MTM_LOSS: `Funds deducted from your margin account after mark to market loss`,
  TRANSFER_TYPE_MTM_WIN: `Funds added to your margin account after mark to market gain`,
  TRANSFER_TYPE_MARGIN_LOW: `Funds deducted from your general account to meet margin requirement`,
  TRANSFER_TYPE_MARGIN_HIGH: `Excess margin amount returned to your general account`,
  TRANSFER_TYPE_MARGIN_CONFISCATED: `Margin confiscated from your margin account to fulfil closeout`,
  TRANSFER_TYPE_MAKER_FEE_PAY: `Maker fee paid from your general account when your aggressive trade was filled`,
  TRANSFER_TYPE_MAKER_FEE_RECEIVE: `Maker fee received into your general account when your passive order was filled`,
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_PAY: `Infrastructure fee paid from your general account when your order was filled`,
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_DISTRIBUTE: `Infrastructure fee received: Infrastructure fee, paid by traders, received into your general account`,
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
};
