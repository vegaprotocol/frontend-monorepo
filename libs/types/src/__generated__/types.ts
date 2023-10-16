export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** RFC3339Nano value for time */
  Timestamp: any;
};

/** An account record */
export type AccountBalance = {
  __typename?: 'AccountBalance';
  /** Asset, the 'currency' */
  asset: Asset;
  /** Balance as string - current account balance (approx. as balances can be updated several times per second) */
  balance: Scalars['String'];
  /** Market (only relevant to margin accounts) */
  market?: Maybe<Market>;
  /** Owner of the account */
  party?: Maybe<Party>;
  /** Account type (General, Margin, etc) */
  type: AccountType;
};

/** An account record */
export type AccountDetails = {
  __typename?: 'AccountDetails';
  /** Asset, the 'currency' */
  assetId: Scalars['ID'];
  /** Market (only relevant to margin accounts) */
  marketId?: Maybe<Scalars['ID']>;
  /** Owner of the account */
  partyId?: Maybe<Scalars['ID']>;
  /** Account type (General, Margin, etc) */
  type: AccountType;
};

/** Edge type containing the account and cursor information returned by an AccountsConnection */
export type AccountEdge = {
  __typename?: 'AccountEdge';
  /** Cursor identifying the account */
  cursor: Scalars['String'];
  /** The account */
  node: AccountBalance;
};

/** An account record */
export type AccountEvent = {
  __typename?: 'AccountEvent';
  /** Asset, the 'currency' */
  asset: Asset;
  /** Balance as string - current account balance (approx. as balances can be updated several times per second) */
  balance: Scalars['String'];
  /** Market (only relevant to margin accounts) */
  market?: Maybe<Market>;
  /** Owner of the account */
  party?: Maybe<Party>;
  /** Account type (General, Margin, etc) */
  type: AccountType;
};

/** Filter input for historical balance queries */
export type AccountFilter = {
  accountTypes?: InputMaybe<Array<AccountType>>;
  assetId?: InputMaybe<Scalars['ID']>;
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  partyIds?: InputMaybe<Array<Scalars['ID']>>;
};

/** The various account types in Vega (used by collateral) */
export enum AccountType {
  /** Bond - an account use to maintain liquidity commitments */
  ACCOUNT_TYPE_BOND = 'ACCOUNT_TYPE_BOND',
  /** External - an account use to refer to external account */
  ACCOUNT_TYPE_EXTERNAL = 'ACCOUNT_TYPE_EXTERNAL',
  /** Infrastructure fee account - the account where all infrastructure fees are collected */
  ACCOUNT_TYPE_FEES_INFRASTRUCTURE = 'ACCOUNT_TYPE_FEES_INFRASTRUCTURE',
  /** Liquidity fee account - the account contains fees earned by providing liquidity */
  ACCOUNT_TYPE_FEES_LIQUIDITY = 'ACCOUNT_TYPE_FEES_LIQUIDITY',
  /** Market maker fee account - holds fees paid to the passive side when a trade matches */
  ACCOUNT_TYPE_FEES_MAKER = 'ACCOUNT_TYPE_FEES_MAKER',
  /** General account - the account containing 'unused' collateral for parties */
  ACCOUNT_TYPE_GENERAL = 'ACCOUNT_TYPE_GENERAL',
  /** Global insurance pool account for an asset */
  ACCOUNT_TYPE_GLOBAL_INSURANCE = 'ACCOUNT_TYPE_GLOBAL_INSURANCE',
  /** GlobalReward - a global account for the reward pool */
  ACCOUNT_TYPE_GLOBAL_REWARD = 'ACCOUNT_TYPE_GLOBAL_REWARD',
  /** AccountTypeHolding - an account for holding funds covering for active unfilled orders */
  ACCOUNT_TYPE_HOLDING = 'ACCOUNT_TYPE_HOLDING',
  /** Insurance pool account - only for 'system' party */
  ACCOUNT_TYPE_INSURANCE = 'ACCOUNT_TYPE_INSURANCE',
  /** Per liquidity provider, per market account for holding LPs' fees before distribution */
  ACCOUNT_TYPE_LP_LIQUIDITY_FEES = 'ACCOUNT_TYPE_LP_LIQUIDITY_FEES',
  /**
   * Margin - The leverage account for parties, contains funds set aside for the margin needed to support
   * a party's open positions. Each party will have a margin account for each market they have traded in.
   * The required initial margin is allocated to each market from the general account, and it cannot be withdrawn
   * or used as margin on another market until it's released back into the general account.
   * The protocol uses an internal accounting system to segregate funds held as margin from other funds
   * to ensure they are never lost or 'double spent'
   */
  ACCOUNT_TYPE_MARGIN = 'ACCOUNT_TYPE_MARGIN',
  /** Network treasury, per-asset treasury controlled by the network */
  ACCOUNT_TYPE_NETWORK_TREASURY = 'ACCOUNT_TYPE_NETWORK_TREASURY',
  /** Holds pending rewards to be paid to the referrer of a party out of fees paid by the taker */
  ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD = 'ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD',
  /** PendingTransfers - a global account for the pending transfers pool */
  ACCOUNT_TYPE_PENDING_TRANSFERS = 'ACCOUNT_TYPE_PENDING_TRANSFERS',
  /** Average position reward account is a per asset per market account for average position reward funds */
  ACCOUNT_TYPE_REWARD_AVERAGE_POSITION = 'ACCOUNT_TYPE_REWARD_AVERAGE_POSITION',
  /** RewardLpReceivedFees - an account holding rewards for a liquidity provider's received fees */
  ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES = 'ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES',
  /** RewardMakerPaidFees - an account holding rewards for maker paid fees */
  ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES = 'ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES',
  /** RewardMakerReceivedFees - an account holding rewards for maker received fees */
  ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES = 'ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES',
  /** RewardMarketProposers - an account holding rewards for market proposers */
  ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS = 'ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS',
  /** Relative return reward account is a per asset per market account for relative return reward funds */
  ACCOUNT_TYPE_REWARD_RELATIVE_RETURN = 'ACCOUNT_TYPE_REWARD_RELATIVE_RETURN',
  /** Return volatility reward account is a per asset per market account for return volatility reward funds */
  ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY = 'ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY',
  /** Validator ranking reward account is a per asset account for validator ranking reward funds */
  ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING = 'ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING',
  /** Settlement - only for 'system' party */
  ACCOUNT_TYPE_SETTLEMENT = 'ACCOUNT_TYPE_SETTLEMENT',
  /** Vested reward account is a per party per asset account for vested reward funds */
  ACCOUNT_TYPE_VESTED_REWARDS = 'ACCOUNT_TYPE_VESTED_REWARDS',
  /** Vesting reward account is a per party per asset account for locked reward funds waiting to be vested */
  ACCOUNT_TYPE_VESTING_REWARDS = 'ACCOUNT_TYPE_VESTING_REWARDS'
}

/** An account record used for subscriptions */
export type AccountUpdate = {
  __typename?: 'AccountUpdate';
  /** Asset id, the 'currency' */
  assetId: Scalars['ID'];
  /** Balance as string - current account balance (approx. as balances can be updated several times per second) */
  balance: Scalars['String'];
  /** Market id (only relevant to margin accounts) */
  marketId?: Maybe<Scalars['ID']>;
  /** The party owning the account */
  partyId: Scalars['ID'];
  /** Account type (General, Margin, etc) */
  type: AccountType;
};

/** Connection type for retrieving cursor-based paginated list of account */
export type AccountsConnection = {
  __typename?: 'AccountsConnection';
  /** List of accounts available for the connection */
  edges?: Maybe<Array<Maybe<AccountEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

export type AggregatedBalance = {
  __typename?: 'AggregatedBalance';
  /** Account type, if query was grouped by account type - else null */
  accountType?: Maybe<AccountType>;
  /** Asset identifier, if query was grouped by asset - else null */
  assetId?: Maybe<Scalars['ID']>;
  /** Net balance of the accounts specified in the filter at this time */
  balance: Scalars['String'];
  /** Market identifier, if query was grouped by market - else null */
  marketId?: Maybe<Scalars['ID']>;
  /** Account identifier, if query was grouped by account - else null */
  partyId?: Maybe<Scalars['ID']>;
  /** RFC3339Nano time from at which this balance was relevant */
  timestamp: Scalars['Timestamp'];
};

export type AggregatedBalanceConnection = {
  __typename?: 'AggregatedBalanceConnection';
  edges: Array<Maybe<AggregatedBalanceEdge>>;
  pageInfo: PageInfo;
};

export type AggregatedBalanceEdge = {
  __typename?: 'AggregatedBalanceEdge';
  cursor: Scalars['String'];
  /** The aggregated balance */
  node: AggregatedBalance;
};

export type AggregatedLedgerEntriesConnection = {
  __typename?: 'AggregatedLedgerEntriesConnection';
  edges: Array<Maybe<AggregatedLedgerEntriesEdge>>;
  pageInfo: PageInfo;
};

export type AggregatedLedgerEntriesEdge = {
  __typename?: 'AggregatedLedgerEntriesEdge';
  cursor: Scalars['String'];
  node: AggregatedLedgerEntry;
};

export type AggregatedLedgerEntry = {
  __typename?: 'AggregatedLedgerEntry';
  /** Asset identifier, if query was grouped by asset - else null */
  assetId?: Maybe<Scalars['ID']>;
  /** Sender account balance after the transfer */
  fromAccountBalance: Scalars['String'];
  /** Market identifier, if query was grouped by sender market - else null */
  fromAccountMarketId?: Maybe<Scalars['ID']>;
  /** Party identifier, if query was grouped by sender party - else null */
  fromAccountPartyId?: Maybe<Scalars['ID']>;
  /** Account type, if query was grouped by sender account type - else null */
  fromAccountType?: Maybe<AccountType>;
  /** Net amount of ledger entries for the accounts specified in the filter at this time */
  quantity: Scalars['String'];
  /** Receiver account balance after the transfer */
  toAccountBalance: Scalars['String'];
  /** Market identifier, if query was grouped by receiver market - else null */
  toAccountMarketId?: Maybe<Scalars['ID']>;
  /** Party identifier, if query was grouped by receiver party - else null */
  toAccountPartyId?: Maybe<Scalars['ID']>;
  /** Account type, if query was grouped by receiver account type - else null */
  toAccountType?: Maybe<AccountType>;
  /** Type of the transfer for this ledger entry */
  transferType?: Maybe<TransferType>;
  /** RFC3339Nano time from at which this ledger entries records were relevant */
  vegaTime: Scalars['Timestamp'];
};

/** Represents an asset in Vega */
export type Asset = {
  __typename?: 'Asset';
  /** The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18 */
  decimals: Scalars['Int'];
  /** The global insurance account for this asset */
  globalInsuranceAccount?: Maybe<AccountBalance>;
  /** The staking reward pool account for this asset */
  globalRewardPoolAccount?: Maybe<AccountBalance>;
  /** The ID of the asset */
  id: Scalars['ID'];
  /** The infrastructure fee account for this asset */
  infrastructureFeeAccount?: Maybe<AccountBalance>;
  /** The liquidity provision reward account for this asset */
  lpFeeRewardAccount?: Maybe<AccountBalance>;
  /** The maker fee reward account for this asset */
  makerFeeRewardAccount?: Maybe<AccountBalance>;
  /** The market proposer reward account for this asset */
  marketProposerRewardAccount?: Maybe<AccountBalance>;
  /** The full name of the asset (e.g: Great British Pound) */
  name: Scalars['String'];
  /** The network treasury account for this asset */
  networkTreasuryAccount?: Maybe<AccountBalance>;
  /** The minimum economically meaningful amount in the asset */
  quantum: Scalars['String'];
  /** The origin source of the asset (e.g: an ERC20 asset) */
  source: AssetSource;
  /** The status of the asset in the Vega network */
  status: AssetStatus;
  /** The symbol of the asset (e.g: GBP) */
  symbol: Scalars['String'];
  /** The taker fee reward account for this asset */
  takerFeeRewardAccount?: Maybe<AccountBalance>;
};

/** Edge type containing the asset and cursor information returned by a AssetsConnection */
export type AssetEdge = {
  __typename?: 'AssetEdge';
  /** The cursor for the asset */
  cursor: Scalars['String'];
  /** The asset information */
  node: Asset;
};

/** One of the possible asset sources */
export type AssetSource = BuiltinAsset | ERC20;

/** Status of an asset that has been proposed to be added to the network */
export enum AssetStatus {
  /** Asset can be used on the Vega network */
  STATUS_ENABLED = 'STATUS_ENABLED',
  /** Asset is pending listing on the ethereum bridge */
  STATUS_PENDING_LISTING = 'STATUS_PENDING_LISTING',
  /** Asset is proposed to be added to the network */
  STATUS_PROPOSED = 'STATUS_PROPOSED',
  /** Asset has been rejected */
  STATUS_REJECTED = 'STATUS_REJECTED'
}

/** Connection type for retrieving cursor-based paginated assets information */
export type AssetsConnection = {
  __typename?: 'AssetsConnection';
  /** The assets */
  edges?: Maybe<Array<Maybe<AssetEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/**
 * An auction duration is used to configure 3 auction periods:
 * 1. `duration > 0`, `volume == 0`:
 * The auction will last for at least N seconds.
 * 2. `duration == 0`, `volume > 0`:
 * The auction will end once the given volume will match at uncrossing.
 * 3. `duration > 0`, `volume > 0`:
 * The auction will take at least N seconds, but can end sooner if the market can trade a certain volume.
 */
export type AuctionDuration = {
  __typename?: 'AuctionDuration';
  /** Duration of the auction in seconds */
  durationSecs: Scalars['Int'];
  /** Target uncrossing trading volume */
  volume: Scalars['Int'];
};

export type AuctionEvent = {
  __typename?: 'AuctionEvent';
  /** RFC3339Nano optional end time of auction */
  auctionEnd: Scalars['Timestamp'];
  /** RFC3339Nano start time of auction */
  auctionStart: Scalars['Timestamp'];
  /** What, if anything, extended the ongoing auction */
  extensionTrigger?: Maybe<AuctionTrigger>;
  /** Event fired because of auction end */
  leave: Scalars['Boolean'];
  /** The ID of the market that went into auction */
  marketId: Scalars['ID'];
  /** Event related to opening auction */
  openingAuction: Scalars['Boolean'];
  /** What triggered the auction */
  trigger: AuctionTrigger;
};

/** Describes the trigger for an auction */
export enum AuctionTrigger {
  /** Auction because market has a frequent batch auction trading mode */
  AUCTION_TRIGGER_BATCH = 'AUCTION_TRIGGER_BATCH',
  /** Auction triggered by governance market suspension */
  AUCTION_TRIGGER_GOVERNANCE_SUSPENSION = 'AUCTION_TRIGGER_GOVERNANCE_SUSPENSION',
  /** Liquidity monitoring due to unmet target stake */
  AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET = 'AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET',
  /** Opening auction */
  AUCTION_TRIGGER_OPENING = 'AUCTION_TRIGGER_OPENING',
  /** Price monitoring */
  AUCTION_TRIGGER_PRICE = 'AUCTION_TRIGGER_PRICE',
  /** Liquidity monitoring due to not being able to deploy LP orders because there's nothing to peg on one or both sides of the book */
  AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS = 'AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS',
  /** Invalid trigger (or no auction) */
  AUCTION_TRIGGER_UNSPECIFIED = 'AUCTION_TRIGGER_UNSPECIFIED'
}

export type BenefitTier = {
  __typename?: 'BenefitTier';
  /** The minimum number of epochs the party needs to be in the referral set to be eligible for the benefit */
  minimumEpochs: Scalars['Int'];
  /** The minimum running notional for the given benefit tier */
  minimumRunningNotionalTakerVolume: Scalars['String'];
  /** The proportion of the referee's taker fees to be discounted */
  referralDiscountFactor: Scalars['String'];
  /** The proportion of the referee's taker fees to be rewarded to the referrer */
  referralRewardFactor: Scalars['String'];
};

/** A Vega builtin asset, mostly for testing purpose */
export type BuiltinAsset = {
  __typename?: 'BuiltinAsset';
  /** Maximum amount that can be requested by a party through the built-in asset faucet at a time */
  maxFaucetAmountMint: Scalars['String'];
};

export type BusEvent = {
  __typename?: 'BusEvent';
  /** The block hash */
  block: Scalars['String'];
  /** The payload - the wrapped event */
  event: Event;
  /** The ID for this event */
  id: Scalars['ID'];
  /** The type of event */
  type: BusEventType;
};

/** Event types */
export enum BusEventType {
  /** Collateral has deposited in to this Vega network via the bridge */
  Deposit = 'Deposit',
  /** Vega Time has changed */
  TimeUpdate = 'TimeUpdate',
  /** The results from processing at transaction */
  TransactionResult = 'TransactionResult',
  /** Collateral has been withdrawn from this Vega network via the bridge */
  Withdrawal = 'Withdrawal'
}

/** Allows for cancellation of an existing governance transfer */
export type CancelTransfer = {
  __typename?: 'CancelTransfer';
  /** The governance transfer to cancel */
  transferId: Scalars['ID'];
};

/** Candle stick representation of trading */
export type Candle = {
  __typename?: 'Candle';
  /** Close price (uint64) */
  close: Scalars['String'];
  /** High price (uint64) */
  high: Scalars['String'];
  /** RFC3339Nano formatted date and time for the candle end time, or last updated time if the candle is still open */
  lastUpdateInPeriod: Scalars['Timestamp'];
  /** Low price (uint64) */
  low: Scalars['String'];
  /** Total notional value of trades (uint64) */
  notional: Scalars['String'];
  /** Open price (uint64) */
  open: Scalars['String'];
  /** RFC3339Nano formatted date and time for the candle start time */
  periodStart: Scalars['Timestamp'];
  /** Volume price (uint64) */
  volume: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated candle information */
export type CandleDataConnection = {
  __typename?: 'CandleDataConnection';
  /** The candles */
  edges?: Maybe<Array<Maybe<CandleEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the candle and cursor information returned by a CandleDataConnection */
export type CandleEdge = {
  __typename?: 'CandleEdge';
  /** The cursor for the candle */
  cursor: Scalars['String'];
  /** The candle */
  node: Candle;
};

/** Condition describes the condition that must be validated by the data source engine */
export type Condition = {
  __typename?: 'Condition';
  /** The type of comparison to make on the value. */
  operator: ConditionOperator;
  /** The value to compare against. */
  value?: Maybe<Scalars['String']>;
};

/** Comparator describes the type of comparison. */
export enum ConditionOperator {
  /** Verify if the property values are strictly equal or not. */
  OPERATOR_EQUALS = 'OPERATOR_EQUALS',
  /** Verify if the data source data value is greater than the Condition value. */
  OPERATOR_GREATER_THAN = 'OPERATOR_GREATER_THAN',
  /**
   * Verify if the data source data value is greater than or equal to the Condition
   * value.
   */
  OPERATOR_GREATER_THAN_OR_EQUAL = 'OPERATOR_GREATER_THAN_OR_EQUAL',
  /**  Verify if the data source data value is less than the Condition value. */
  OPERATOR_LESS_THAN = 'OPERATOR_LESS_THAN',
  /**
   * Verify if the oracle data value is less or equal to than the Condition
   * value.
   */
  OPERATOR_LESS_THAN_OR_EQUAL = 'OPERATOR_LESS_THAN_OR_EQUAL'
}

/** A mode where Vega tries to execute orders as soon as they are received */
export type ContinuousTrading = {
  __typename?: 'ContinuousTrading';
  /** Size of an increment in price in terms of the quote currency */
  tickSize: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated core snapshot data */
export type CoreSnapshotConnection = {
  __typename?: 'CoreSnapshotConnection';
  /** The positions in this connection */
  edges?: Maybe<Array<CoreSnapshotEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** A snapshot taken by the core */
export type CoreSnapshotData = {
  __typename?: 'CoreSnapshotData';
  /** The block hash at the snapshot block height */
  blockHash: Scalars['String'];
  /** At which block the snapshot was taken */
  blockHeight: Scalars['String'];
  /** The current version of vega core */
  vegaCoreVersion: Scalars['String'];
};

/** Edge type containing the core snapshot cursor information */
export type CoreSnapshotEdge = {
  __typename?: 'CoreSnapshotEdge';
  /** Cursor identifying the core snapshot data */
  cursor: Scalars['String'];
  /** The core snapshot data */
  node: CoreSnapshotData;
};

/** Referral program information reported by data node with additional endedAt timestamp. */
export type CurrentReferralProgram = {
  __typename?: 'CurrentReferralProgram';
  /** Defined tiers in increasing order. First element will give Tier 1, second element will give Tier 2, etc. */
  benefitTiers: Array<BenefitTier>;
  /** Timestamp as RFC3339Nano, after which when the current epoch ends, the program will end and benefits will be disabled. */
  endOfProgramTimestamp: Scalars['Timestamp'];
  /** Timestamp as RFC3339Nano when the program ended. If present, the current program has ended and no program is currently running. */
  endedAt?: Maybe<Scalars['Timestamp']>;
  /** Unique ID generated from the proposal that created this program. */
  id: Scalars['ID'];
  /**
   * Defined staking tiers in increasing order. First element will give Tier 1,
   * second element will give Tier 2, and so on. Determines the level of
   * benefit a party can expect based on their staking.
   */
  stakingTiers: Array<StakingTier>;
  /** Incremental version of the program. It is incremented each time the referral program is edited. */
  version: Scalars['Int'];
  /** Number of epochs over which to evaluate a referral set's running volume. */
  windowLength: Scalars['Int'];
};

/** A data source contains the data sent by a data source */
export type Data = {
  __typename?: 'Data';
  /**
   * RFC3339Nano formatted date and time for when the data was broadcast to the markets
   * with a matching data spec.
   * It has no value when the source data does not match any data spec.
   */
  broadcastAt: Scalars['Timestamp'];
  /** properties contains all the properties sent by a data source */
  data?: Maybe<Array<Property>>;
  /**
   * List of all the data specs that matched this source data.
   * When the array is empty, it means no data spec matched this source data.
   */
  matchedSpecIds?: Maybe<Array<Scalars['ID']>>;
  metaData?: Maybe<Array<Maybe<Property>>>;
  /** signers is the list of public keys/ETH addresses that signed the data */
  signers?: Maybe<Array<Signer>>;
};

/**
 * DataSourceDefinition represents the top level object that deals with data sources.
 * DataSourceDefinition can be external or internal, with whatever number of data sources are defined
 * for each type in the child objects below.
 */
export type DataSourceDefinition = {
  __typename?: 'DataSourceDefinition';
  sourceType: DataSourceKind;
};

/**
 * DataSourceDefinitionExternal is the top level object used for all external data sources.
 * It contains one of any of the defined `SourceType` variants.
 */
export type DataSourceDefinitionExternal = {
  __typename?: 'DataSourceDefinitionExternal';
  sourceType: ExternalDataSourceKind;
};

/**
 * DataSourceDefinitionInternal is the top level object used for all internal data sources.
 * It contains one of any of the defined `SourceType` variants.
 */
export type DataSourceDefinitionInternal = {
  __typename?: 'DataSourceDefinitionInternal';
  sourceType: InternalDataSourceKind;
};

export type DataSourceKind = DataSourceDefinitionExternal | DataSourceDefinitionInternal;

/**
 * An data source specification describes the data source data that a product (or a risk model)
 * wants to get from the oracle engine.
 */
export type DataSourceSpec = {
  __typename?: 'DataSourceSpec';
  /** RFC3339Nano creation date time */
  createdAt: Scalars['Timestamp'];
  data: DataSourceDefinition;
  /** ID is a hash generated from the DataSourceSpec data. */
  id: Scalars['ID'];
  /** Status describes the status of the data source spec */
  status: DataSourceSpecStatus;
  /** RFC3339Nano last updated timestamp */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

/**
 * DataSourceSpecConfiguration describes the source data that an instrument wants to get from the
 * sourcing engine.
 */
export type DataSourceSpecConfiguration = {
  __typename?: 'DataSourceSpecConfiguration';
  /**
   * Filters describes which source data are considered of interest or not for
   * the product (or the risk model).
   */
  filters?: Maybe<Array<Filter>>;
  /**
   * Signers is the list of authorized signatures that signed the data for this
   * data source. All the public keys in the data should be contained in this
   * list.
   */
  signers?: Maybe<Array<Signer>>;
};

/** DataSourceSpecConfigurationTime is the internal data source used for emitting timestamps. */
export type DataSourceSpecConfigurationTime = {
  __typename?: 'DataSourceSpecConfigurationTime';
  conditions: Array<Maybe<Condition>>;
};

/** DataSourceSpecConfigurationTimeTrigger is the internal data source used for emitting timestamps automatically using predefined intervals and conditions */
export type DataSourceSpecConfigurationTimeTrigger = {
  __typename?: 'DataSourceSpecConfigurationTimeTrigger';
  conditions: Array<Maybe<Condition>>;
  triggers: Array<Maybe<InternalTimeTrigger>>;
};

/**
 * Bindings to describe which property of the data source data is to be used as settlement data
 * and which is to be used as the trading termination trigger.
 */
export type DataSourceSpecPerpetualBinding = {
  __typename?: 'DataSourceSpecPerpetualBinding';
  /**
   * Name of the property in the source data that should be used as settlement data.
   * For example, if it is set to "prices.BTC.value", then the perpetual market will use the value of this property
   * as settlement data.
   */
  settlementDataProperty: Scalars['String'];
  /**
   * Name of the property in the source data that should be used as settlement schedule.
   * For example, if it is set to "prices.BTC.timestamp", then the perpetual market will use the value of this property
   */
  settlementScheduleProperty: Scalars['String'];
};

/** Describes the status of the data spec */
export enum DataSourceSpecStatus {
  /** Describes an active data spec */
  STATUS_ACTIVE = 'STATUS_ACTIVE',
  /**
   * Describes a data spec that is not listening to data
   * anymore
   */
  STATUS_DEACTIVATED = 'STATUS_DEACTIVATED'
}

/**
 * DataSourceSpecToFutureBinding tells on which property data source data should be
 * used as settlement data and trading termination.
 */
export type DataSourceSpecToFutureBinding = {
  __typename?: 'DataSourceSpecToFutureBinding';
  settlementDataProperty: Scalars['String'];
  tradingTerminationProperty: Scalars['String'];
};

/**
 * Range of dates to retrieve information for.
 * If start and end are provided, data will be returned within the specified range (exclusive).
 * If start is provided without end, the end date will be the latest time available in the data set.
 * If end is provided without start, the start time will be the earliest time available in the data set.
 */
export type DateRange = {
  /** The end timestamp for the date range (exclusive). RFC3339Nano format */
  end?: InputMaybe<Scalars['Timestamp']>;
  /** The start timestamp for the date range (inclusive). RFC3339Nano format */
  start?: InputMaybe<Scalars['Timestamp']>;
};

export type Delegation = {
  __typename?: 'Delegation';
  /** Amount delegated */
  amount: Scalars['String'];
  /** Epoch of delegation */
  epoch: Scalars['Int'];
  /** URL of node you are delegating to */
  node: Node;
  /** Party that is delegating */
  party: Party;
};

/** Edge type containing the delegation and cursor information returned by a DelegationsConnection */
export type DelegationEdge = {
  __typename?: 'DelegationEdge';
  /** The cursor for the data item */
  cursor: Scalars['String'];
  /** The delegation information */
  node: Delegation;
};

/** Connection type for retrieving cursor-based paginated delegation information */
export type DelegationsConnection = {
  __typename?: 'DelegationsConnection';
  /** The delegation information available on this connection */
  edges?: Maybe<Array<Maybe<DelegationEdge>>>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** The details of a deposit processed by Vega */
export type Deposit = {
  __typename?: 'Deposit';
  /** The amount to be withdrawn */
  amount: Scalars['String'];
  /** The asset to be withdrawn */
  asset: Asset;
  /** RFC3339Nano time at which the deposit was created */
  createdTimestamp: Scalars['Timestamp'];
  /** RFC3339Nano time at which the deposit was finalised */
  creditedTimestamp?: Maybe<Scalars['Timestamp']>;
  /** The Vega internal ID of the deposit */
  id: Scalars['ID'];
  /** The Party initiating the deposit */
  party: Party;
  /** The current status of the deposit */
  status: DepositStatus;
  /** Hash of the transaction on the foreign chain */
  txHash?: Maybe<Scalars['String']>;
};

/** Edge type containing the deposit and cursor information returned by a DepositsConnection */
export type DepositEdge = {
  __typename?: 'DepositEdge';
  cursor: Scalars['String'];
  node: Deposit;
};

/** The status of a deposit */
export enum DepositStatus {
  /** The deposit have been cancelled by the network, either because it expired, or something went wrong with the foreign chain */
  STATUS_CANCELLED = 'STATUS_CANCELLED',
  /** The deposit was finalised, it was valid, the foreign chain has executed it and the network updated all accounts */
  STATUS_FINALIZED = 'STATUS_FINALIZED',
  /** The deposit is open and being processed by the network */
  STATUS_OPEN = 'STATUS_OPEN'
}

/** Connection type for retrieving cursor-based paginated deposits information */
export type DepositsConnection = {
  __typename?: 'DepositsConnection';
  /** The deposits */
  edges?: Maybe<Array<Maybe<DepositEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Frequent batch auctions trading mode */
export type DiscreteTrading = {
  __typename?: 'DiscreteTrading';
  /** Duration of the discrete trading batch in nanoseconds. Maximum 1 month. */
  duration: Scalars['Int'];
  /** Size of an increment in price in terms of the quote currency */
  tickSize: Scalars['String'];
};

/** The type of metric to use for a reward dispatch strategy */
export enum DispatchMetric {
  /** Dispatch metric that uses the time weighted position of the party in the market */
  DISPATCH_METRIC_AVERAGE_POSITION = 'DISPATCH_METRIC_AVERAGE_POSITION',
  /** Dispatch metric that uses the total LP fees received in the market */
  DISPATCH_METRIC_LP_FEES_RECEIVED = 'DISPATCH_METRIC_LP_FEES_RECEIVED',
  /** Dispatch metric that uses the total maker fees paid in the market */
  DISPATCH_METRIC_MAKER_FEES_PAID = 'DISPATCH_METRIC_MAKER_FEES_PAID',
  /** Dispatch metric that uses the total maker fees received in the market */
  DISPATCH_METRIC_MAKER_FEES_RECEIVED = 'DISPATCH_METRIC_MAKER_FEES_RECEIVED',
  /** Dispatch metric that uses the total value of the market if above the required threshold and not paid given proposer bonus yet */
  DISPATCH_METRIC_MARKET_VALUE = 'DISPATCH_METRIC_MARKET_VALUE',
  /** Dispatch metric that uses the relative PNL of the party in the market */
  DISPATCH_METRIC_RELATIVE_RETURN = 'DISPATCH_METRIC_RELATIVE_RETURN',
  /** Dispatch metric that uses return volatility of the party in the market */
  DISPATCH_METRIC_RETURN_VOLATILITY = 'DISPATCH_METRIC_RETURN_VOLATILITY',
  /** Dispatch metric that uses the validator ranking of the validator as metric */
  DISPATCH_METRIC_VALIDATOR_RANKING = 'DISPATCH_METRIC_VALIDATOR_RANKING'
}

/** Dispatch strategy for a recurring transfer */
export type DispatchStrategy = {
  __typename?: 'DispatchStrategy';
  /** Defines the data that will be used to compare markets so as to distribute rewards appropriately */
  dispatchMetric: DispatchMetric;
  /** The asset to use for measuring contribution to the metric */
  dispatchMetricAssetId: Scalars['ID'];
  /** Controls how the reward is distributed between qualifying parties */
  distributionStrategy: DistributionStrategy;
  /** The type of entities eligible for this strategy */
  entityScope: EntityScope;
  /** If entity scope is individuals then this defines the scope for individuals */
  individualScope?: Maybe<IndividualScope>;
  /** Number of epochs after distribution to delay vesting of rewards by */
  lockPeriod: Scalars['Int'];
  /** Scope the dispatch to this market only under the metric asset */
  marketIdsInScope?: Maybe<Array<Scalars['ID']>>;
  /** The proportion of the top performers in the team for a given metric to be averaged for the metric calculation if scope is team */
  nTopPerformers?: Maybe<Scalars['String']>;
  /** Minimum notional time-weighted averaged position required for a party to be considered eligible */
  notionalTimeWeightedAveragePositionRequirement: Scalars['String'];
  /** Ascending order list of start rank and corresponding share ratio */
  rankTable?: Maybe<RankTable>;
  /** Minimum number of governance tokens, e.g. VEGA, staked for a party to be considered eligible */
  stakingRequirement: Scalars['String'];
  /** The teams in scope for the reward, if the entity is teams */
  teamScope?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /** Number of epochs to evaluate the metric on */
  windowLength: Scalars['Int'];
};

export enum DistributionStrategy {
  /** Rewards funded using the pro-rata strategy should be distributed pro-rata by each entity's reward metric scaled by any active multipliers that party has */
  DISTRIBUTION_STRATEGY_PRO_RATA = 'DISTRIBUTION_STRATEGY_PRO_RATA',
  /** Rewards funded using the rank strategy */
  DISTRIBUTION_STRATEGY_RANK = 'DISTRIBUTION_STRATEGY_RANK'
}

/** An asset originated from an Ethereum ERC20 Token */
export type ERC20 = {
  __typename?: 'ERC20';
  /** The address of the ERC20 contract */
  contractAddress: Scalars['String'];
  /**
   * The lifetime limits deposit per address
   * Note: this is a temporary measure that can be changed by governance
   */
  lifetimeLimit: Scalars['String'];
  /**
   * The maximum you can withdraw instantly. All withdrawals over the threshold will be delayed by the withdrawal delay.
   * There is no limit on the size of a withdrawal
   * Note: this is a temporary measure that can be changed by governance
   */
  withdrawThreshold: Scalars['String'];
};

export type ERC20MultiSigSignerAddedBundle = {
  __typename?: 'ERC20MultiSigSignerAddedBundle';
  /** The epoch in which the validator was added */
  epochSeq: Scalars['String'];
  /** The ethereum address of the signer to be added */
  newSigner: Scalars['String'];
  /** The nonce used in the signing operation */
  nonce: Scalars['String'];
  /** The bundle of signatures from current validators to sign in the new signer */
  signatures: Scalars['String'];
  /** The ethereum address of the submitter */
  submitter: Scalars['String'];
  /** Unix-nano timestamp for when the validator was added */
  timestamp: Scalars['String'];
};

export type ERC20MultiSigSignerAddedBundleEdge = {
  __typename?: 'ERC20MultiSigSignerAddedBundleEdge';
  cursor: Scalars['String'];
  node: ERC20MultiSigSignerAddedBundle;
};

/** Response for the signature bundle to add a particular validator to the signer list of the multisig contract */
export type ERC20MultiSigSignerAddedConnection = {
  __typename?: 'ERC20MultiSigSignerAddedConnection';
  edges?: Maybe<Array<Maybe<ERC20MultiSigSignerAddedBundleEdge>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type ERC20MultiSigSignerRemovedBundle = {
  __typename?: 'ERC20MultiSigSignerRemovedBundle';
  /** The epoch in which the validator was removed */
  epochSeq: Scalars['String'];
  /** The nonce used in the signing operation */
  nonce: Scalars['String'];
  /** The ethereum address of the signer to be removed */
  oldSigner: Scalars['String'];
  /** The bundle of signatures from current validators to sign in the new signer */
  signatures: Scalars['String'];
  /** The ethereum address of the submitter */
  submitter: Scalars['String'];
  /** Unix-nano timestamp for when the validator was added */
  timestamp: Scalars['String'];
};

export type ERC20MultiSigSignerRemovedBundleEdge = {
  __typename?: 'ERC20MultiSigSignerRemovedBundleEdge';
  cursor: Scalars['String'];
  node: ERC20MultiSigSignerRemovedBundle;
};

/** Response for the signature bundle to remove a particular validator from the signer list of the multisig contract */
export type ERC20MultiSigSignerRemovedConnection = {
  __typename?: 'ERC20MultiSigSignerRemovedConnection';
  /** The list of signer bundles for that validator */
  edges?: Maybe<Array<Maybe<ERC20MultiSigSignerRemovedBundleEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Response for the signature bundle to update the token limits (maxLifetimeDeposit and withdrawThreshold) for a given ERC20 token (already allowlisted) in the collateral bridge */
export type ERC20SetAssetLimitsBundle = {
  __typename?: 'ERC20SetAssetLimitsBundle';
  /** The address of the asset on ethereum */
  assetSource: Scalars['String'];
  /** The lifetime limit deposit for this asset */
  lifetimeLimit: Scalars['String'];
  /** The nonce, which is actually the internal reference for the proposal */
  nonce: Scalars['String'];
  /**
   * The signatures bundle as hex encoded data, forward by 0x
   * e.g: 0x + sig1 + sig2 + ... + sixN
   */
  signatures: Scalars['String'];
  /** The threshold withdraw for this asset */
  threshold: Scalars['String'];
  /** The ID of the vega asset */
  vegaAssetId: Scalars['String'];
};

export type ETHAddress = {
  __typename?: 'ETHAddress';
  address?: Maybe<Scalars['String']>;
};

/** List of all entities created by transaction hash */
export type Entities = {
  __typename?: 'Entities';
  /** List of accounts created by the transaction hash */
  accounts?: Maybe<Array<Maybe<AccountEvent>>>;
  /** List of assets created by the transaction hash */
  assets?: Maybe<Array<Maybe<Asset>>>;
  /** List of balance changes created by the transaction hash */
  balanceChanges?: Maybe<Array<Maybe<AccountBalance>>>;
  /** List of delegations created by the transaction hash */
  delegations?: Maybe<Array<Maybe<Delegation>>>;
  /** List of deposits created by the transaction hash */
  deposits?: Maybe<Array<Maybe<Deposit>>>;
  /** List of ERC-20 multisig signer added bundles created by the transaction hash */
  erc20MultiSigSignerAddedBundles?: Maybe<Array<Maybe<ERC20MultiSigSignerAddedBundle>>>;
  /** List of ERC-20 multisig signer removed bundles created by the transaction hash */
  erc20MultiSigSignerRemovedBundles?: Maybe<Array<Maybe<ERC20MultiSigSignerRemovedBundle>>>;
  /** List of ethereum key rotations created by the transaction hash */
  ethereumKeyRotations?: Maybe<Array<Maybe<EthereumKeyRotation>>>;
  /** List of key rotations created by the transaction hash */
  keyRotations?: Maybe<Array<Maybe<KeyRotation>>>;
  /** List of ledger entries created by the transaction hash */
  ledgerEntries?: Maybe<Array<Maybe<LedgerEntry>>>;
  /** List of liquidity provisions created by the transaction hash */
  liquidityProvisions?: Maybe<Array<Maybe<LiquidityProvision>>>;
  /** List of margin levels created by the transaction hash */
  marginLevels?: Maybe<Array<Maybe<MarginLevels>>>;
  /** List of markets created by the transaction hash */
  markets?: Maybe<Array<Maybe<Market>>>;
  /** List of network parameters created by the transaction hash */
  networkParameters?: Maybe<Array<Maybe<NetworkParameter>>>;
  /** List of node signatures created by the transaction hash */
  nodeSignatures?: Maybe<Array<Maybe<NodeSignature>>>;
  /** List of nodes created by the transaction hash */
  nodes?: Maybe<Array<Maybe<NodeBasic>>>;
  /** List of oracle data created by the transaction hash */
  oracleData?: Maybe<Array<Maybe<OracleData>>>;
  /** List of oracle specs created by the transaction hash */
  oracleSpecs?: Maybe<Array<Maybe<OracleSpec>>>;
  /** List of orders created by the transaction hash */
  orders?: Maybe<Array<Maybe<Order>>>;
  /** List of parties created by the transaction hash */
  parties?: Maybe<Array<Maybe<Party>>>;
  /** List of positions created by the transaction hash */
  positions?: Maybe<Array<Maybe<Position>>>;
  /** List of proposals created by the transaction hash */
  proposals?: Maybe<Array<Maybe<ProposalDetail>>>;
  /** List of protocol upgrade proposals created by the transaction hash */
  protocolUpgradeProposals?: Maybe<Array<Maybe<ProtocolUpgradeProposal>>>;
  /** List of rewards created by the transaction hash */
  rewards?: Maybe<Array<Maybe<Reward>>>;
  /** List of trades created by the transaction hash */
  trades?: Maybe<Array<Maybe<Trade>>>;
  /** List of transfers created by the transaction hash */
  transfers?: Maybe<Array<Maybe<Transfer>>>;
  /** List of votes created by the transaction hash */
  votes?: Maybe<Array<Maybe<Vote>>>;
  /** List of withdrawals created by the transaction hash */
  withdrawals?: Maybe<Array<Maybe<Withdrawal>>>;
};

export enum EntityScope {
  /** Rewards must be distributed directly to eligible parties */
  ENTITY_SCOPE_INDIVIDUALS = 'ENTITY_SCOPE_INDIVIDUALS',
  /** Rewards must be distributed directly to eligible teams, and then amongst team members */
  ENTITY_SCOPE_TEAMS = 'ENTITY_SCOPE_TEAMS'
}

/** Epoch describes a specific period of time in the Vega network */
export type Epoch = {
  __typename?: 'Epoch';
  /** Delegations data for this epoch */
  delegationsConnection?: Maybe<DelegationsConnection>;
  /** Numeric sequence number used to identify the epoch */
  id: Scalars['ID'];
  /** Timestamps for start and end of epochs */
  timestamps: EpochTimestamps;
  /** Validators that participated in this epoch */
  validatorsConnection?: Maybe<NodesConnection>;
};


/** Epoch describes a specific period of time in the Vega network */
export type EpochdelegationsConnectionArgs = {
  nodeId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Epoch describes a specific period of time in the Vega network */
export type EpochvalidatorsConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};

/** Summary of all epochs for a node */
export type EpochData = {
  __typename?: 'EpochData';
  /** Total number of offline epochs since node was created */
  offline: Scalars['Int'];
  /** Total number of online epochs since node was created */
  online: Scalars['Int'];
  /** Total number of epochs since node was created */
  total: Scalars['Int'];
};

/** Summary of a node's rewards for a given epoch */
export type EpochParticipation = {
  __typename?: 'EpochParticipation';
  epoch?: Maybe<Epoch>;
  /** RFC3339 timestamp */
  offline?: Maybe<Scalars['Timestamp']>;
  /** RFC3339 timestamp */
  online?: Maybe<Scalars['Timestamp']>;
  /** Total amount rewarded for participation in the given epoch */
  totalRewards?: Maybe<Scalars['Float']>;
};

/** an aggregated reward summary for a combination of epoch/asset/market/reward type */
export type EpochRewardSummary = {
  __typename?: 'EpochRewardSummary';
  /** Total quantity of rewards awarded in this asset/market/reward type in this epoch */
  amount: Scalars['String'];
  /** ID of the Asset */
  assetId: Scalars['ID'];
  /** The epoch for which summary is generated */
  epoch: Scalars['Int'];
  /** ID of the market */
  marketId?: Maybe<Scalars['ID']>;
  /** Type of the reward */
  rewardType: AccountType;
};

export type EpochRewardSummaryConnection = {
  __typename?: 'EpochRewardSummaryConnection';
  edges?: Maybe<Array<Maybe<EpochRewardSummaryEdge>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type EpochRewardSummaryEdge = {
  __typename?: 'EpochRewardSummaryEdge';
  cursor: Scalars['String'];
  node: EpochRewardSummary;
};

/** Describes in both human readable and block time when an epoch spans. */
export type EpochTimestamps = {
  __typename?: 'EpochTimestamps';
  /** RFC3339 timestamp - Vega time of epoch end, null if not ended */
  end?: Maybe<Scalars['Timestamp']>;
  /** RFC3339 timestamp - Vega time of epoch expiry */
  expiry?: Maybe<Scalars['Timestamp']>;
  /** Height of first block in the epoch, null if not started */
  firstBlock: Scalars['String'];
  /** Height of last block in the epoch, null if not ended */
  lastBlock?: Maybe<Scalars['String']>;
  /** RFC3339 timestamp - Vega time of epoch start, null if not started */
  start?: Maybe<Scalars['Timestamp']>;
};

/** Response for the signature bundle to allowlist an ERC20 token in the collateral bridge */
export type Erc20ListAssetBundle = {
  __typename?: 'Erc20ListAssetBundle';
  /** The source asset in the ethereum network */
  assetSource: Scalars['String'];
  /** The nonce to be used in the request */
  nonce: Scalars['String'];
  /**
   * Signature aggregate from the nodes, in the following format:
   * 0x + sig1 + sig2 + ... + sigN
   */
  signatures: Scalars['String'];
  /** The ID of the vega asset */
  vegaAssetId: Scalars['String'];
};

/** All the data related to the approval of a withdrawal from the network */
export type Erc20WithdrawalApproval = {
  __typename?: 'Erc20WithdrawalApproval';
  /** The amount to be withdrawn */
  amount: Scalars['String'];
  /** The source asset in the ethereum network */
  assetSource: Scalars['String'];
  /** RFC3339Nano timestamp at which the withdrawal was created */
  creation: Scalars['String'];
  /** The nonce to be used in the request */
  nonce: Scalars['String'];
  /**
   * Signature aggregate from the nodes, in the following format:
   * 0x + sig1 + sig2 + ... + sigN
   */
  signatures: Scalars['String'];
  /** The target address that will receive the funds */
  targetAddress: Scalars['String'];
};

/** Specific details for an erc20 withdrawal */
export type Erc20WithdrawalDetails = {
  __typename?: 'Erc20WithdrawalDetails';
  /** The ethereum address of the receiver of the asset funds */
  receiverAddress: Scalars['String'];
};

/**
 * Specifies a data source that derives its content from calling a read method
 * on an Ethereum contract.
 */
export type EthCallSpec = {
  __typename?: 'EthCallSpec';
  /** The ABI of that contract. */
  abi?: Maybe<Array<Scalars['String']>>;
  /** Ethereum address of the contract to call. */
  address: Scalars['String'];
  /**
   * List of arguments to pass to method call.
   * Protobuf 'Value' wraps an arbitrary JSON type that is mapped to an Ethereum
   * type according to the ABI.
   */
  args?: Maybe<Array<Scalars['String']>>;
  /** Filters the data returned from the contract method. */
  filters?: Maybe<Array<Filter>>;
  /** Name of the method on the contract to call. */
  method: Scalars['String'];
  /**
   * Normalisers are used to convert the data returned from the contract method
   * into a standard format.
   */
  normalisers?: Maybe<Array<Normaliser>>;
  /** Number of confirmations required before the query is considered verified. */
  requiredConfirmations: Scalars['Int'];
  /** Conditions for determining when to call the contract method. */
  trigger: EthCallTrigger;
};

/** EthCallTrigger is the type of trigger used to make calls to Ethereum network. */
export type EthCallTrigger = {
  __typename?: 'EthCallTrigger';
  trigger: TriggerKind;
};

/**
 * Trigger for an Ethereum call based on the Ethereum block timestamp. Can be
 * one-off or repeating.
 */
export type EthTimeTrigger = {
  __typename?: 'EthTimeTrigger';
  /**
   * Repeat the call every n seconds after the initial call. If no time for
   * initial call was specified, begin repeating immediately.
   */
  every?: Maybe<Scalars['Int']>;
  /** Trigger when the Ethereum time is greater or equal to this time, in Unix seconds. */
  initial?: Maybe<Scalars['Timestamp']>;
  /**
   * If repeating, stop once Ethereum time is greater than this time, in Unix
   * seconds. If not set, then repeat indefinitely.
   */
  until?: Maybe<Scalars['Timestamp']>;
};

/** An Ethereum data source */
export type EthereumEvent = {
  __typename?: 'EthereumEvent';
  /** The ID of the ethereum contract to use (string) */
  contractId: Scalars['ID'];
  /** Name of the Ethereum event to listen to. (string) */
  event: Scalars['String'];
};

/** Describes the ethereum key rotations of nodes on the vega network */
export type EthereumKeyRotation = {
  __typename?: 'EthereumKeyRotation';
  /** Block height when the rotation took place */
  blockHeight: Scalars['String'];
  /** New ethereum address */
  newAddress: Scalars['String'];
  /** ID of node where rotation took place */
  nodeId: Scalars['ID'];
  /** Old ethereum address */
  oldAddress: Scalars['String'];
};

/** An Ethereum key rotation record that is returned in a paginated Ethereum key rotation connection */
export type EthereumKeyRotationEdge = {
  __typename?: 'EthereumKeyRotationEdge';
  cursor?: Maybe<Scalars['String']>;
  node: EthereumKeyRotation;
};

/** A paginated type for returning Ethereum key rotation records */
export type EthereumKeyRotationsConnection = {
  __typename?: 'EthereumKeyRotationsConnection';
  /** The ethereum key rotations in this connection */
  edges: Array<EthereumKeyRotationEdge>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Union type for wrapped events in stream PROPOSAL is mapped to governance data, something to keep in mind */
export type Event = Deposit | TimeUpdate | TransactionResult | Withdrawal;

export type ExternalData = {
  __typename?: 'ExternalData';
  data: Data;
};

export type ExternalDataSourceKind = DataSourceSpecConfiguration | EthCallSpec;

/**
 * externalDataSourceSpec is the type that wraps the DataSourceSpec type in order to be further used/extended
 * by the OracleSpec
 */
export type ExternalDataSourceSpec = {
  __typename?: 'ExternalDataSourceSpec';
  spec: DataSourceSpec;
};

/** An estimate of the fee to be paid for the order */
export type FeeEstimate = {
  __typename?: 'FeeEstimate';
  /** The estimated fees if the order was to trade */
  fees: TradeFee;
  /** The total estimated amount of fees if the order was to trade */
  totalFeeAmount: Scalars['String'];
};

/** The factors applied to calculate the fees */
export type FeeFactors = {
  __typename?: 'FeeFactors';
  /** The factor applied to calculate InfrastructureFees, a non-negative float */
  infrastructureFee: Scalars['String'];
  /** The factor applied to calculate LiquidityFees, a non-negative float */
  liquidityFee: Scalars['String'];
  /** The factor applied to calculate MakerFees, a non-negative float */
  makerFee: Scalars['String'];
};

/** The fees applicable to a market */
export type Fees = {
  __typename?: 'Fees';
  /** The factors used to calculate the different fees */
  factors: FeeFactors;
};

/** Fees that have been applied on a specific market/asset up to the given epoch. */
export type FeesStats = {
  __typename?: 'FeesStats';
  /** The settlement asset of the market. */
  assetId: Scalars['String'];
  /** The epoch for which these stats were valid. */
  epoch: Scalars['Int'];
  /** The market the fees were paid in */
  marketId: Scalars['String'];
  /** The total referral discounts applied to all referee taker fees */
  refereesDiscountApplied: Array<PartyAmount>;
  /** The total referral rewards generated by all referee taker fees. */
  referrerRewardsGenerated: Array<ReferrerRewardsGenerated>;
  /** The total referral rewards paid to the referrer of the referral set. */
  totalRewardsPaid: Array<PartyAmount>;
  /** The total volume discounts applied to all referee taker fees */
  volumeDiscountApplied: Array<PartyAmount>;
};

/**
 * Filter describes the conditions under which oracle data is considered of
 * interest or not.
 */
export type Filter = {
  __typename?: 'Filter';
  /**
   * The conditions that should be matched by the data to be
   * considered of interest.
   */
  conditions?: Maybe<Array<Condition>>;
  /** key is the data source data property key targeted by the filter. */
  key: PropertyKey;
};

/** The funding payment from a perpetual market. */
export type FundingPayment = {
  __typename?: 'FundingPayment';
  /** Amount transferred */
  amount?: Maybe<Scalars['String']>;
  /** Sequence number of the funding period the funding payment belongs to. */
  fundingPeriodSeq: Scalars['Int'];
  /** Market the funding payment applies to. */
  marketId: Scalars['ID'];
  /** Party the funding payment applies to. */
  partyId: Scalars['ID'];
  /** RFC3339Nano timestamp when the data point was received. */
  timestamp: Scalars['Timestamp'];
};

/** Connection type for funding payment */
export type FundingPaymentConnection = {
  __typename?: 'FundingPaymentConnection';
  /** List of funding payments */
  edges: Array<FundingPaymentEdge>;
  /** Pagination information */
  pageInfo: PageInfo;
};

/** Edge type for funding payment */
export type FundingPaymentEdge = {
  __typename?: 'FundingPaymentEdge';
  /** Cursor identifying the funding payment */
  cursor: Scalars['String'];
  /** The funding payment */
  node: FundingPayment;
};

/** Details of a funding interval for a perpetual market. */
export type FundingPeriod = {
  __typename?: 'FundingPeriod';
  /** RFC3339Nano time when the funding period ended. */
  endTime?: Maybe<Scalars['Timestamp']>;
  /** Time-weighted average price calculated from data points for this period from the external data source. */
  externalTwap?: Maybe<Scalars['String']>;
  /** Funding payment for this period as the difference between the time-weighted average price of the external and internal data point. */
  fundingPayment?: Maybe<Scalars['String']>;
  /** Percentage difference between the time-weighted average price of the external and internal data point. */
  fundingRate?: Maybe<Scalars['String']>;
  /** Time-weighted average price calculated from data points for this period from the internal data source. */
  internalTwap?: Maybe<Scalars['String']>;
  /** Market the funding period relates to. */
  marketId: Scalars['ID'];
  /** Sequence number of the funding period. */
  seq: Scalars['Int'];
  /** RFC3339Nano time when the funding period started. */
  startTime: Scalars['Timestamp'];
};

/** Connection type for retrieving cursor-based paginated funding period data for perpetual markets */
export type FundingPeriodConnection = {
  __typename?: 'FundingPeriodConnection';
  /** The funding periods in this connection */
  edges: Array<FundingPeriodEdge>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Data point for a funding period. */
export type FundingPeriodDataPoint = {
  __typename?: 'FundingPeriodDataPoint';
  /** Source of the data point. */
  dataPointSource?: Maybe<FundingPeriodDataPointSource>;
  /** Market the data point applies to. */
  marketId: Scalars['ID'];
  /** Price of the asset as seen by this data point. */
  price: Scalars['String'];
  /** Sequence number of the funding period the data point belongs to. */
  seq: Scalars['Int'];
  /** RFC3339Nano timestamp when the data point was received. */
  timestamp: Scalars['Timestamp'];
  /** Time-weighted average price calculated from data points for this period from the data source. */
  twap?: Maybe<Scalars['String']>;
};

/** Connection type for funding period data points */
export type FundingPeriodDataPointConnection = {
  __typename?: 'FundingPeriodDataPointConnection';
  /** List of funding period data points */
  edges: Array<FundingPeriodDataPointEdge>;
  /** Pagination information */
  pageInfo: PageInfo;
};

/** Edge type for funding period data point */
export type FundingPeriodDataPointEdge = {
  __typename?: 'FundingPeriodDataPointEdge';
  /** Cursor identifying the funding period data point */
  cursor: Scalars['String'];
  /** The funding period data point */
  node: FundingPeriodDataPoint;
};

/** Sources of funding period data points. */
export enum FundingPeriodDataPointSource {
  /** Funding period data point was sourced from an external data source. */
  SOURCE_EXTERNAL = 'SOURCE_EXTERNAL',
  /** Funding period data point was generated internally by the network. */
  SOURCE_INTERNAL = 'SOURCE_INTERNAL'
}

/** Edge type containing a funding period cursor and its associated funding period data */
export type FundingPeriodEdge = {
  __typename?: 'FundingPeriodEdge';
  /** Cursor identifying the funding period data */
  cursor: Scalars['String'];
  /** The funding period data */
  node: FundingPeriod;
};

/** A Future product */
export type Future = {
  __typename?: 'Future';
  /** The binding between the data source specification and the settlement data */
  dataSourceSpecBinding: DataSourceSpecToFutureBinding;
  /** The data source specification that describes the data of interest for settlement. */
  dataSourceSpecForSettlementData: DataSourceSpec;
  /** The data source specification that describes the data-source data of interest for trading termination. */
  dataSourceSpecForTradingTermination: DataSourceSpec;
  /** String representing the quote (e.g. BTCUSD -> USD is quote) */
  quoteName: Scalars['String'];
  /** The name of the asset (string) */
  settlementAsset: Asset;
};

export type FutureProduct = {
  __typename?: 'FutureProduct';
  /**
   * DataSourceSpecToFutureBinding tells on which property source data should be
   * used as settlement data.
   */
  dataSourceSpecBinding: DataSourceSpecToFutureBinding;
  /** Describes the data source data that an instrument wants to get from the data source engine for settlement data. */
  dataSourceSpecForSettlementData: DataSourceDefinition;
  /** Describes the source data that an instrument wants to get from the data source engine for trading termination. */
  dataSourceSpecForTradingTermination: DataSourceDefinition;
  /** String representing the quote (e.g. BTCUSD -> USD is quote) */
  quoteName: Scalars['String'];
  /** Product asset */
  settlementAsset: Asset;
};

export type GovernanceTransferKind = OneOffGovernanceTransfer | RecurringGovernanceTransfer;

export enum GovernanceTransferType {
  /** Transfers the specified amount or does not transfer anything */
  GOVERNANCE_TRANSFER_TYPE_ALL_OR_NOTHING = 'GOVERNANCE_TRANSFER_TYPE_ALL_OR_NOTHING',
  /** Transfers the specified amount or the max allowable amount if this is less than the specified amount */
  GOVERNANCE_TRANSFER_TYPE_BEST_EFFORT = 'GOVERNANCE_TRANSFER_TYPE_BEST_EFFORT',
  /** Default value, always invalid */
  GOVERNANCE_TRANSFER_TYPE_UNSPECIFIED = 'GOVERNANCE_TRANSFER_TYPE_UNSPECIFIED'
}

/** A segment of data node history */
export type HistorySegment = {
  __typename?: 'HistorySegment';
  /** From block height of the history segment */
  fromHeight: Scalars['Int'];
  /** ID of the history segment */
  historySegmentId: Scalars['String'];
  /** To block height of the history segment */
  toHeight: Scalars['Int'];
};

/** Details of the iceberg order */
export type IcebergOrder = {
  __typename?: 'IcebergOrder';
  /** If the visible size of the order falls below this value, it will be replenished back to the peak size using the reserved amount */
  minimumVisibleSize: Scalars['String'];
  /** Size of the order that will be made visible if the iceberg order is replenished after trading */
  peakSize: Scalars['String'];
  /** Size of the order that is reserved and used to restore the iceberg's peak when it is refreshed */
  reservedRemaining: Scalars['String'];
};

export enum IndividualScope {
  /** All parties on the network are within the scope of this reward */
  INDIVIDUAL_SCOPE_ALL = 'INDIVIDUAL_SCOPE_ALL',
  /** All parties that are part of a team are within the scope of this reward */
  INDIVIDUAL_SCOPE_IN_TEAM = 'INDIVIDUAL_SCOPE_IN_TEAM',
  /** All parties that are not part of a team are within the scope of this reward */
  INDIVIDUAL_SCOPE_NOT_IN_TEAM = 'INDIVIDUAL_SCOPE_NOT_IN_TEAM'
}

/** Describes something that can be traded on Vega */
export type Instrument = {
  __typename?: 'Instrument';
  /** A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string) */
  code: Scalars['String'];
  /** Uniquely identifies an instrument across all instruments available on Vega (string) */
  id: Scalars['ID'];
  /** Metadata for this instrument */
  metadata: InstrumentMetadata;
  /** Full and fairly descriptive name for the instrument */
  name: Scalars['String'];
  /** A reference to or instance of a fully specified product, including all required product parameters for that product (Product union) */
  product: Product;
};

export type InstrumentConfiguration = {
  __typename?: 'InstrumentConfiguration';
  /** A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) */
  code: Scalars['String'];
  /** Future product specification */
  futureProduct?: Maybe<FutureProduct>;
  /** Full and fairly descriptive name for the instrument */
  name: Scalars['String'];
  /** Product specification */
  product?: Maybe<ProductConfiguration>;
};

/** A set of metadata to associate to an instrument */
export type InstrumentMetadata = {
  __typename?: 'InstrumentMetadata';
  /** An arbitrary list of tags to associated to associate to the Instrument (string list) */
  tags?: Maybe<Array<Scalars['String']>>;
};

export type InternalDataSourceKind = DataSourceSpecConfigurationTime | DataSourceSpecConfigurationTimeTrigger;

/** Trigger for an internal time data source */
export type InternalTimeTrigger = {
  __typename?: 'InternalTimeTrigger';
  /**
   * Repeat the trigger every n seconds after the initial. If no time for initial was specified,
   * begin repeating immediately
   */
  every?: Maybe<Scalars['Int']>;
  /** Trigger when the vega time is greater or equal to this time, in Unix seconds */
  initial?: Maybe<Scalars['Int']>;
};

/** The interval for trade candles when subscribing via Vega GraphQL, default is I15M */
export enum Interval {
  /** The block interval is not a fixed amount of time, rather it used to indicate grouping of events that occur in a single block. It is usually about a second. */
  INTERVAL_BLOCK = 'INTERVAL_BLOCK',
  /** 1 day interval */
  INTERVAL_I1D = 'INTERVAL_I1D',
  /** 1 hour interval */
  INTERVAL_I1H = 'INTERVAL_I1H',
  /** 1 minute interval */
  INTERVAL_I1M = 'INTERVAL_I1M',
  /** 5 minute interval */
  INTERVAL_I5M = 'INTERVAL_I5M',
  /** 6 hour interval */
  INTERVAL_I6H = 'INTERVAL_I6H',
  /** 15 minute interval (default) */
  INTERVAL_I15M = 'INTERVAL_I15M'
}

/** A node's key rotation event */
export type KeyRotation = {
  __typename?: 'KeyRotation';
  /** Block height when the rotation took place */
  blockHeight: Scalars['String'];
  /** New public key rotated to */
  newPubKey: Scalars['String'];
  /** ID of node where rotation took place */
  nodeId: Scalars['ID'];
  /** Old public key rotated from */
  oldPubKey: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated key rotation information */
export type KeyRotationConnection = {
  __typename?: 'KeyRotationConnection';
  /** List of key rotations available for the connection */
  edges?: Maybe<Array<Maybe<KeyRotationEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/** Edge type containing the key rotation and cursor information returned by a KeyRotationConnection */
export type KeyRotationEdge = {
  __typename?: 'KeyRotationEdge';
  /** Cursor identifying the key rotation */
  cursor: Scalars['String'];
  /** The key rotation */
  node: KeyRotation;
};

export type LedgerEntry = {
  __typename?: 'LedgerEntry';
  /** The amount transferred */
  amount: Scalars['String'];
  /** Sender account balance after the transfer */
  fromAccountBalance: Scalars['String'];
  /** Account from which the asset was taken */
  fromAccountId: AccountDetails;
  /** RFC3339Nano time at which the transfer was made */
  timestamp: Scalars['Timestamp'];
  /** Receiver account balance after the transfer */
  toAccountBalance: Scalars['String'];
  /** Account to which the balance was transferred */
  toAccountId: AccountDetails;
  /** Type of ledger entry */
  type: TransferType;
};

/** Type of transfer between accounts */
export enum LedgerEntryField {
  TransferType = 'TransferType'
}

/** Filter for historical entry ledger queries */
export type LedgerEntryFilter = {
  CloseOnAccountFilters?: InputMaybe<Scalars['Boolean']>;
  FromAccountFilter?: InputMaybe<AccountFilter>;
  ToAccountFilter?: InputMaybe<AccountFilter>;
  TransferTypes?: InputMaybe<Array<InputMaybe<TransferType>>>;
};

/** Liquidation estimate for both worst and best case possible */
export type LiquidationEstimate = {
  __typename?: 'LiquidationEstimate';
  /** Liquidation price estimate assuming no slippage */
  bestCase: LiquidationPrice;
  /** Liquidation price estimate assuming slippage cap is applied */
  worstCase: LiquidationPrice;
};

/** Liquidation price estimate for either only the current open volume and position given some or all buy orders get filled, or position given some or all sell orders get filled */
export type LiquidationPrice = {
  __typename?: 'LiquidationPrice';
  /** Liquidation price assuming buy orders start getting filled */
  including_buy_orders: Scalars['String'];
  /** Liquidation price assuming sell orders start getting filled */
  including_sell_orders: Scalars['String'];
  /** Liquidation price for current open volume ignoring any active orders */
  open_volume_only: Scalars['String'];
};

/** Configuration of a market liquidity monitoring parameters */
export type LiquidityMonitoringParameters = {
  __typename?: 'LiquidityMonitoringParameters';
  /** Specifies by how many seconds an auction should be extended if leaving the auction were to trigger a liquidity auction */
  auctionExtensionSecs: Scalars['Int'];
  /** Specifies parameters related to target stake calculation */
  targetStakeParameters: TargetStakeParameters;
  /** Specifies the triggering ratio for entering liquidity auction */
  triggeringRatio: Scalars['String'];
};

/** A special order type for liquidity providers */
export type LiquidityOrder = {
  __typename?: 'LiquidityOrder';
  /** Offset from the pegged reference */
  offset: Scalars['String'];
  /** The proportion of the commitment allocated to this order */
  proportion: Scalars['Int'];
  /** The value to which this order is tied */
  reference: PeggedReference;
};

export type LiquidityOrderReference = {
  __typename?: 'LiquidityOrderReference';
  /** The liquidity order */
  liquidityOrder: LiquidityOrder;
  /** The pegged order generated to fulfill this commitment */
  order?: Maybe<Order>;
};

/** Information about a liquidity provider */
export type LiquidityProvider = {
  __typename?: 'LiquidityProvider';
  /** Information used for calculating an LP's fee share, such as the equity like share, average entry valuation and liquidity score, for the given liquidity provider and market */
  feeShare?: Maybe<LiquidityProviderFeeShare>;
  /** Market ID the liquidity provision is for */
  marketId: Scalars['ID'];
  /** Party ID of the liquidity provider */
  partyId: Scalars['ID'];
  /** SLA performance statistics */
  sla?: Maybe<LiquidityProviderSLA>;
};

/** Connection type for retrieving cursor-based paginated liquidity provider information */
export type LiquidityProviderConnection = {
  __typename?: 'LiquidityProviderConnection';
  /** Page of liquidity provider edges for the connection */
  edges: Array<LiquidityProviderEdge>;
  /** Current page information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the liquidity provider and cursor information */
export type LiquidityProviderEdge = {
  __typename?: 'LiquidityProviderEdge';
  /** Cursor for the liquidity provider */
  cursor: Scalars['String'];
  /** Liquidity provider's information */
  node: LiquidityProvider;
};

/** The equity like share of liquidity fee for each liquidity provider */
export type LiquidityProviderFeeShare = {
  __typename?: 'LiquidityProviderFeeShare';
  /** The average entry valuation of the liquidity provider for the market */
  averageEntryValuation: Scalars['String'];
  /** The average liquidity score */
  averageScore: Scalars['String'];
  /** The share owned by this liquidity provider */
  equityLikeShare: Scalars['String'];
  /** The liquidity provider party ID */
  party: Party;
  /** The virtual stake for this liquidity provider */
  virtualStake: Scalars['String'];
};

/** The SLA statistics for each liquidity provider */
export type LiquidityProviderSLA = {
  __typename?: 'LiquidityProviderSLA';
  /** Indicates how often LP meets the commitment during the current epoch. */
  currentEpochFractionOfTimeOnBook: Scalars['String'];
  /** Determines how the fee penalties from past epochs affect future fee revenue. */
  hysteresisPeriodFeePenalties?: Maybe<Array<Scalars['String']>>;
  /** Indicates the bond penalty amount applied in the previous epoch. */
  lastEpochBondPenalty: Scalars['String'];
  /** Indicates the fee penalty amount applied in the previous epoch. */
  lastEpochFeePenalty: Scalars['String'];
  /** Indicates how often LP met the commitment in the previous epoch. */
  lastEpochFractionOfTimeOnBook: Scalars['String'];
  /** Notional volume of orders within the range provided on the buy side of the book. */
  notionalVolumeBuys: Scalars['String'];
  /** Notional volume of orders within the range provided on the sell side of the book. */
  notionalVolumeSells: Scalars['String'];
  /** The liquidity provider party ID */
  party: Party;
  /** Represents the total amount of funds LP must supply. The amount to be supplied is in the market’s settlement currency, spread on both buy and sell sides of the order book within a defined range. */
  requiredLiquidity: Scalars['String'];
};

/** The command to be sent to the chain for a liquidity provision submission */
export type LiquidityProvision = {
  __typename?: 'LiquidityProvision';
  /** A set of liquidity buy orders to meet the liquidity provision obligation. */
  buys: Array<LiquidityOrderReference>;
  /** Specified as a unit-less number that represents the amount of settlement asset of the market. */
  commitmentAmount: Scalars['String'];
  /** RFC3339Nano time when the liquidity provision was initially created */
  createdAt: Scalars['Timestamp'];
  /** Nominated liquidity fee factor, which is an input to the calculation of liquidity fees on the market, as per setting fees and rewarding liquidity providers. */
  fee: Scalars['String'];
  /** Unique identifier for the order (set by the system after consensus) */
  id: Scalars['ID'];
  /** Market for the order */
  market: Market;
  /** The party making this commitment */
  party: Party;
  /** A reference for the orders created out of this liquidity provision */
  reference?: Maybe<Scalars['String']>;
  /** A set of liquidity sell orders to meet the liquidity provision obligation. */
  sells: Array<LiquidityOrderReference>;
  /** The current status of this liquidity provision */
  status: LiquidityProvisionStatus;
  /** RFC3339Nano time of when the liquidity provision was updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
  /** The version of this liquidity provision */
  version: Scalars['String'];
};

/** Status of a liquidity provision order */
export enum LiquidityProvisionStatus {
  /** An active liquidity provision */
  STATUS_ACTIVE = 'STATUS_ACTIVE',
  /** A cancelled liquidity provision */
  STATUS_CANCELLED = 'STATUS_CANCELLED',
  /**
   * The liquidity provision is valid and accepted by the network, but orders aren't deployed and
   * have never been deployed. If when it's possible to deploy them for the first time the
   * margin check fails, then they will be cancelled without any penalties.
   */
  STATUS_PENDING = 'STATUS_PENDING',
  /** Liquidity provision was invalid and got rejected */
  STATUS_REJECTED = 'STATUS_REJECTED',
  /** A liquidity provision stopped by the network */
  STATUS_STOPPED = 'STATUS_STOPPED',
  /** The liquidity provision is valid and accepted by the network, but orders aren't deployed */
  STATUS_UNDEPLOYED = 'STATUS_UNDEPLOYED'
}

/** The command to be sent to the chain for a liquidity provision submission */
export type LiquidityProvisionUpdate = {
  __typename?: 'LiquidityProvisionUpdate';
  /** A set of liquidity buy orders to meet the liquidity provision obligation. */
  buys: Array<LiquidityOrderReference>;
  /** Specified as a unit-less number that represents the amount of settlement asset of the market. */
  commitmentAmount: Scalars['String'];
  /** RFC3339Nano time when the liquidity provision was initially created */
  createdAt: Scalars['Timestamp'];
  /** Nominated liquidity fee factor, which is an input to the calculation of liquidity fees on the market, as per setting fees and rewarding liquidity providers. */
  fee: Scalars['String'];
  /** Unique identifier for the order (set by the system after consensus) */
  id: Scalars['ID'];
  /** Market for the order */
  marketID: Scalars['ID'];
  /** The party making this commitment */
  partyID: Scalars['ID'];
  /** A reference for the orders created out of this liquidity provision */
  reference?: Maybe<Scalars['String']>;
  /** A set of liquidity sell orders to meet the liquidity provision obligation. */
  sells: Array<LiquidityOrderReference>;
  /** The current status of this liquidity provision */
  status: LiquidityProvisionStatus;
  /** RFC3339Nano time when the liquidity provision was updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
  /** The version of this liquidity provision */
  version: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated liquidity provision information */
export type LiquidityProvisionsConnection = {
  __typename?: 'LiquidityProvisionsConnection';
  edges?: Maybe<Array<Maybe<LiquidityProvisionsEdge>>>;
  pageInfo: PageInfo;
};

/** Edge type containing the liquidity provision and cursor information returned by a LiquidityProvisionsConnection */
export type LiquidityProvisionsEdge = {
  __typename?: 'LiquidityProvisionsEdge';
  cursor: Scalars['String'];
  node: LiquidityProvision;
};

export type LiquiditySLAParameters = {
  __typename?: 'LiquiditySLAParameters';
  /** Specifies the minimum fraction of time LPs must spend 'on the book' providing their committed liquidity */
  commitmentMinTimeFraction: Scalars['String'];
  /** Specifies the number of liquidity epochs over which past performance will continue to affect rewards */
  performanceHysteresisEpochs: Scalars['Int'];
  priceRange: Scalars['String'];
  /**
   * Specifies the maximum fraction of their accrued fees an LP that meets the SLA implied by market.liquidity.commitmentMinTimeFraction will
   * lose to liquidity providers that achieved a higher SLA performance than them.
   */
  slaCompetitionFactor: Scalars['String'];
};

/** Parameters for the log normal risk model */
export type LogNormalModelParams = {
  __typename?: 'LogNormalModelParams';
  /** Mu parameter, annualised growth rate of the underlying asset */
  mu: Scalars['Float'];
  /** R parameter, annualised growth rate of the risk-free asset, used for discounting of future cash flows, can be any real number */
  r: Scalars['Float'];
  /** Sigma parameter, annualised volatility of the underlying asset, must be a strictly non-negative real number */
  sigma: Scalars['Float'];
};

/** A type of risk model for futures trading */
export type LogNormalRiskModel = {
  __typename?: 'LogNormalRiskModel';
  /** Parameters for the log normal risk model */
  params: LogNormalModelParams;
  /** Lambda parameter of the risk model, probability confidence level used in expected shortfall calculation when obtaining the maintenance margin level, must be strictly greater than 0 and strictly smaller than 1 */
  riskAversionParameter: Scalars['Float'];
  /** Tau parameter of the risk model, projection horizon measured as a year fraction used in the expected shortfall calculation to obtain the maintenance margin, must be a strictly non-negative real number */
  tau: Scalars['Float'];
};

export type LossSocialization = {
  __typename?: 'LossSocialization';
  /** The amount lost */
  amount: Scalars['String'];
  /** The market ID where loss socialization happened */
  marketId: Scalars['ID'];
  /** The party that was part of the loss socialization */
  partyId: Scalars['ID'];
};

export type MarginCalculator = {
  __typename?: 'MarginCalculator';
  /** The scaling factors that will be used for margin calculation */
  scalingFactors: ScalingFactors;
};

/** Connection type for retrieving cursor-based paginated margin information */
export type MarginConnection = {
  __typename?: 'MarginConnection';
  /** The margin levels in this connection */
  edges?: Maybe<Array<MarginEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the margin and cursor information returned by a MarginConnection */
export type MarginEdge = {
  __typename?: 'MarginEdge';
  cursor?: Maybe<Scalars['String']>;
  node: MarginLevels;
};

/** Margin level estimate for both worst and best case possible */
export type MarginEstimate = {
  __typename?: 'MarginEstimate';
  /** Margin level estimate assuming no slippage */
  bestCase: MarginLevels;
  /** Margin level estimate assuming slippage cap is applied */
  worstCase: MarginLevels;
};

/** Margins for a given a party */
export type MarginLevels = {
  __typename?: 'MarginLevels';
  /** Asset for the current margins */
  asset: Asset;
  /**
   * If the margin of the party is greater than this level, then collateral will be released from the margin account into
   * the general account of the party for the given asset.
   */
  collateralReleaseLevel: Scalars['String'];
  /** This is the minimum margin required for a party to place a new order on the network, expressed as unsigned integer */
  initialLevel: Scalars['String'];
  /** Minimal margin for the position to be maintained in the network (unsigned integer) */
  maintenanceLevel: Scalars['String'];
  /** Market in which the margin is required for this party */
  market: Market;
  /** The party for this margin */
  party: Party;
  /** If the margin is between maintenance and search, the network will initiate a collateral search, expressed as unsigned integer */
  searchLevel: Scalars['String'];
  /** RFC3339Nano time from at which this margin level was relevant */
  timestamp: Scalars['Timestamp'];
};

/** Margins for a given a party */
export type MarginLevelsUpdate = {
  __typename?: 'MarginLevelsUpdate';
  /** Asset for the current margins */
  asset: Scalars['ID'];
  /**
   * If the margin of the party is greater than this level, then collateral will be released from the margin account into
   * the general account of the party for the given asset.
   */
  collateralReleaseLevel: Scalars['String'];
  /** This is the minimum margin required for a party to place a new order on the network (unsigned integer) */
  initialLevel: Scalars['String'];
  /** Minimal margin for the position to be maintained in the network (unsigned integer) */
  maintenanceLevel: Scalars['String'];
  /** Market in which the margin is required for this party */
  marketId: Scalars['ID'];
  /** The party for this margin */
  partyId: Scalars['ID'];
  /** If the margin is between maintenance and search, the network will initiate a collateral search (unsigned integer) */
  searchLevel: Scalars['String'];
  /** RFC3339Nano time from at which this margin level was relevant */
  timestamp: Scalars['Timestamp'];
};

/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type Market = {
  __typename?: 'Market';
  /** Get account for a party or market */
  accountsConnection?: Maybe<AccountsConnection>;
  /** Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by parameters using cursor based pagination */
  candlesConnection?: Maybe<CandleDataConnection>;
  /** marketData for the given market */
  data?: Maybe<MarketData>;
  /**
   * The number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the market. (uint64)
   *
   * Examples:
   * Currency     Balance  decimalPlaces  Real Balance
   * GBP              100              0       GBP 100
   * GBP              100              2       GBP   1.00
   * GBP              100              4       GBP   0.01
   * GBP                1              4       GBP   0.0001   (  0.01p  )
   *
   * GBX (pence)      100              0       GBP   1.00     (100p     )
   * GBX (pence)      100              2       GBP   0.01     (  1p     )
   * GBX (pence)      100              4       GBP   0.0001   (  0.01p  )
   * GBX (pence)        1              4       GBP   0.000001 (  0.0001p)
   */
  decimalPlaces: Scalars['Int'];
  /** Current depth on the order book for this market */
  depth: MarketDepth;
  /** Fees related data */
  fees: Fees;
  /** Market ID */
  id: Scalars['ID'];
  /** Optional: When a successor market is created, a fraction of the parent market's insurance pool can be transferred to the successor market */
  insurancePoolFraction?: Maybe<Scalars['String']>;
  /** Linear slippage factor is used to cap the slippage component of maintainence margin - it is applied to the slippage volume */
  linearSlippageFactor: Scalars['String'];
  /** Liquidity monitoring parameters for the market */
  liquidityMonitoringParameters: LiquidityMonitoringParameters;
  /** The list of the liquidity provision commitments for this market */
  liquidityProvisionsConnection?: Maybe<LiquidityProvisionsConnection>;
  /** Optional: Liquidity SLA parameters for the market */
  liquiditySLAParameters?: Maybe<LiquiditySLAParameters>;
  /** Timestamps for state changes in the market */
  marketTimestamps: MarketTimestamps;
  /**
   * Auction duration specifies how long the opening auction will run (minimum
   * duration and optionally a minimum traded volume).
   */
  openingAuction: AuctionDuration;
  /** Orders on a market */
  ordersConnection?: Maybe<OrderConnection>;
  /**
   * Optional: Parent market ID. A market can be a successor to another market. If this market is a successor to a previous market,
   * this field will be populated with the ID of the previous market.
   */
  parentMarketID?: Maybe<Scalars['ID']>;
  /**
   * The number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   * This sets how big the smallest order / position on the market can be.
   */
  positionDecimalPlaces: Scalars['Int'];
  /** Price monitoring settings for the market */
  priceMonitoringSettings: PriceMonitoringSettings;
  /** The proposal that initiated this market */
  proposal?: Maybe<Proposal>;
  /** Quadratic slippage factor is used to cap the slippage component of maintainence margin - it is applied to the square of the slippage volume */
  quadraticSlippageFactor: Scalars['String'];
  /** Risk factors for the market */
  riskFactors?: Maybe<RiskFactor>;
  /** Current state of the market */
  state: MarketState;
  /** Optional: Market ID of the successor to this market if one exists */
  successorMarketID?: Maybe<Scalars['ID']>;
  /** An instance of, or reference to, a tradable instrument. */
  tradableInstrument: TradableInstrument;
  /** @deprecated Simplify and consolidate trades query and remove nesting. Use trades query instead */
  tradesConnection?: Maybe<TradeConnection>;
  /** Current mode of execution of the market */
  tradingMode: MarketTradingMode;
};


/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type MarketaccountsConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type MarketcandlesConnectionArgs = {
  interval: Interval;
  pagination?: InputMaybe<Pagination>;
  since: Scalars['String'];
  to?: InputMaybe<Scalars['String']>;
};


/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type MarketdepthArgs = {
  maxDepth?: InputMaybe<Scalars['Int']>;
};


/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type MarketliquidityProvisionsConnectionArgs = {
  live?: InputMaybe<Scalars['Boolean']>;
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type MarketordersConnectionArgs = {
  filter?: InputMaybe<OrderByPartyIdsFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a product & associated parameters that can be traded on Vega, has an associated OrderBook and Trade history */
export type MarkettradesConnectionArgs = {
  dateRange?: InputMaybe<DateRange>;
  pagination?: InputMaybe<Pagination>;
};

/** Connection type for retrieving cursor-based paginated market information */
export type MarketConnection = {
  __typename?: 'MarketConnection';
  /** The markets in this connection */
  edges: Array<MarketEdge>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Live data of a Market */
export type MarketData = {
  __typename?: 'MarketData';
  /** RFC3339Nano time at which the auction will stop (null if not in auction mode) */
  auctionEnd?: Maybe<Scalars['String']>;
  /** RFC3339Nano time at which the next auction will start (null if none is scheduled) */
  auctionStart?: Maybe<Scalars['String']>;
  /** The highest price level on an order book for buy orders. */
  bestBidPrice: Scalars['String'];
  /** The aggregated volume being bid at the best bid price. */
  bestBidVolume: Scalars['String'];
  /** The lowest price level on an order book for offer orders. */
  bestOfferPrice: Scalars['String'];
  /** The aggregated volume being offered at the best offer price. */
  bestOfferVolume: Scalars['String'];
  /** The highest price level on an order book for buy orders not including pegged orders. */
  bestStaticBidPrice: Scalars['String'];
  /** The aggregated volume being offered at the best static bid price, excluding pegged orders */
  bestStaticBidVolume: Scalars['String'];
  /** The lowest price level on an order book for offer orders not including pegged orders. */
  bestStaticOfferPrice: Scalars['String'];
  /** The aggregated volume being offered at the best static offer price, excluding pegged orders. */
  bestStaticOfferVolume: Scalars['String'];
  /** The liquidity commitments for a given market */
  commitments: MarketDataCommitments;
  /** What extended the ongoing auction (if an auction was extended) */
  extensionTrigger: AuctionTrigger;
  /** Indicative price if the auction ended now, 0 if not in auction mode */
  indicativePrice: Scalars['String'];
  /** Indicative volume if the auction ended now, 0 if not in auction mode */
  indicativeVolume: Scalars['String'];
  /** The last traded price (an unsigned integer) */
  lastTradedPrice: Scalars['String'];
  /** The equity like share of liquidity fee for each liquidity provider */
  liquidityProviderFeeShare?: Maybe<Array<LiquidityProviderFeeShare>>;
  /** SLA performance statistics */
  liquidityProviderSla?: Maybe<Array<LiquidityProviderSLA>>;
  /** The mark price (an unsigned integer) */
  markPrice: Scalars['String'];
  /** Market of the associated mark price */
  market: Market;
  /** The market growth factor for the last market time window */
  marketGrowth: Scalars['String'];
  /** Current state of the market */
  marketState: MarketState;
  /** What mode the market is in (auction, continuous, etc) */
  marketTradingMode: MarketTradingMode;
  /** The market value proxy */
  marketValueProxy: Scalars['String'];
  /** The arithmetic average of the best bid price and best offer price. */
  midPrice: Scalars['String'];
  /** RFC3339Nano time indicating the next time positions will be marked to market */
  nextMarkToMarket: Scalars['String'];
  /** The sum of the size of all positions greater than 0. */
  openInterest: Scalars['String'];
  /** A list of valid price ranges per associated trigger */
  priceMonitoringBounds?: Maybe<Array<PriceMonitoringBounds>>;
  /** The current funding rate. This applies only to a perpetual market */
  productData?: Maybe<ProductData>;
  /** The arithmetic average of the best static bid price and best static offer price */
  staticMidPrice: Scalars['String'];
  /** The supplied stake for the market */
  suppliedStake?: Maybe<Scalars['String']>;
  /** The amount of stake targeted for this market */
  targetStake?: Maybe<Scalars['String']>;
  /** RFC3339Nano time at which this market price was relevant */
  timestamp: Scalars['Timestamp'];
  /** What triggered an auction (if an auction was started) */
  trigger: AuctionTrigger;
};

/** The liquidity commitments for this market */
export type MarketDataCommitments = {
  __typename?: 'MarketDataCommitments';
  /** A set of liquidity buy orders to meet the liquidity provision obligation. */
  buys?: Maybe<Array<LiquidityOrderReference>>;
  /** A set of liquidity sell orders to meet the liquidity provision obligation. */
  sells?: Maybe<Array<LiquidityOrderReference>>;
};

/** Connection type for retrieving cursor-based paginated market data information */
export type MarketDataConnection = {
  __typename?: 'MarketDataConnection';
  /** The market data elements for the requested page */
  edges?: Maybe<Array<Maybe<MarketDataEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the reward and cursor information returned by a MarketDataConnection */
export type MarketDataEdge = {
  __typename?: 'MarketDataEdge';
  cursor?: Maybe<Scalars['String']>;
  node: MarketData;
};

/**
 * Market Depth is a measure of the number of open buy and sell orders for a security or currency at different prices.
 * The depth of market measure provides an indication of the liquidity and depth for the instrument.
 */
export type MarketDepth = {
  __typename?: 'MarketDepth';
  /** Buy side price levels (if available) */
  buy?: Maybe<Array<PriceLevel>>;
  /** Last trade for the given market (if available) */
  lastTrade?: Maybe<Trade>;
  /** Market */
  market: Market;
  /** Sell side price levels (if available) */
  sell?: Maybe<Array<PriceLevel>>;
  /** Sequence number for the current snapshot of the market depth */
  sequenceNumber: Scalars['String'];
};

export type MarketDepthTrade = {
  __typename?: 'MarketDepthTrade';
  /** ID of the trade for the given market (if available) */
  id: Scalars['ID'];
  /** Price of the trade */
  price: Scalars['String'];
  /** Size of the trade */
  size: Scalars['String'];
};

/**
 * Market Depth Update is a delta to the current market depth which can be used to update the
 * market depth structure to keep it correct
 */
export type MarketDepthUpdate = {
  __typename?: 'MarketDepthUpdate';
  /** Buy side price levels (if available) */
  buy?: Maybe<Array<PriceLevel>>;
  /** Market */
  market: Market;
  /** Sequence number of the last update sent; useful for checking that no updates were missed. */
  previousSequenceNumber: Scalars['String'];
  /** Sell side price levels (if available) */
  sell?: Maybe<Array<PriceLevel>>;
  /** Sequence number for the current snapshot of the market depth. It is always increasing but not monotonic. */
  sequenceNumber: Scalars['String'];
};

/** Edge type containing the market and cursor information returned by a MarketConnection */
export type MarketEdge = {
  __typename?: 'MarketEdge';
  /** The cursor for this market */
  cursor: Scalars['String'];
  /** The market */
  node: Market;
};

export type MarketEvent = {
  __typename?: 'MarketEvent';
  /** The market ID */
  marketId: Scalars['ID'];
  /** The message - market events are used for logging */
  payload: Scalars['String'];
};

/** The current state of a market */
export enum MarketState {
  /** Enactment date reached and usual auction exit checks pass */
  STATE_ACTIVE = 'STATE_ACTIVE',
  /**
   * Market triggers cancellation condition or governance
   * votes to close before market becomes Active
   */
  STATE_CANCELLED = 'STATE_CANCELLED',
  /** Governance vote (to close) */
  STATE_CLOSED = 'STATE_CLOSED',
  /** Governance vote passes/wins */
  STATE_PENDING = 'STATE_PENDING',
  /** The governance proposal valid and accepted */
  STATE_PROPOSED = 'STATE_PROPOSED',
  /** Outcome of governance votes is to reject the market */
  STATE_REJECTED = 'STATE_REJECTED',
  /** Settlement triggered and completed as defined by product */
  STATE_SETTLED = 'STATE_SETTLED',
  /** Price monitoring or liquidity monitoring trigger */
  STATE_SUSPENDED = 'STATE_SUSPENDED',
  /** Market suspended via governance */
  STATE_SUSPENDED_VIA_GOVERNANCE = 'STATE_SUSPENDED_VIA_GOVERNANCE',
  /**
   * Defined by the product (i.e. from a product parameter,
   * specified in market definition, giving close date/time)
   */
  STATE_TRADING_TERMINATED = 'STATE_TRADING_TERMINATED'
}

export type MarketTick = {
  __typename?: 'MarketTick';
  /** The market ID */
  marketId: Scalars['ID'];
  /** The block time */
  time: Scalars['String'];
};

/** Timestamps for when the market changes state */
export type MarketTimestamps = {
  __typename?: 'MarketTimestamps';
  /** RFC3339Nano time when the market is closed */
  close: Scalars['Timestamp'];
  /** RFC3339Nano time when the market is open and ready to accept trades */
  open: Scalars['Timestamp'];
  /** RFC3339Nano time when the market has been voted in and waiting to be created */
  pending: Scalars['Timestamp'];
  /** RFC3339Nano time when the market is first proposed */
  proposed?: Maybe<Scalars['Timestamp']>;
};

/** What market trading mode is the market in */
export enum MarketTradingMode {
  /** Auction as normal trading mode for the market, where orders are uncrossed periodically */
  TRADING_MODE_BATCH_AUCTION = 'TRADING_MODE_BATCH_AUCTION',
  /** Continuous trading where orders are processed and potentially matched on arrival */
  TRADING_MODE_CONTINUOUS = 'TRADING_MODE_CONTINUOUS',
  /** Auction triggered by price/liquidity monitoring */
  TRADING_MODE_MONITORING_AUCTION = 'TRADING_MODE_MONITORING_AUCTION',
  /** No trading allowed */
  TRADING_MODE_NO_TRADING = 'TRADING_MODE_NO_TRADING',
  /** Auction trading where orders are uncrossed at the end of the opening auction period */
  TRADING_MODE_OPENING_AUCTION = 'TRADING_MODE_OPENING_AUCTION',
  /** Special auction mode triggered via governance market suspension */
  TRADING_MODE_SUSPENDED_VIA_GOVERNANCE = 'TRADING_MODE_SUSPENDED_VIA_GOVERNANCE'
}

export enum MarketUpdateType {
  /** Resume a suspended market */
  MARKET_STATE_UPDATE_TYPE_RESUME = 'MARKET_STATE_UPDATE_TYPE_RESUME',
  /** Suspend the market */
  MARKET_STATE_UPDATE_TYPE_SUSPEND = 'MARKET_STATE_UPDATE_TYPE_SUSPEND',
  /** Terminate the market */
  MARKET_STATE_UPDATE_TYPE_TERMINATE = 'MARKET_STATE_UPDATE_TYPE_TERMINATE',
  /** Default value, always invalid */
  MARKET_STATE_UPDATE_TYPE_UNSPECIFIED = 'MARKET_STATE_UPDATE_TYPE_UNSPECIFIED'
}

/** Information about whether proposals are enabled, if the markets are still bootstrapping, etc.. */
export type NetworkLimits = {
  __typename?: 'NetworkLimits';
  /** Are asset proposals allowed at this point in time */
  canProposeAsset: Scalars['Boolean'];
  /** Are market proposals allowed at this point in time */
  canProposeMarket: Scalars['Boolean'];
  /** True once the genesis file is loaded */
  genesisLoaded: Scalars['Boolean'];
  /** Are asset proposals enabled on this chain */
  proposeAssetEnabled: Scalars['Boolean'];
  /** The date/timestamp in unix nanoseconds at which asset proposals will be enabled (0 indicates not set) */
  proposeAssetEnabledFrom: Scalars['Timestamp'];
  /** Are market proposals enabled on this chain */
  proposeMarketEnabled: Scalars['Boolean'];
  /** The date/timestamp in unix nanoseconds at which market proposals will be enabled (0 indicates not set) */
  proposeMarketEnabledFrom: Scalars['Timestamp'];
};

/** Representation of a network parameter */
export type NetworkParameter = {
  __typename?: 'NetworkParameter';
  /** The name of the network parameter */
  key: Scalars['String'];
  /** The value of the network parameter */
  value: Scalars['String'];
};

/** Edge type containing the network parameter and cursor information returned by a NetworkParametersConnection */
export type NetworkParameterEdge = {
  __typename?: 'NetworkParameterEdge';
  /** Cursor identifying the network parameter */
  cursor: Scalars['String'];
  /** The network parameter */
  node: NetworkParameter;
};

/** Connection type for retrieving cursor-based paginated network parameters information */
export type NetworkParametersConnection = {
  __typename?: 'NetworkParametersConnection';
  /** List of network parameters available for the connection */
  edges?: Maybe<Array<Maybe<NetworkParameterEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/** A new asset proposal change */
export type NewAsset = {
  __typename?: 'NewAsset';
  /** The precision of the asset */
  decimals: Scalars['Int'];
  /** The full name of the asset (e.g: Great British Pound) */
  name: Scalars['String'];
  /** The minimum economically meaningful amount of this specific asset */
  quantum: Scalars['String'];
  /** The source of the new asset */
  source: AssetSource;
  /** The symbol of the asset (e.g: GBP) */
  symbol: Scalars['String'];
};

/**
 * A new freeform proposal change. It has no properties on purpose. Use proposal
 * rationale, instead.
 */
export type NewFreeform = {
  __typename?: 'NewFreeform';
  /** A placeholder to please graphQL */
  _doNotUse?: Maybe<Scalars['Boolean']>;
};

export type NewMarket = {
  __typename?: 'NewMarket';
  /** Decimal places used for the new market, sets the smallest price increment on the book */
  decimalPlaces: Scalars['Int'];
  /** New market instrument configuration */
  instrument: InstrumentConfiguration;
  /** Linear slippage factor is used to cap the slippage component of maintenance margin - it is applied to the slippage volume */
  linearSlippageFactor: Scalars['String'];
  /** Liquidity monitoring parameters */
  liquidityMonitoringParameters: LiquidityMonitoringParameters;
  /** Liquidity SLA Parameters */
  liquiditySLAParameters?: Maybe<LiquiditySLAParameters>;
  /** Metadata for this instrument, tags */
  metadata?: Maybe<Array<Scalars['String']>>;
  /** Decimal places for order sizes, sets what size the smallest order / position on the market can be */
  positionDecimalPlaces: Scalars['Int'];
  /** Price monitoring parameters */
  priceMonitoringParameters: PriceMonitoringParameters;
  /** Quadratic slippage factor is used to cap the slippage component of maintenance margin - it is applied to the square of the slippage volume */
  quadraticSlippageFactor: Scalars['String'];
  /** New market risk configuration */
  riskParameters: RiskModel;
  /** Successor market configuration. If this proposed market is meant to succeed a given market, then this needs to be set. */
  successorConfiguration?: Maybe<SuccessorConfiguration>;
};

/** Configuration for a new spot market on Vega */
export type NewSpotMarket = {
  __typename?: 'NewSpotMarket';
  /** Decimal places used for the new market, sets the smallest price increment on the book */
  decimal_places: Scalars['Int'];
  /** New spot market instrument configuration */
  instrument: InstrumentConfiguration;
  /** Specifies the liquidity provision SLA parameters */
  liquiditySLAParams: LiquiditySLAParameters;
  /** Optional spot market metadata tags */
  metadata: Array<Scalars['String']>;
  /** Decimal places for order sizes, sets what size the smallest order / position on the spot market can be */
  positionDecimalPlaces: Scalars['Int'];
  /** Price monitoring parameters */
  priceMonitoringParameters: PriceMonitoringParameters;
  /** New spot market risk model parameters */
  riskParameters?: Maybe<RiskModel>;
  /** Specifies parameters related to liquidity target stake calculation */
  targetStakeParameters: TargetStakeParameters;
};

export type NewTransfer = {
  __typename?: 'NewTransfer';
  /** The maximum amount to be transferred */
  amount: Scalars['String'];
  /** The asset to transfer */
  asset: Asset;
  /** The destination account */
  destination: Scalars['String'];
  /** The type of destination account */
  destinationType: AccountType;
  /** The fraction of the balance to be transferred */
  fraction_of_balance: Scalars['String'];
  /** The type of governance transfer being made, i.e. a one-off or recurring transfer */
  kind: GovernanceTransferKind;
  /** The source account */
  source: Scalars['String'];
  /** The type of source account */
  sourceType: AccountType;
  /** The type of the governance transfer */
  transferType: GovernanceTransferType;
};

/** Information available for a node */
export type Node = {
  __typename?: 'Node';
  avatarUrl?: Maybe<Scalars['String']>;
  /** All delegation for a node by a given party if specified, or all delegations. */
  delegationsConnection?: Maybe<DelegationsConnection>;
  /** Summary of epoch data across all nodes */
  epochData?: Maybe<EpochData>;
  /** Ethereum public key of the node */
  ethereumAddress: Scalars['String'];
  /** The node URL eg n01.vega.xyz */
  id: Scalars['ID'];
  /** URL from which you can get more info about the node. */
  infoUrl: Scalars['String'];
  /** Country code for the location of the node */
  location: Scalars['String'];
  name: Scalars['String'];
  /** Amount of stake on the next epoch */
  pendingStake: Scalars['String'];
  /** Public key of the node operator */
  pubkey: Scalars['String'];
  /** Ranking scores and status for the validator for the current epoch */
  rankingScore: RankingScore;
  /** Reward scores for the current epoch for the validator */
  rewardScore?: Maybe<RewardScore>;
  /** The amount of stake that has been delegated by token holders */
  stakedByDelegates: Scalars['String'];
  /** The amount of stake the node has put up themselves */
  stakedByOperator: Scalars['String'];
  /** Total amount staked on node */
  stakedTotal: Scalars['String'];
  /** Validator status of the node */
  status: NodeStatus;
  /** Tendermint public key of the node */
  tmPubkey: Scalars['String'];
};


/** Information available for a node */
export type NodedelegationsConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};

export type NodeBasic = {
  __typename?: 'NodeBasic';
  /** The URL of an avatar */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Ethereum public key of the node */
  ethereumAddress: Scalars['String'];
  /** The node URL, for example n01.vega.xyz */
  id: Scalars['ID'];
  /** URL that provides more information about the node */
  infoUrl: Scalars['String'];
  /** Country code for the location of the node */
  location: Scalars['String'];
  /** The name of the node operator */
  name: Scalars['String'];
  /** Public key of the node operator */
  pubkey: Scalars['String'];
  /** Validator status of the node */
  status: NodeStatus;
  /** Tendermint public key of the node */
  tmPubkey: Scalars['String'];
};

/** Summary of data across all nodes */
export type NodeData = {
  __typename?: 'NodeData';
  /** Details on the set of ersatz (standby) nodes in the network */
  ersatzNodes?: Maybe<NodeSet>;
  /** Total number of nodes that had a performance score of 0 at the end of the last epoch */
  inactiveNodes: Scalars['Int'];
  /** Details on the set of pending nodes in the network */
  pendingNodes?: Maybe<NodeSet>;
  /** Total staked amount across all nodes */
  stakedTotal: Scalars['String'];
  /** Details on the set of consensus nodes in the network */
  tendermintNodes: NodeSet;
  /** Total number of nodes across all node sets */
  totalNodes: Scalars['Int'];
  /** Total uptime for all epochs across all nodes. Or specify a number of epochs */
  uptime: Scalars['Float'];
};

/** Edge type containing the node and cursor information returned by a NodesConnection */
export type NodeEdge = {
  __typename?: 'NodeEdge';
  /** Cursor identifying the node */
  cursor: Scalars['String'];
  /** The node */
  node: Node;
};

/** Details on the collection of nodes for particular validator status */
export type NodeSet = {
  __typename?: 'NodeSet';
  /** IDs of the nodes that were demoted into this node set at the start of the epoch */
  demoted?: Maybe<Array<Scalars['String']>>;
  /** Number of nodes in the node set that had a performance score of 0 at the end of the last epoch */
  inactive: Scalars['Int'];
  /** Total number of nodes allowed in the node set */
  maximum?: Maybe<Scalars['Int']>;
  /** IDs of the nodes that were promoted into this node set at the start of the epoch */
  promoted?: Maybe<Array<Scalars['String']>>;
  /** Total number of nodes in the node set */
  total: Scalars['Int'];
};

/** Represents a signature for the approval of a resource from a validator */
export type NodeSignature = {
  __typename?: 'NodeSignature';
  /** The ID of the resource being signed for */
  id: Scalars['ID'];
  /** The kind of signature this is (e.g: withdrawal, new asset, etc) */
  kind?: Maybe<NodeSignatureKind>;
  /** The signature, as base64 encoding */
  signature?: Maybe<Scalars['String']>;
};

/** Edge type containing the node signature and cursor information returned by a NodeSignatureConnection */
export type NodeSignatureEdge = {
  __typename?: 'NodeSignatureEdge';
  /** Cursor identifying the node signature */
  cursor: Scalars['String'];
  /** The node signature */
  node: NodeSignature;
};

/** Represents the type of signature provided by a node */
export enum NodeSignatureKind {
  /** A signature for proposing a new asset into the network */
  NODE_SIGNATURE_KIND_ASSET_NEW = 'NODE_SIGNATURE_KIND_ASSET_NEW',
  /** A signature to update limits of an ERC20 asset */
  NODE_SIGNATURE_KIND_ASSET_UPDATE = 'NODE_SIGNATURE_KIND_ASSET_UPDATE',
  /** A signature for allowing funds withdrawal */
  NODE_SIGNATURE_KIND_ASSET_WITHDRAWAL = 'NODE_SIGNATURE_KIND_ASSET_WITHDRAWAL',
  /** A signature to add a new validator to the ERC20 bridge */
  NODE_SIGNATURE_KIND_ERC20_MULTISIG_SIGNER_ADDED = 'NODE_SIGNATURE_KIND_ERC20_MULTISIG_SIGNER_ADDED',
  /** A signature to remove a validator from the ERC20 bridge */
  NODE_SIGNATURE_KIND_ERC20_MULTISIG_SIGNER_REMOVED = 'NODE_SIGNATURE_KIND_ERC20_MULTISIG_SIGNER_REMOVED'
}

/** Connection type for retrieving cursor-based paginated node signature information */
export type NodeSignaturesConnection = {
  __typename?: 'NodeSignaturesConnection';
  /** List of node signatures available for the connection */
  edges: Array<NodeSignatureEdge>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/** Validating status of a node, i.e. validator or non-validator */
export enum NodeStatus {
  /** The node is non-validating */
  NODE_STATUS_NON_VALIDATOR = 'NODE_STATUS_NON_VALIDATOR',
  /** The node is validating */
  NODE_STATUS_VALIDATOR = 'NODE_STATUS_VALIDATOR'
}

/** Connection type for retrieving cursor-based paginated node information */
export type NodesConnection = {
  __typename?: 'NodesConnection';
  /** List of nodes available for the connection */
  edges?: Maybe<Array<Maybe<NodeEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/**
 * Normaliser to convert the data returned from the contract method
 * into a standard format.
 */
export type Normaliser = {
  __typename?: 'Normaliser';
  expression: Scalars['String'];
  name: Scalars['String'];
};

/** The equity like share of liquidity fee for each liquidity provider */
export type ObservableLiquidityProviderFeeShare = {
  __typename?: 'ObservableLiquidityProviderFeeShare';
  /** The average entry valuation of the liquidity provider for the market */
  averageEntryValuation: Scalars['String'];
  /** The average liquidity score */
  averageScore: Scalars['String'];
  /** The share owned by this liquidity provider (float) */
  equityLikeShare: Scalars['String'];
  /** The liquidity provider party ID */
  partyId: Scalars['ID'];
};

/** The SLA statistics for each liquidity provider */
export type ObservableLiquidityProviderSLA = {
  __typename?: 'ObservableLiquidityProviderSLA';
  /** Indicates how often LP meets the commitment during the current epoch. */
  currentEpochFractionOfTimeOnBook: Scalars['String'];
  /** Determines how the fee penalties from past epochs affect future fee revenue. */
  hysteresisPeriodFeePenalties?: Maybe<Array<Scalars['String']>>;
  /** Indicates the bond penalty amount applied in the previous epoch. */
  lastEpochBondPenalty: Scalars['String'];
  /** Indicates the fee penalty amount applied in the previous epoch. */
  lastEpochFeePenalty: Scalars['String'];
  /** Indicates how often LP meets the commitment during last epoch. */
  lastEpochFractionOfTimeOnBook: Scalars['String'];
  /** Notional volume of orders within the range provided on the buy side of the book. */
  notionalVolumeBuys: Scalars['String'];
  /** Notional volume of orders within the range provided on the sell side of the book. */
  notionalVolumeSells: Scalars['String'];
  /** The liquidity provider party ID */
  party: Scalars['ID'];
  /** Represents the total amount of funds LP must supply. The amount to be supplied is in the market’s settlement currency, spread on both buy and sell sides of the order book within a defined range. */
  requiredLiquidity: Scalars['String'];
};

/** Live data of a Market */
export type ObservableMarketData = {
  __typename?: 'ObservableMarketData';
  /** RFC3339Nano time at which the auction will stop (null if not in auction mode) */
  auctionEnd?: Maybe<Scalars['String']>;
  /** RFC3339Nano time at which the next auction will start (null if none is scheduled) */
  auctionStart?: Maybe<Scalars['String']>;
  /** The highest price level on an order book for buy orders. */
  bestBidPrice: Scalars['String'];
  /** The aggregated volume being bid at the best bid price. */
  bestBidVolume: Scalars['String'];
  /** The lowest price level on an order book for offer orders. */
  bestOfferPrice: Scalars['String'];
  /** The aggregated volume being offered at the best offer price. */
  bestOfferVolume: Scalars['String'];
  /** The highest price level on an order book for buy orders not including pegged orders. */
  bestStaticBidPrice: Scalars['String'];
  /** The aggregated volume being offered at the best static bid price, excluding pegged orders */
  bestStaticBidVolume: Scalars['String'];
  /** The lowest price level on an order book for offer orders not including pegged orders */
  bestStaticOfferPrice: Scalars['String'];
  /** The aggregated volume being offered at the best static offer price, excluding pegged orders */
  bestStaticOfferVolume: Scalars['String'];
  /** What extended the ongoing auction (if an auction was extended) */
  extensionTrigger: AuctionTrigger;
  /** Indicative price if the auction ended now, 0 if not in auction mode */
  indicativePrice: Scalars['String'];
  /** Indicative volume if the auction ended now, 0 if not in auction mode */
  indicativeVolume: Scalars['String'];
  /** The last traded price (an unsigned integer) */
  lastTradedPrice: Scalars['String'];
  /** The equity like share of liquidity fee for each liquidity provider */
  liquidityProviderFeeShare?: Maybe<Array<ObservableLiquidityProviderFeeShare>>;
  /** SLA performance statistics */
  liquidityProviderSla?: Maybe<Array<ObservableLiquidityProviderSLA>>;
  /** The mark price (an unsigned integer) */
  markPrice: Scalars['String'];
  /** The market growth factor for the last market time window */
  marketGrowth: Scalars['String'];
  /** Market ID of the associated mark price */
  marketId: Scalars['ID'];
  /** Current state of the market */
  marketState: MarketState;
  /** What mode the market is in (auction, continuous etc) */
  marketTradingMode: MarketTradingMode;
  /** The market value proxy */
  marketValueProxy: Scalars['String'];
  /** The arithmetic average of the best bid price and best offer price */
  midPrice: Scalars['String'];
  /** RFC3339Nano time indicating the next time positions will be marked to market */
  nextMarkToMarket: Scalars['String'];
  /** The sum of the size of all positions greater than 0 */
  openInterest: Scalars['String'];
  /** A list of valid price ranges per associated trigger */
  priceMonitoringBounds?: Maybe<Array<PriceMonitoringBounds>>;
  /** The current funding rate. This applies only to a perpetual market */
  productData?: Maybe<ProductData>;
  /** The arithmetic average of the best static bid price and best static offer price */
  staticMidPrice: Scalars['String'];
  /** The supplied stake for the market */
  suppliedStake?: Maybe<Scalars['String']>;
  /** The amount of stake targeted for this market */
  targetStake?: Maybe<Scalars['String']>;
  /** RFC3339Nano time at which this market price was relevant */
  timestamp: Scalars['Timestamp'];
  /** What triggered an auction (if an auction was started) */
  trigger: AuctionTrigger;
};

/**
 * Market Depth is a measure of the number of open buy and sell orders for a security or currency at different prices.
 * The depth of market measure provides an indication of the liquidity and depth for the instrument.
 */
export type ObservableMarketDepth = {
  __typename?: 'ObservableMarketDepth';
  /** Buy side price levels (if available) */
  buy?: Maybe<Array<PriceLevel>>;
  /** Last trade for the given market (if available) */
  lastTrade: MarketDepthTrade;
  /** Market ID */
  marketId: Scalars['ID'];
  /** Sell side price levels (if available) */
  sell?: Maybe<Array<PriceLevel>>;
  /** Sequence number for the current snapshot of the market depth */
  sequenceNumber: Scalars['String'];
};

/**
 * Market Depth Update is a delta to the current market depth which can be used to update the
 * market depth structure to keep it correct
 */
export type ObservableMarketDepthUpdate = {
  __typename?: 'ObservableMarketDepthUpdate';
  /** Buy side price levels (if available) */
  buy?: Maybe<Array<PriceLevel>>;
  /** Market ID */
  marketId: Scalars['ID'];
  /** Sequence number of the last update sent; useful for checking that no updates were missed. */
  previousSequenceNumber: Scalars['String'];
  /** Sell side price levels (if available) */
  sell?: Maybe<Array<PriceLevel>>;
  /** Sequence number for the current snapshot of the market depth. It is always increasing but not monotonic. */
  sequenceNumber: Scalars['String'];
};

/** The specific details for a one-off governance transfer */
export type OneOffGovernanceTransfer = {
  __typename?: 'OneOffGovernanceTransfer';
  /** An optional RFC3339Nano time when the transfer should be delivered */
  deliverOn?: Maybe<Scalars['Timestamp']>;
};

/** The specific details for a one-off transfer */
export type OneOffTransfer = {
  __typename?: 'OneOffTransfer';
  /** An optional RFC3339Nano time when the transfer should be delivered */
  deliverOn?: Maybe<Scalars['Timestamp']>;
};

export type Oracle = EthereumEvent;

/** An oracle data contains the data sent by an oracle */
export type OracleData = {
  __typename?: 'OracleData';
  externalData: ExternalData;
};

export type OracleDataConnection = {
  __typename?: 'OracleDataConnection';
  /** The oracle data spec */
  edges?: Maybe<Array<Maybe<OracleDataEdge>>>;
  /** The pagination information */
  pageInfo: PageInfo;
};

export type OracleDataEdge = {
  __typename?: 'OracleDataEdge';
  /** The cursor for the data item */
  cursor: Scalars['String'];
  /** The oracle data source */
  node: OracleData;
};

export type OracleSpec = {
  __typename?: 'OracleSpec';
  /** Data lists all the oracle data broadcast to this spec */
  dataConnection: OracleDataConnection;
  dataSourceSpec: ExternalDataSourceSpec;
};


export type OracleSpecdataConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};

export type OracleSpecEdge = {
  __typename?: 'OracleSpecEdge';
  /** The cursor for the external data */
  cursor: Scalars['String'];
  /** The external data spec */
  node: OracleSpec;
};

export type OracleSpecsConnection = {
  __typename?: 'OracleSpecsConnection';
  edges?: Maybe<Array<Maybe<OracleSpecEdge>>>;
  pageInfo: PageInfo;
};

/** An order in Vega, if active it will be on the order book for the market */
export type Order = {
  __typename?: 'Order';
  /** RFC3339Nano formatted date and time for when the order was created (timestamp) */
  createdAt: Scalars['Timestamp'];
  /** RFC3339Nano expiration time of this order */
  expiresAt?: Maybe<Scalars['Timestamp']>;
  /** Details of an iceberg order */
  icebergOrder?: Maybe<IcebergOrder>;
  /** Hash of the order data */
  id: Scalars['ID'];
  /** The liquidity provision this order was created from */
  liquidityProvision?: Maybe<LiquidityProvision>;
  /** The market the order is trading on (probably stored internally as a hash of the market details) */
  market: Market;
  /** The party that placed the order (probably stored internally as the party's public key) */
  party: Party;
  /** PeggedOrder contains the details about a pegged order */
  peggedOrder?: Maybe<PeggedOrder>;
  /** Is this a post only order */
  postOnly?: Maybe<Scalars['Boolean']>;
  /** The worst price the order will trade at (e.g. buy for price or less, sell for price or more) (uint64) */
  price: Scalars['String'];
  /** Is this a reduce only order */
  reduceOnly?: Maybe<Scalars['Boolean']>;
  /** The external reference (if available) for the order */
  reference: Scalars['String'];
  /** Why the order was rejected */
  rejectionReason?: Maybe<OrderRejectionReason>;
  /** Number of units remaining of the total that have not yet been bought or sold (uint64) */
  remaining: Scalars['String'];
  /** Whether the order is to buy or sell */
  side: Side;
  /** Total number of units that may be bought or sold (immutable) (uint64) */
  size: Scalars['String'];
  /** The status of an order, for example 'Active' */
  status: OrderStatus;
  /** The timeInForce of order (determines how and if it executes, and whether it persists on the book) */
  timeInForce: OrderTimeInForce;
  /**
   * Trades relating to this order
   * @deprecated Simplify and consolidate trades query and remove nesting. Use trades query instead
   */
  tradesConnection?: Maybe<TradeConnection>;
  /** The order type */
  type?: Maybe<OrderType>;
  /** RFC3339Nano time the order was altered */
  updatedAt?: Maybe<Scalars['Timestamp']>;
  /** Version of this order, counts the number of amends */
  version: Scalars['String'];
};


/** An order in Vega, if active it will be on the order book for the market */
export type OrdertradesConnectionArgs = {
  dateRange?: InputMaybe<DateRange>;
  pagination?: InputMaybe<Pagination>;
};

export type OrderByMarketAndPartyIdsFilter = {
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  order?: InputMaybe<OrderFilter>;
  partyIds?: InputMaybe<Array<Scalars['ID']>>;
};

export type OrderByMarketIdsFilter = {
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  order?: InputMaybe<OrderFilter>;
};

export type OrderByPartyIdsFilter = {
  order?: InputMaybe<OrderFilter>;
  partyIds?: InputMaybe<Array<Scalars['ID']>>;
};

/** Connection type for retrieving cursor-based paginated order information */
export type OrderConnection = {
  __typename?: 'OrderConnection';
  /** The orders in this connection */
  edges?: Maybe<Array<OrderEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the order and cursor information returned by a OrderConnection */
export type OrderEdge = {
  __typename?: 'OrderEdge';
  /** The cursor for this order */
  cursor?: Maybe<Scalars['String']>;
  /** The order */
  node: Order;
};

/** An estimate of the fee to be paid by the order */
export type OrderEstimate = {
  __typename?: 'OrderEstimate';
  /** The estimated fee if the order was to trade */
  fee: TradeFee;
  /** The margin requirement for this order */
  marginLevels: MarginLevels;
  /** The total estimated amount of fee if the order was to trade */
  totalFeeAmount: Scalars['String'];
};

export type OrderFilter = {
  /** Date range to retrieve orders from/to. Start and end time should be expressed as an integer value Unix nanoseconds */
  dateRange?: InputMaybe<DateRange>;
  excludeLiquidity?: InputMaybe<Scalars['Boolean']>;
  /**
   * If true, only orders that are live will be returned. Orders are live if they have STATUS_ACTIVE or STATUS_PARKED
   * as per https://github.com/vegaprotocol/specs-internal/blob/master/protocol/0024-OSTA-order_status.md
   */
  liveOnly?: InputMaybe<Scalars['Boolean']>;
  status?: InputMaybe<Array<OrderStatus>>;
  timeInForce?: InputMaybe<Array<OrderTimeInForce>>;
  types?: InputMaybe<Array<OrderType>>;
};

/** Basic description of an order */
export type OrderInfo = {
  /** Boolean indicating a market order */
  isMarketOrder: Scalars['Boolean'];
  /** Price for the order */
  price: Scalars['String'];
  /** Number of units remaining of the total that have not yet been bought or sold (uint64) */
  remaining: Scalars['String'];
  /** Whether the order is to buy or sell */
  side: Side;
};

/** Why the order was rejected by the core node */
export enum OrderRejectionReason {
  /** Amending the order failed */
  ORDER_ERROR_AMEND_FAILURE = 'ORDER_ERROR_AMEND_FAILURE',
  /** Buy pegged order cannot reference best ask price */
  ORDER_ERROR_BUY_CANNOT_REFERENCE_BEST_ASK_PRICE = 'ORDER_ERROR_BUY_CANNOT_REFERENCE_BEST_ASK_PRICE',
  /** Amending from Good for Auction or Good for Normal is invalid */
  ORDER_ERROR_CANNOT_AMEND_FROM_GFA_OR_GFN = 'ORDER_ERROR_CANNOT_AMEND_FROM_GFA_OR_GFN',
  /** Cannot change pegged order fields on a non pegged order */
  ORDER_ERROR_CANNOT_AMEND_PEGGED_ORDER_DETAILS_ON_NON_PEGGED_ORDER = 'ORDER_ERROR_CANNOT_AMEND_PEGGED_ORDER_DETAILS_ON_NON_PEGGED_ORDER',
  /** Amending to Fill or Kill, or Immediate or Cancel is invalid */
  ORDER_ERROR_CANNOT_AMEND_TO_FOK_OR_IOC = 'ORDER_ERROR_CANNOT_AMEND_TO_FOK_OR_IOC',
  /** Amending to Good for Auction or Good for Normal is invalid */
  ORDER_ERROR_CANNOT_AMEND_TO_GFA_OR_GFN = 'ORDER_ERROR_CANNOT_AMEND_TO_GFA_OR_GFN',
  /** Attempt to amend order to Good til Time without expiry time */
  ORDER_ERROR_CANNOT_AMEND_TO_GTT_WITHOUT_EXPIRYAT = 'ORDER_ERROR_CANNOT_AMEND_TO_GTT_WITHOUT_EXPIRYAT',
  /** Attempt to amend to Good till Cancelled without an expiry time */
  ORDER_ERROR_CANNOT_HAVE_GTC_AND_EXPIRYAT = 'ORDER_ERROR_CANNOT_HAVE_GTC_AND_EXPIRYAT',
  /** Cannot send FOK orders during an auction */
  ORDER_ERROR_CANNOT_SEND_FOK_ORDER_DURING_AUCTION = 'ORDER_ERROR_CANNOT_SEND_FOK_ORDER_DURING_AUCTION',
  /** Good for Auction order received during continuous trading */
  ORDER_ERROR_CANNOT_SEND_GFA_ORDER_DURING_CONTINUOUS_TRADING = 'ORDER_ERROR_CANNOT_SEND_GFA_ORDER_DURING_CONTINUOUS_TRADING',
  /** Good for Normal order received during an auction */
  ORDER_ERROR_CANNOT_SEND_GFN_ORDER_DURING_AN_AUCTION = 'ORDER_ERROR_CANNOT_SEND_GFN_ORDER_DURING_AN_AUCTION',
  /** Cannot send IOC orders during an auction */
  ORDER_ERROR_CANNOT_SEND_IOC_ORDER_DURING_AUCTION = 'ORDER_ERROR_CANNOT_SEND_IOC_ORDER_DURING_AUCTION',
  /** Edit is not allowed */
  ORDER_ERROR_EDIT_NOT_ALLOWED = 'ORDER_ERROR_EDIT_NOT_ALLOWED',
  /** Attempt to amend expiry time to a value before time order was created */
  ORDER_ERROR_EXPIRYAT_BEFORE_CREATEDAT = 'ORDER_ERROR_EXPIRYAT_BEFORE_CREATEDAT',
  /** Order was submitted with an incorrect or invalid market type */
  ORDER_ERROR_INCORRECT_MARKET_TYPE = 'ORDER_ERROR_INCORRECT_MARKET_TYPE',
  /** Insufficient balance to submit the order (no deposit made) */
  ORDER_ERROR_INSUFFICIENT_ASSET_BALANCE = 'ORDER_ERROR_INSUFFICIENT_ASSET_BALANCE',
  /** Insufficient funds to pay fees */
  ORDER_ERROR_INSUFFICIENT_FUNDS_TO_PAY_FEES = 'ORDER_ERROR_INSUFFICIENT_FUNDS_TO_PAY_FEES',
  /** An internal error happened */
  ORDER_ERROR_INTERNAL_ERROR = 'ORDER_ERROR_INTERNAL_ERROR',
  /** Expiration time is invalid */
  ORDER_ERROR_INVALID_EXPIRATION_DATETIME = 'ORDER_ERROR_INVALID_EXPIRATION_DATETIME',
  /** Market ID is invalid */
  ORDER_ERROR_INVALID_MARKET_ID = 'ORDER_ERROR_INVALID_MARKET_ID',
  /** Order ID is invalid */
  ORDER_ERROR_INVALID_ORDER_ID = 'ORDER_ERROR_INVALID_ORDER_ID',
  /** Order reference is invalid */
  ORDER_ERROR_INVALID_ORDER_REFERENCE = 'ORDER_ERROR_INVALID_ORDER_REFERENCE',
  /** Party ID is invalid */
  ORDER_ERROR_INVALID_PARTY_ID = 'ORDER_ERROR_INVALID_PARTY_ID',
  /** Invalid persistence */
  ORDER_ERROR_INVALID_PERSISTENCE = 'ORDER_ERROR_INVALID_PERSISTENCE',
  /** Remaining size in the order is invalid */
  ORDER_ERROR_INVALID_REMAINING_SIZE = 'ORDER_ERROR_INVALID_REMAINING_SIZE',
  /** Invalid size */
  ORDER_ERROR_INVALID_SIZE = 'ORDER_ERROR_INVALID_SIZE',
  /** Invalid Time In Force */
  ORDER_ERROR_INVALID_TIME_IN_FORCE = 'ORDER_ERROR_INVALID_TIME_IN_FORCE',
  /** Invalid type */
  ORDER_ERROR_INVALID_TYPE = 'ORDER_ERROR_INVALID_TYPE',
  /** Margin check failed - not enough available margin */
  ORDER_ERROR_MARGIN_CHECK_FAILED = 'ORDER_ERROR_MARGIN_CHECK_FAILED',
  /** Market is closed */
  ORDER_ERROR_MARKET_CLOSED = 'ORDER_ERROR_MARKET_CLOSED',
  /** Order missing general account */
  ORDER_ERROR_MISSING_GENERAL_ACCOUNT = 'ORDER_ERROR_MISSING_GENERAL_ACCOUNT',
  /** Pegged orders can only have a time in force of Good til Cancelled or Good til Time */
  ORDER_ERROR_MUST_BE_GTT_OR_GTC = 'ORDER_ERROR_MUST_BE_GTT_OR_GTC',
  /** Pegged orders must be limit orders */
  ORDER_ERROR_MUST_BE_LIMIT_ORDER = 'ORDER_ERROR_MUST_BE_LIMIT_ORDER',
  /** Non-persistent order exceeds price bounds */
  ORDER_ERROR_NON_PERSISTENT_ORDER_OUT_OF_PRICE_BOUNDS = 'ORDER_ERROR_NON_PERSISTENT_ORDER_OUT_OF_PRICE_BOUNDS',
  /** Order does not exist */
  ORDER_ERROR_NOT_FOUND = 'ORDER_ERROR_NOT_FOUND',
  /** Pegged order offset must be >= 0 */
  ORDER_ERROR_OFFSET_MUST_BE_GREATER_OR_EQUAL_TO_ZERO = 'ORDER_ERROR_OFFSET_MUST_BE_GREATER_OR_EQUAL_TO_ZERO',
  /** Pegged order offset must be > zero */
  ORDER_ERROR_OFFSET_MUST_BE_GREATER_THAN_ZERO = 'ORDER_ERROR_OFFSET_MUST_BE_GREATER_THAN_ZERO',
  /** Order is out of sequence */
  ORDER_ERROR_OUT_OF_SEQUENCE = 'ORDER_ERROR_OUT_OF_SEQUENCE',
  /** A post-only order would produce an aggressive trade and thus it has been rejected */
  ORDER_ERROR_POST_ONLY_ORDER_WOULD_TRADE = 'ORDER_ERROR_POST_ONLY_ORDER_WOULD_TRADE',
  /** A reduce-ony order would not reduce the party's position and thus it has been rejected */
  ORDER_ERROR_REDUCE_ONLY_ORDER_WOULD_NOT_REDUCE = 'ORDER_ERROR_REDUCE_ONLY_ORDER_WOULD_NOT_REDUCE',
  /** Unable to remove the order */
  ORDER_ERROR_REMOVAL_FAILURE = 'ORDER_ERROR_REMOVAL_FAILURE',
  /** Order cannot be filled because it would require self trading */
  ORDER_ERROR_SELF_TRADING = 'ORDER_ERROR_SELF_TRADING',
  /** Sell pegged order cannot reference best bid price */
  ORDER_ERROR_SELL_CANNOT_REFERENCE_BEST_BID_PRICE = 'ORDER_ERROR_SELL_CANNOT_REFERENCE_BEST_BID_PRICE',
  /** Time has failed us */
  ORDER_ERROR_TIME_FAILURE = 'ORDER_ERROR_TIME_FAILURE',
  /** Unable to submit pegged order, temporarily too many pegged orders across all markets */
  ORDER_ERROR_TOO_MANY_PEGGED_ORDERS = 'ORDER_ERROR_TOO_MANY_PEGGED_ORDERS',
  /** Unable to amend pegged order price */
  ORDER_ERROR_UNABLE_TO_AMEND_PRICE_ON_PEGGED_ORDER = 'ORDER_ERROR_UNABLE_TO_AMEND_PRICE_ON_PEGGED_ORDER',
  /** Unable to reprice a pegged order */
  ORDER_ERROR_UNABLE_TO_REPRICE_PEGGED_ORDER = 'ORDER_ERROR_UNABLE_TO_REPRICE_PEGGED_ORDER',
  /** Pegged order must have a reference price */
  ORDER_ERROR_WITHOUT_REFERENCE_PRICE = 'ORDER_ERROR_WITHOUT_REFERENCE_PRICE'
}

/** Valid order statuses, these determine several states for an order that cannot be expressed with other fields in Order. */
export enum OrderStatus {
  /**
   * The order is active and not cancelled or expired, it could be unfilled, partially filled or fully filled.
   * Active does not necessarily mean it's still on the order book.
   */
  STATUS_ACTIVE = 'STATUS_ACTIVE',
  /** The order is cancelled, the order could be partially filled or unfilled before it was cancelled. It is not possible to cancel an order with 0 remaining. */
  STATUS_CANCELLED = 'STATUS_CANCELLED',
  /** This order trades any amount and as much as possible and remains on the book until it either trades completely or expires. */
  STATUS_EXPIRED = 'STATUS_EXPIRED',
  /** This order is fully filled with remaining equalling zero. */
  STATUS_FILLED = 'STATUS_FILLED',
  /** This order has been removed from the order book because the market is in auction, the reference price doesn't exist, or the order needs to be repriced and can't. Applies to pegged orders only */
  STATUS_PARKED = 'STATUS_PARKED',
  /** This order was partially filled. */
  STATUS_PARTIALLY_FILLED = 'STATUS_PARTIALLY_FILLED',
  /** This order was rejected while being processed. */
  STATUS_REJECTED = 'STATUS_REJECTED',
  /** This order was of type IOC or FOK and could not be processed by the matching engine due to lack of liquidity. */
  STATUS_STOPPED = 'STATUS_STOPPED'
}

/** Details of the order that will be submitted when the stop order is triggered. */
export type OrderSubmission = {
  __typename?: 'OrderSubmission';
  /** RFC3339Nano expiration time of this order */
  expiresAt: Scalars['Timestamp'];
  /** Details of an iceberg order */
  icebergOrder?: Maybe<IcebergOrder>;
  /** Market the order is for. */
  marketId: Scalars['ID'];
  /** PeggedOrder contains the details about a pegged order */
  peggedOrder?: Maybe<PeggedOrder>;
  /** Is this a post only order */
  postOnly?: Maybe<Scalars['Boolean']>;
  /** The worst price the order will trade at (e.g. buy for price or less, sell for price or more) (uint64) */
  price: Scalars['String'];
  /** Is this a reduce only order */
  reduceOnly?: Maybe<Scalars['Boolean']>;
  /** The external reference (if available) for the order */
  reference?: Maybe<Scalars['String']>;
  /** Whether the order is to buy or sell */
  side: Side;
  /** Total number of units that may be bought or sold (immutable) (uint64) */
  size: Scalars['String'];
  /** The timeInForce of order (determines how and if it executes, and whether it persists on the book) */
  timeInForce: OrderTimeInForce;
  /** The order type */
  type: OrderType;
};

/** Valid order types, these determine what happens when an order is added to the book */
export enum OrderTimeInForce {
  /** Fill or Kill: The order either trades completely (remainingSize == 0 after adding) or not at all, does not remain on the book if it doesn't trade */
  TIME_IN_FORCE_FOK = 'TIME_IN_FORCE_FOK',
  /** Good for Auction: This order is only accepted during an auction period */
  TIME_IN_FORCE_GFA = 'TIME_IN_FORCE_GFA',
  /** Good for Normal: This order is only accepted during normal trading (continuous trading or frequent batched auctions) */
  TIME_IN_FORCE_GFN = 'TIME_IN_FORCE_GFN',
  /** Good 'til Cancelled: This order trades any amount and as much as possible and remains on the book until it either trades completely or is cancelled */
  TIME_IN_FORCE_GTC = 'TIME_IN_FORCE_GTC',
  /**
   * Good 'til Time: This order type trades any amount and as much as possible and remains on the book until they either trade completely, are cancelled, or expires at a set time
   * NOTE: this may in future be multiple types or have sub types for orders that provide different ways of specifying expiry
   */
  TIME_IN_FORCE_GTT = 'TIME_IN_FORCE_GTT',
  /** Immediate or Cancel: The order trades any amount and as much as possible but does not remain on the book (whether it trades or not) */
  TIME_IN_FORCE_IOC = 'TIME_IN_FORCE_IOC'
}

/** Types of orders */
export enum OrderType {
  /** Order that uses a pre-specified price to buy or sell */
  TYPE_LIMIT = 'TYPE_LIMIT',
  /** An order to buy or sell at the market's current best available price */
  TYPE_MARKET = 'TYPE_MARKET',
  /**
   * Used for distressed parties, an order placed by the network to close out distressed parties
   * similar to market order, only no party is attached to the order.
   */
  TYPE_NETWORK = 'TYPE_NETWORK'
}

/** An order update in Vega, if active it will be on the order book for the market */
export type OrderUpdate = {
  __typename?: 'OrderUpdate';
  /** RFC3339Nano formatted date and time for when the order was created (timestamp) */
  createdAt: Scalars['Timestamp'];
  /** RFC3339Nano expiration time of this order */
  expiresAt?: Maybe<Scalars['Timestamp']>;
  /** Details of an iceberg order */
  icebergOrder?: Maybe<IcebergOrder>;
  /** Hash of the order data */
  id: Scalars['ID'];
  /** The liquidity provision this order was created from */
  liquidityProvisionId?: Maybe<Scalars['ID']>;
  /** The market the order is trading on (probably stored internally as a hash of the market details) */
  marketId: Scalars['ID'];
  /** The party that placed the order (probably stored internally as the party's public key) */
  partyId: Scalars['ID'];
  /** PeggedOrder contains the details about a pegged order */
  peggedOrder?: Maybe<PeggedOrder>;
  /** The worst price the order will trade at (e.g. buy for price or less, sell for price or more) (uint64) */
  price: Scalars['String'];
  /** The external reference (if available) for the order */
  reference: Scalars['String'];
  /** Why the order was rejected */
  rejectionReason?: Maybe<OrderRejectionReason>;
  /** Number of units remaining of the total that have not yet been bought or sold (uint64) */
  remaining: Scalars['String'];
  /** Whether the order is to buy or sell */
  side: Side;
  /** Total number of units that may be bought or sold (immutable) (uint64) */
  size: Scalars['String'];
  /** The status of an order, for example 'Active' */
  status: OrderStatus;
  /** The timeInForce of order (determines how and if it executes, and whether it persists on the book) */
  timeInForce: OrderTimeInForce;
  /** The order type */
  type?: Maybe<OrderType>;
  /** RFC3339Nano time the order was altered */
  updatedAt?: Maybe<Scalars['Timestamp']>;
  /** Version of this order, counts the number of amends */
  version: Scalars['String'];
};

/** Paging information returned with each page of a connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** The last cursor in the current page */
  endCursor: Scalars['String'];
  /** The connection has more pages to fetch when traversing forward through the connection */
  hasNextPage: Scalars['Boolean'];
  /** The connection has more pages to fetch when traversing backward through the connection */
  hasPreviousPage: Scalars['Boolean'];
  /** The first cursor in the current page */
  startCursor: Scalars['String'];
};

/** Pagination constructs to support cursor based pagination in the API */
export type Pagination = {
  /** The cursor to start fetching items after. If empty, data will be fetched from the beginning of the connection */
  after?: InputMaybe<Scalars['String']>;
  /** The cursor to start fetching items before. If empty data will be fetched from the end of the connection */
  before?: InputMaybe<Scalars['String']>;
  /** The number of items to fetch in the next page traversing forward through the connection */
  first?: InputMaybe<Scalars['Int']>;
  /** The number of items to fetch in the next page traversing backward through the connection */
  last?: InputMaybe<Scalars['Int']>;
};

/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type Party = {
  __typename?: 'Party';
  /** Collateral accounts relating to a party */
  accountsConnection?: Maybe<AccountsConnection>;
  /** The activity streak */
  activityStreak?: Maybe<PartyActivityStreak>;
  delegationsConnection?: Maybe<DelegationsConnection>;
  /** The list of all deposits for a party by the party */
  depositsConnection?: Maybe<DepositsConnection>;
  /** Party identifier */
  id: Scalars['ID'];
  /** The list of the liquidity provision commitment for this party */
  liquidityProvisionsConnection?: Maybe<LiquidityProvisionsConnection>;
  /** Margin levels for a market */
  marginsConnection?: Maybe<MarginConnection>;
  /** Orders relating to a party */
  ordersConnection?: Maybe<OrderConnection>;
  /**
   * Trading positions relating to a party
   * @deprecated Use root positions query instead of sub-query
   */
  positionsConnection?: Maybe<PositionConnection>;
  /** All governance proposals in the Vega network */
  proposalsConnection?: Maybe<ProposalsConnection>;
  /** Return net reward information */
  rewardSummaries?: Maybe<Array<Maybe<RewardSummary>>>;
  /** Rewards information for the party */
  rewardsConnection?: Maybe<RewardsConnection>;
  /** The staking information for this Party */
  stakingSummary: StakingSummary;
  /** @deprecated Simplify and consolidate trades query and remove nesting. Use trades query instead */
  tradesConnection?: Maybe<TradeConnection>;
  /** All transfers for a public key */
  transfersConnection?: Maybe<TransferConnection>;
  /** All votes on proposals in the Vega network by the given party */
  votesConnection?: Maybe<ProposalVoteConnection>;
  /** The list of all withdrawals initiated by the party */
  withdrawalsConnection?: Maybe<WithdrawalsConnection>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyaccountsConnectionArgs = {
  assetId?: InputMaybe<Scalars['ID']>;
  marketId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  type?: InputMaybe<AccountType>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyactivityStreakArgs = {
  epoch?: InputMaybe<Scalars['Int']>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartydelegationsConnectionArgs = {
  nodeId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartydepositsConnectionArgs = {
  dateRange?: InputMaybe<DateRange>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyliquidityProvisionsConnectionArgs = {
  live?: InputMaybe<Scalars['Boolean']>;
  marketId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  reference?: InputMaybe<Scalars['String']>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartymarginsConnectionArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyordersConnectionArgs = {
  filter?: InputMaybe<OrderByMarketIdsFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartypositionsConnectionArgs = {
  market?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyproposalsConnectionArgs = {
  inState?: InputMaybe<ProposalState>;
  pagination?: InputMaybe<Pagination>;
  proposalType?: InputMaybe<ProposalType>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyrewardSummariesArgs = {
  assetId?: InputMaybe<Scalars['ID']>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyrewardsConnectionArgs = {
  assetId?: InputMaybe<Scalars['ID']>;
  fromEpoch?: InputMaybe<Scalars['Int']>;
  pagination?: InputMaybe<Pagination>;
  toEpoch?: InputMaybe<Scalars['Int']>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartystakingSummaryArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartytradesConnectionArgs = {
  dataRange?: InputMaybe<DateRange>;
  marketId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartytransfersConnectionArgs = {
  direction?: InputMaybe<TransferDirection>;
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartyvotesConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Represents a party on Vega, could be an ethereum wallet address in the future */
export type PartywithdrawalsConnectionArgs = {
  dateRange?: InputMaybe<DateRange>;
  pagination?: InputMaybe<Pagination>;
};

/** The activity streak for a party. */
export type PartyActivityStreak = {
  __typename?: 'PartyActivityStreak';
  /** The number of epochs the party has been active in a row */
  activeFor: Scalars['Int'];
  /** The epoch for which this information is relevant */
  epoch: Scalars['Int'];
  /** The number of epochs the party has been inactive in a row */
  inactiveFor: Scalars['Int'];
  /** If the party is considered as active, and thus eligible for rewards multipliers */
  isActive: Scalars['Boolean'];
  /** The open volume for the party in the given epoch */
  openVolume: Scalars['String'];
  /** The rewards distribution multiplier for the party */
  rewardDistributionMultiplier: Scalars['String'];
  /** The rewards vesting multiplier for the party */
  rewardVestingMultiplier: Scalars['String'];
  /** The traded volume for that party in the given epoch */
  tradedVolume: Scalars['String'];
};

/** An amount received by a party as a reward or a discount */
export type PartyAmount = {
  __typename?: 'PartyAmount';
  /** Amount received by the party */
  amount: Scalars['String'];
  /** Id of the party that received the payment */
  partyId: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated party information */
export type PartyConnection = {
  __typename?: 'PartyConnection';
  /** The parties in this connection */
  edges: Array<PartyEdge>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the party and cursor information returned by a PartyConnection */
export type PartyEdge = {
  __typename?: 'PartyEdge';
  /** The cursor for this party */
  cursor: Scalars['String'];
  /** The party */
  node: Party;
};

/**
 * All staking information related to a Party.
 * Contains the current recognised balance by the network and
 * all the StakeLink/Unlink seen by the network
 */
export type PartyStake = {
  __typename?: 'PartyStake';
  /** The stake currently available for the party */
  currentStakeAvailable: Scalars['String'];
  /** The list of all stake link/unlink for the party */
  linkings?: Maybe<Array<StakeLinking>>;
};

/** Create an order linked to an index rather than a price */
export type PeggedOrder = {
  __typename?: 'PeggedOrder';
  /** Price offset from the peg */
  offset: Scalars['String'];
  /** Index to link this order to */
  reference: PeggedReference;
};

/** Valid references used for pegged orders. */
export enum PeggedReference {
  /** Peg the order against the best ask price of the order book */
  PEGGED_REFERENCE_BEST_ASK = 'PEGGED_REFERENCE_BEST_ASK',
  /** Peg the order against the best bid price of the order book */
  PEGGED_REFERENCE_BEST_BID = 'PEGGED_REFERENCE_BEST_BID',
  /** Peg the order against the mid price of the order book */
  PEGGED_REFERENCE_MID = 'PEGGED_REFERENCE_MID'
}

/** Perpetual future product */
export type Perpetual = {
  __typename?: 'Perpetual';
  /** Lower bound for the clamp function used as part of the funding rate calculation, in the range [-1, 1] */
  clampLowerBound: Scalars['String'];
  /** Upper bound for the clamp function used as part of the funding rate calculation, in the range [-1, 1] */
  clampUpperBound: Scalars['String'];
  /** Binding between the data source spec and the settlement data */
  dataSourceSpecBinding: DataSourceSpecPerpetualBinding;
  /** Data source specification describing the data source for settlement */
  dataSourceSpecForSettlementData: DataSourceSpec;
  /** Data source specification describing the data source for settlement schedule */
  dataSourceSpecForSettlementSchedule: DataSourceSpec;
  /** Continuously compounded interest rate used in funding rate calculation, in the range [-1, 1] */
  interestRate: Scalars['String'];
  /** Controls how much the upcoming funding payment liability contributes to party's margin, in the range [0, 1] */
  marginFundingFactor: Scalars['String'];
  /** Quote name of the instrument */
  quoteName: Scalars['String'];
  /** Underlying asset for the perpetual instrument */
  settlementAsset: Asset;
};

/** Details of a  perpetual product. */
export type PerpetualData = {
  __typename?: 'PerpetualData';
  /** Time-weighted average price calculated from data points for this period from the external data source. */
  externalTwap?: Maybe<Scalars['String']>;
  /** Funding payment for this period as the difference between the time-weighted average price of the external and internal data point. */
  fundingPayment?: Maybe<Scalars['String']>;
  /** Percentage difference between the time-weighted average price of the external and internal data point. */
  fundingRate?: Maybe<Scalars['String']>;
  /** Time-weighted average price calculated from data points for this period from the internal data source. */
  internalTwap?: Maybe<Scalars['String']>;
};

export type PerpetualProduct = {
  __typename?: 'PerpetualProduct';
  /** Lower bound for the clamp function used as part of the funding rate calculation, in the range [-1, 1] */
  clampLowerBound: Scalars['String'];
  /** Upper bound for the clamp function used as part of the funding rate calculation, in the range [-1, 1] */
  clampUpperBound: Scalars['String'];
  /** Binding between the data source spec and the settlement data */
  dataSourceSpecBinding: DataSourceSpecPerpetualBinding;
  /** Data source specification describing the data source for settlement */
  dataSourceSpecForSettlementData: DataSourceDefinition;
  /** Data source specification describing the data source for settlement schedule */
  dataSourceSpecForSettlementSchedule: DataSourceDefinition;
  /** Continuously compounded interest rate used in funding rate calculation, in the range [-1, 1] */
  interestRate: Scalars['String'];
  /** Controls how much the upcoming funding payment liability contributes to party's margin, in the range [0, 1] */
  marginFundingFactor: Scalars['String'];
  /** Quote name of the instrument */
  quoteName: Scalars['String'];
  /** Underlying asset for the perpetual instrument */
  settlementAsset: Asset;
};

/**
 * An individual party at any point in time is considered net long or net short. This refers to their Open Volume,
 * calculated using FIFO. This volume is signed as either negative for LONG positions and positive for SHORT positions. A
 * single trade may end up "splitting" with some of its volume matched into closed volume and some of its volume
 * remaining as open volume. This is why we don't refer to positions being comprised of trades, rather of volume.
 */
export type Position = {
  __typename?: 'Position';
  /** Average entry price for this position */
  averageEntryPrice: Scalars['String'];
  /** The total amount of profit and loss that was not transferred due to loss socialisation */
  lossSocializationAmount: Scalars['String'];
  /** Margins of the party for the given position */
  marginsConnection?: Maybe<MarginConnection>;
  /** Market relating to this position */
  market: Market;
  /** Open volume (int64) */
  openVolume: Scalars['String'];
  /** The party holding this position */
  party: Party;
  /** Enum set if the position was closed out or orders were removed because party was distressed */
  positionStatus: PositionStatus;
  /** Realised Profit and Loss (int64) */
  realisedPNL: Scalars['String'];
  /** Unrealised Profit and Loss (int64) */
  unrealisedPNL: Scalars['String'];
  /** RFC3339Nano time the position was updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};


/**
 * An individual party at any point in time is considered net long or net short. This refers to their Open Volume,
 * calculated using FIFO. This volume is signed as either negative for LONG positions and positive for SHORT positions. A
 * single trade may end up "splitting" with some of its volume matched into closed volume and some of its volume
 * remaining as open volume. This is why we don't refer to positions being comprised of trades, rather of volume.
 */
export type PositionmarginsConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};

/** Connection type for retrieving cursor-based paginated position information */
export type PositionConnection = {
  __typename?: 'PositionConnection';
  /** The positions in this connection */
  edges?: Maybe<Array<PositionEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the position and cursor information returned by a PositionConnection */
export type PositionEdge = {
  __typename?: 'PositionEdge';
  /** The cursor for this position */
  cursor?: Maybe<Scalars['String']>;
  /** The position */
  node: Position;
};

/** Response for the estimate of the margin level and, if available, collateral was provided in the request, liquidation price for the specified position */
export type PositionEstimate = {
  __typename?: 'PositionEstimate';
  /** Liquidation price range estimate for the specified position. Only populated if available collateral was specified in the request */
  liquidation?: Maybe<LiquidationEstimate>;
  /** Margin level range estimate for the specified position */
  margin: MarginEstimate;
};

export type PositionResolution = {
  __typename?: 'PositionResolution';
  /** Number of parties closed out */
  closed: Scalars['Int'];
  /** Number of distressed parties on market */
  distressed: Scalars['Int'];
  /** The mark price at which parties were distressed/closed out */
  markPrice: Scalars['String'];
  /** The market ID where position resolution happened */
  marketId: Scalars['ID'];
};

/** Position status can change if a position is distressed */
export enum PositionStatus {
  /** The position was distressed, and had to be closed out entirely - orders were removed from the book, and the open volume was closed out by the network */
  POSITION_STATUS_CLOSED_OUT = 'POSITION_STATUS_CLOSED_OUT',
  /** The position was distressed, but could not be closed out - orders were removed from the book, and the open volume will be closed out once there is sufficient volume on the book */
  POSITION_STATUS_DISTRESSED = 'POSITION_STATUS_DISTRESSED',
  /** The position was distressed, but removing open orders from the book brought the margin level back to a point where the open position could be maintained */
  POSITION_STATUS_ORDERS_CLOSED = 'POSITION_STATUS_ORDERS_CLOSED',
  /** The position is either healthy, or if closed out, was closed out normally */
  POSITION_STATUS_UNSPECIFIED = 'POSITION_STATUS_UNSPECIFIED'
}

/**
 * An individual party at any point in time is considered net long or net short. This refers to their Open Volume,
 * calculated using FIFO. This volume is signed as either negative for LONG positions and positive for SHORT positions. A
 * single trade may end up "splitting" with some of its volume matched into closed volume and some of its volume
 * remaining as open volume. This is why we don't refer to positions being comprised of trades, rather of volume.
 */
export type PositionUpdate = {
  __typename?: 'PositionUpdate';
  /** Average entry price for this position */
  averageEntryPrice: Scalars['String'];
  /** The total amount of profit and loss that was not transferred due to loss socialisation */
  lossSocializationAmount: Scalars['String'];
  /** Market relating to this position */
  marketId: Scalars['ID'];
  /** Open volume (int64) */
  openVolume: Scalars['String'];
  /** The party holding this position */
  partyId: Scalars['ID'];
  /** Enum set if the position was closed out or orders were removed because party was distressed */
  positionStatus: PositionStatus;
  /** Realised Profit and Loss (int64) */
  realisedPNL: Scalars['String'];
  /** Unrealised Profit and Loss (int64) */
  unrealisedPNL: Scalars['String'];
  /** RFC3339Nano time the position was updated */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

/** Filter to apply to the positions connection query */
export type PositionsFilter = {
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  partyIds?: InputMaybe<Array<Scalars['ID']>>;
};

/** Represents a price on either the buy or sell side and all the orders at that price */
export type PriceLevel = {
  __typename?: 'PriceLevel';
  /** The number of orders at this price level (uint64) */
  numberOfOrders: Scalars['String'];
  /** The price of all the orders at this level (uint64) */
  price: Scalars['String'];
  /** The total remaining size of all orders at this level (uint64) */
  volume: Scalars['String'];
};

/** Range of valid prices and the associated price monitoring trigger */
export type PriceMonitoringBounds = {
  __typename?: 'PriceMonitoringBounds';
  /** Maximum price that isn't currently breaching the specified price monitoring trigger */
  maxValidPrice: Scalars['String'];
  /** Minimum price that isn't currently breaching the specified price monitoring trigger */
  minValidPrice: Scalars['String'];
  /** Reference price used to calculate the valid price range */
  referencePrice: Scalars['String'];
  /** Price monitoring trigger associated with the bounds */
  trigger: PriceMonitoringTrigger;
};

/** PriceMonitoringParameters holds a list of triggers */
export type PriceMonitoringParameters = {
  __typename?: 'PriceMonitoringParameters';
  /** The list of triggers for this price monitoring */
  triggers?: Maybe<Array<PriceMonitoringTrigger>>;
};

/** Configuration of a market price monitoring auctions triggers */
export type PriceMonitoringSettings = {
  __typename?: 'PriceMonitoringSettings';
  /** Specified a set of PriceMonitoringParameters to be use for price monitoring purposes */
  parameters?: Maybe<PriceMonitoringParameters>;
};

/** PriceMonitoringTrigger holds together price projection horizon τ, probability level p, and auction extension duration */
export type PriceMonitoringTrigger = {
  __typename?: 'PriceMonitoringTrigger';
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach its theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: Scalars['Int'];
  /** Price monitoring projection horizon τ in seconds (> 0). */
  horizonSecs: Scalars['Int'];
  /** Price monitoring probability level p. (>0 and < 1) */
  probability: Scalars['Float'];
};

export type Product = Future | Perpetual | Spot;

export type ProductConfiguration = FutureProduct | PerpetualProduct | SpotProduct;

export type ProductData = PerpetualData;

/** A property associates a name to a value */
export type Property = {
  __typename?: 'Property';
  /** Name of the property */
  name: Scalars['String'];
  /** Value of the property */
  value: Scalars['String'];
};

/** PropertyKey describes the property key contained in a source data. */
export type PropertyKey = {
  __typename?: 'PropertyKey';
  /** The name of the property. */
  name?: Maybe<Scalars['String']>;
  /**
   * An optional decimal place to be applied on the provided value.
   * Valid only for PropertyType of type DECIMAL, INTEGER.
   */
  numberDecimalPlaces?: Maybe<Scalars['Int']>;
  /** The type of the property. */
  type: PropertyKeyType;
};

/**
 * Type describes the type of properties that are supported by the data source
 * engine.
 */
export enum PropertyKeyType {
  /** Boolean type. */
  TYPE_BOOLEAN = 'TYPE_BOOLEAN',
  /** Any floating point decimal type. */
  TYPE_DECIMAL = 'TYPE_DECIMAL',
  /** Any type. */
  TYPE_EMPTY = 'TYPE_EMPTY',
  /** Integer type. */
  TYPE_INTEGER = 'TYPE_INTEGER',
  /** String type. */
  TYPE_STRING = 'TYPE_STRING',
  /** Timestamp date type. */
  TYPE_TIMESTAMP = 'TYPE_TIMESTAMP'
}

export type Proposal = {
  __typename?: 'Proposal';
  /** RFC3339Nano time and date when the proposal reached Vega network */
  datetime: Scalars['Timestamp'];
  /** Error details of the rejectionReason */
  errorDetails?: Maybe<Scalars['String']>;
  /** Proposal ID that is filled by Vega once proposal reaches the network */
  id?: Maybe<Scalars['ID']>;
  /** Party that prepared the proposal */
  party: Party;
  /** Rationale behind the proposal */
  rationale: ProposalRationale;
  /** A UUID reference to aid tracking proposals on Vega */
  reference: Scalars['String'];
  /** Why the proposal was rejected by the core */
  rejectionReason?: Maybe<ProposalRejectionReason>;
  /** Equity-like share required for a market amendment proposal to be enacted (if not met, the proposal will not be enacted), represented as a fraction that can be converted to a percentage */
  requiredLpMajority?: Maybe<Scalars['String']>;
  /** The market share of LPs' equity-like share that must take part in the market amendment vote for the proposal to pass. This means the votes of LPs that have submitted more liquidity to that market, or have been LPs from the start carry more weight. If it requires 50% of a market's equity-like share for a majority, and the proposal receives only YES votes but only LPs with 49% of the equity-like share voted, the proposal will not pass */
  requiredLpParticipation?: Maybe<Scalars['String']>;
  /** Required majority for this proposal to succeed */
  requiredMajority: Scalars['String'];
  /** Required participation for this proposal to succeed */
  requiredParticipation: Scalars['String'];
  /** State of the proposal */
  state: ProposalState;
  /** Terms of the proposal */
  terms: ProposalTerms;
  /** Votes cast for this proposal */
  votes: ProposalVotes;
};

export type ProposalChange = CancelTransfer | NewAsset | NewFreeform | NewMarket | NewSpotMarket | NewTransfer | UpdateAsset | UpdateMarket | UpdateMarketState | UpdateNetworkParameter | UpdateReferralProgram | UpdateSpotMarket | UpdateVolumeDiscountProgram;

export type ProposalDetail = {
  __typename?: 'ProposalDetail';
  /** RFC3339Nano time and date when the proposal reached the Vega network */
  datetime: Scalars['Timestamp'];
  /** Error details of the rejectionReason */
  errorDetails?: Maybe<Scalars['String']>;
  /** Proposal ID that is provided by Vega once proposal reaches the network */
  id?: Maybe<Scalars['ID']>;
  /** Party that prepared the proposal */
  party: Party;
  /** Rationale behind the proposal */
  rationale: ProposalRationale;
  /** A UUID reference to aid tracking proposals on Vega */
  reference: Scalars['String'];
  /** Why the proposal was rejected by the core */
  rejectionReason?: Maybe<ProposalRejectionReason>;
  /** Equity-like share required for a market amendment proposal to be enacted (if not met, the proposal will not be enacted), represented as a fraction that can be converted to a percentage */
  requiredLpMajority?: Maybe<Scalars['String']>;
  /** The market share of LPs' equity-like share that must take part in the market amendment vote for the proposal to pass. This means the votes of LPs that have submitted more liquidity to that market, or have been LPs from the start carry more weight. If it requires 50% of a market's equity-like share for a majority, and the proposal receives only YES votes but only LPs with 49% of the equity-like share voted, the proposal will not pass */
  requiredLpParticipation?: Maybe<Scalars['String']>;
  /** Required majority for this proposal to succeed */
  requiredMajority: Scalars['String'];
  /** Required participation for this proposal to succeed */
  requiredParticipation: Scalars['String'];
  /** State of the proposal */
  state: ProposalState;
  /** Terms of the proposal */
  terms: ProposalTerms;
};

/** Edge type containing the proposals and cursor information returned by a ProposalsConnection */
export type ProposalEdge = {
  __typename?: 'ProposalEdge';
  /** Cursor identifying the proposal */
  cursor: Scalars['String'];
  /** The proposal data */
  node: Proposal;
};

export type ProposalRationale = {
  __typename?: 'ProposalRationale';
  /**
   * Description to show a short title / something in case the link goes offline.
   * This is to be between 0 and 20k unicode characters.
   * This is mandatory for all proposals.
   */
  description: Scalars['String'];
  /**
   * Title to be used to give a short description of the proposal in lists.
   * This is to be between 0 and 100 unicode characters.
   * This is mandatory for all proposals.
   */
  title: Scalars['String'];
};

/** Why the proposal was rejected by the core node */
export enum ProposalRejectionReason {
  /** The specified close time is too late based on network parameters */
  PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE = 'PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE',
  /** The specified close time is too early based on network parameters */
  PROPOSAL_ERROR_CLOSE_TIME_TOO_SOON = 'PROPOSAL_ERROR_CLOSE_TIME_TOO_SOON',
  /** Market could not be created */
  PROPOSAL_ERROR_COULD_NOT_INSTANTIATE_MARKET = 'PROPOSAL_ERROR_COULD_NOT_INSTANTIATE_MARKET',
  /** The specified enactment time is too late based on network parameters */
  PROPOSAL_ERROR_ENACT_TIME_TOO_LATE = 'PROPOSAL_ERROR_ENACT_TIME_TOO_LATE',
  /** The specified enactment time is too early based on network parameters */
  PROPOSAL_ERROR_ENACT_TIME_TOO_SOON = 'PROPOSAL_ERROR_ENACT_TIME_TOO_SOON',
  /** The ERC-20 address specified by this proposal is already in use by another asset */
  PROPOSAL_ERROR_ERC20_ADDRESS_ALREADY_IN_USE = 'PROPOSAL_ERROR_ERC20_ADDRESS_ALREADY_IN_USE',
  /** The proposal for cancellation of an active governance transfer has failed */
  PROPOSAL_ERROR_GOVERNANCE_CANCEL_TRANSFER_PROPOSAL_INVALID = 'PROPOSAL_ERROR_GOVERNANCE_CANCEL_TRANSFER_PROPOSAL_INVALID',
  /** The governance transfer proposal has failed */
  PROPOSAL_ERROR_GOVERNANCE_TRANSFER_PROPOSAL_FAILED = 'PROPOSAL_ERROR_GOVERNANCE_TRANSFER_PROPOSAL_FAILED',
  /** The governance transfer proposal is invalid */
  PROPOSAL_ERROR_GOVERNANCE_TRANSFER_PROPOSAL_INVALID = 'PROPOSAL_ERROR_GOVERNANCE_TRANSFER_PROPOSAL_INVALID',
  /** Proposal terms timestamps are not compatible (Validation < Closing < Enactment) */
  PROPOSAL_ERROR_INCOMPATIBLE_TIMESTAMPS = 'PROPOSAL_ERROR_INCOMPATIBLE_TIMESTAMPS',
  /** The proposal is rejected because the party does not have enough equity like share in the market */
  PROPOSAL_ERROR_INSUFFICIENT_EQUITY_LIKE_SHARE = 'PROPOSAL_ERROR_INSUFFICIENT_EQUITY_LIKE_SHARE',
  /** The proposer for this proposal has insufficient tokens */
  PROPOSAL_ERROR_INSUFFICIENT_TOKENS = 'PROPOSAL_ERROR_INSUFFICIENT_TOKENS',
  /** The specified asset for the market proposal is invalid */
  PROPOSAL_ERROR_INVALID_ASSET = 'PROPOSAL_ERROR_INVALID_ASSET',
  /** Asset details are invalid */
  PROPOSAL_ERROR_INVALID_ASSET_DETAILS = 'PROPOSAL_ERROR_INVALID_ASSET_DETAILS',
  /** Market proposal has invalid fee amount */
  PROPOSAL_ERROR_INVALID_FEE_AMOUNT = 'PROPOSAL_ERROR_INVALID_FEE_AMOUNT',
  /** Freeform proposal is invalid */
  PROPOSAL_ERROR_INVALID_FREEFORM = 'PROPOSAL_ERROR_INVALID_FREEFORM',
  /** Market proposal market contained invalid product definition */
  PROPOSAL_ERROR_INVALID_FUTURE_PRODUCT = 'PROPOSAL_ERROR_INVALID_FUTURE_PRODUCT',
  /** The instrument quote name and base name were the same */
  PROPOSAL_ERROR_INVALID_INSTRUMENT_SECURITY = 'PROPOSAL_ERROR_INVALID_INSTRUMENT_SECURITY',
  /** The market is invalid */
  PROPOSAL_ERROR_INVALID_MARKET = 'PROPOSAL_ERROR_INVALID_MARKET',
  /** Validation of market state update has failed */
  PROPOSAL_ERROR_INVALID_MARKET_STATE_UPDATE = 'PROPOSAL_ERROR_INVALID_MARKET_STATE_UPDATE',
  /** Perpetual market proposal contained invalid product definition */
  PROPOSAL_ERROR_INVALID_PERPETUAL_PRODUCT = 'PROPOSAL_ERROR_INVALID_PERPETUAL_PRODUCT',
  /** Market proposal uses an invalid risk parameter */
  PROPOSAL_ERROR_INVALID_RISK_PARAMETER = 'PROPOSAL_ERROR_INVALID_RISK_PARAMETER',
  /** Market proposal has one or more invalid liquidity shapes */
  PROPOSAL_ERROR_INVALID_SHAPE = 'PROPOSAL_ERROR_INVALID_SHAPE',
  /** Mandatory liquidity provision SLA parameters are missing from the proposal */
  PROPOSAL_ERROR_INVALID_SLA_PARAMS = 'PROPOSAL_ERROR_INVALID_SLA_PARAMS',
  /** Validation of spot market proposal failed */
  PROPOSAL_ERROR_INVALID_SPOT = 'PROPOSAL_ERROR_INVALID_SPOT',
  /** Validation of successor market has failed */
  PROPOSAL_ERROR_INVALID_SUCCESSOR_MARKET = 'PROPOSAL_ERROR_INVALID_SUCCESSOR_MARKET',
  /** Proposal declined because the majority threshold was not reached */
  PROPOSAL_ERROR_MAJORITY_THRESHOLD_NOT_REACHED = 'PROPOSAL_ERROR_MAJORITY_THRESHOLD_NOT_REACHED',
  /** Market proposal is missing a liquidity commitment */
  PROPOSAL_ERROR_MARKET_MISSING_LIQUIDITY_COMMITMENT = 'PROPOSAL_ERROR_MARKET_MISSING_LIQUIDITY_COMMITMENT',
  /** A builtin asset configuration is missing */
  PROPOSAL_ERROR_MISSING_BUILTIN_ASSET_FIELD = 'PROPOSAL_ERROR_MISSING_BUILTIN_ASSET_FIELD',
  /** Market proposal is missing commitment amount */
  PROPOSAL_ERROR_MISSING_COMMITMENT_AMOUNT = 'PROPOSAL_ERROR_MISSING_COMMITMENT_AMOUNT',
  /** The ERC20 contract address is missing from an ERC20 asset proposal */
  PROPOSAL_ERROR_MISSING_ERC20_CONTRACT_ADDRESS = 'PROPOSAL_ERROR_MISSING_ERC20_CONTRACT_ADDRESS',
  /** Validation of liquidity provision SLA parameters has failed */
  PROPOSAL_ERROR_MISSING_SLA_PARAMS = 'PROPOSAL_ERROR_MISSING_SLA_PARAMS',
  /** Invalid key in update network parameter proposal */
  PROPOSAL_ERROR_NETWORK_PARAMETER_INVALID_KEY = 'PROPOSAL_ERROR_NETWORK_PARAMETER_INVALID_KEY',
  /** Invalid value in update network parameter proposal */
  PROPOSAL_ERROR_NETWORK_PARAMETER_INVALID_VALUE = 'PROPOSAL_ERROR_NETWORK_PARAMETER_INVALID_VALUE',
  /** Validation failed for network parameter proposal */
  PROPOSAL_ERROR_NETWORK_PARAMETER_VALIDATION_FAILED = 'PROPOSAL_ERROR_NETWORK_PARAMETER_VALIDATION_FAILED',
  /** The proposal failed node validation */
  PROPOSAL_ERROR_NODE_VALIDATION_FAILED = 'PROPOSAL_ERROR_NODE_VALIDATION_FAILED',
  /** The proposal has no product specified */
  PROPOSAL_ERROR_NO_PRODUCT = 'PROPOSAL_ERROR_NO_PRODUCT',
  /** Risk parameters are missing from the market proposal */
  PROPOSAL_ERROR_NO_RISK_PARAMETERS = 'PROPOSAL_ERROR_NO_RISK_PARAMETERS',
  /** The proposal has no trading mode */
  PROPOSAL_ERROR_NO_TRADING_MODE = 'PROPOSAL_ERROR_NO_TRADING_MODE',
  /** Opening auction duration is more than the network minimum opening auction time */
  PROPOSAL_ERROR_OPENING_AUCTION_DURATION_TOO_LARGE = 'PROPOSAL_ERROR_OPENING_AUCTION_DURATION_TOO_LARGE',
  /** Opening auction duration is less than the network minimum opening auction time */
  PROPOSAL_ERROR_OPENING_AUCTION_DURATION_TOO_SMALL = 'PROPOSAL_ERROR_OPENING_AUCTION_DURATION_TOO_SMALL',
  /** Proposal declined because the participation threshold was not reached */
  PROPOSAL_ERROR_PARTICIPATION_THRESHOLD_NOT_REACHED = 'PROPOSAL_ERROR_PARTICIPATION_THRESHOLD_NOT_REACHED',
  /** Spot trading is disabled */
  PROPOSAL_ERROR_SPOT_PRODUCT_DISABLED = 'PROPOSAL_ERROR_SPOT_PRODUCT_DISABLED',
  /** Too many decimal places specified in market */
  PROPOSAL_ERROR_TOO_MANY_MARKET_DECIMAL_PLACES = 'PROPOSAL_ERROR_TOO_MANY_MARKET_DECIMAL_PLACES',
  /** Too many price monitoring triggers specified in market */
  PROPOSAL_ERROR_TOO_MANY_PRICE_MONITORING_TRIGGERS = 'PROPOSAL_ERROR_TOO_MANY_PRICE_MONITORING_TRIGGERS',
  /** Unknown risk parameters */
  PROPOSAL_ERROR_UNKNOWN_RISK_PARAMETER_TYPE = 'PROPOSAL_ERROR_UNKNOWN_RISK_PARAMETER_TYPE',
  /** Unknown proposal type */
  PROPOSAL_ERROR_UNKNOWN_TYPE = 'PROPOSAL_ERROR_UNKNOWN_TYPE',
  /** The specified product is not supported */
  PROPOSAL_ERROR_UNSUPPORTED_PRODUCT = 'PROPOSAL_ERROR_UNSUPPORTED_PRODUCT',
  /** The proposal has an unsupported trading mode */
  PROPOSAL_ERROR_UNSUPPORTED_TRADING_MODE = 'PROPOSAL_ERROR_UNSUPPORTED_TRADING_MODE'
}

/**
 * Various states a proposal can transition through:
 * Open ->
 * - Passed -> Enacted.
 * - Rejected.
 * Proposal can enter Failed state from any other state.
 */
export enum ProposalState {
  /** Proposal didn't get enough votes */
  STATE_DECLINED = 'STATE_DECLINED',
  /** Proposal has been executed and the changes under this proposal have now been applied */
  STATE_ENACTED = 'STATE_ENACTED',
  /** Proposal became invalid and cannot be processed */
  STATE_FAILED = 'STATE_FAILED',
  /** Proposal is open for voting */
  STATE_OPEN = 'STATE_OPEN',
  /** Proposal has gained enough support to be executed */
  STATE_PASSED = 'STATE_PASSED',
  /** Proposal could not gain enough support to be executed */
  STATE_REJECTED = 'STATE_REJECTED',
  /** Proposal is waiting for the node to run validation */
  STATE_WAITING_FOR_NODE_VOTE = 'STATE_WAITING_FOR_NODE_VOTE'
}

/** The rationale behind the proposal */
export type ProposalTerms = {
  __typename?: 'ProposalTerms';
  /** Actual change being introduced by the proposal - action the proposal triggers if passed and enacted. */
  change: ProposalChange;
  /**
   * RFC3339Nano time and date when voting closes for this proposal.
   * Constrained by "minClose" and "maxClose" network parameters.
   */
  closingDatetime: Scalars['Timestamp'];
  /**
   * RFC3339Nano time and date when this proposal is executed (if passed). Note that it has to be after closing date time.
   * Constrained by "minEnactInSeconds" and "maxEnactInSeconds" network parameters.
   * Note: Optional as free form proposals do not require it.
   */
  enactmentDatetime?: Maybe<Scalars['Timestamp']>;
  /** RFC3339Nano time and when node validation of the proposal stops, accepted only with new asset proposals */
  validationDatetime?: Maybe<Scalars['Timestamp']>;
};

/** Various proposal types that are supported by Vega */
export enum ProposalType {
  /** Proposal to cancel a transfer */
  TYPE_CANCEL_TRANSFER = 'TYPE_CANCEL_TRANSFER',
  /** Proposal to change Vega network parameters */
  TYPE_NETWORK_PARAMETERS = 'TYPE_NETWORK_PARAMETERS',
  /** Proposal to add a new asset */
  TYPE_NEW_ASSET = 'TYPE_NEW_ASSET',
  /** Proposal to create a new freeform proposal */
  TYPE_NEW_FREE_FORM = 'TYPE_NEW_FREE_FORM',
  /** Propose a new market */
  TYPE_NEW_MARKET = 'TYPE_NEW_MARKET',
  /** Propose a new spot market */
  TYPE_NEW_SPOT_MARKET = 'TYPE_NEW_SPOT_MARKET',
  /** Propose a new transfer */
  TYPE_NEW_TRANSFER = 'TYPE_NEW_TRANSFER',
  /** Proposal to update an existing asset */
  TYPE_UPDATE_ASSET = 'TYPE_UPDATE_ASSET',
  /** Update an existing market */
  TYPE_UPDATE_MARKET = 'TYPE_UPDATE_MARKET',
  /** Proposal for updating the state of a market */
  TYPE_UPDATE_MARKET_STATE = 'TYPE_UPDATE_MARKET_STATE',
  /** Proposal to update the referral program */
  TYPE_UPDATE_REFERRAL_PROGRAM = 'TYPE_UPDATE_REFERRAL_PROGRAM',
  /** Update an existing spot market */
  TYPE_UPDATE_SPOT_MARKET = 'TYPE_UPDATE_SPOT_MARKET',
  /** Proposal to update the volume discount program */
  TYPE_UPDATE_VOLUME_DISCOUNT_PROGRAM = 'TYPE_UPDATE_VOLUME_DISCOUNT_PROGRAM'
}

export type ProposalVote = {
  __typename?: 'ProposalVote';
  /** Proposal ID the vote is cast on */
  proposalId: Scalars['ID'];
  /** Cast vote */
  vote: Vote;
};

/** Connection type for retrieving cursor-based paginated proposal vote information */
export type ProposalVoteConnection = {
  __typename?: 'ProposalVoteConnection';
  /** The proposal votes in this connection */
  edges?: Maybe<Array<ProposalVoteEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the proposal vote and cursor information returned by a ProposalVoteConnection */
export type ProposalVoteEdge = {
  __typename?: 'ProposalVoteEdge';
  /** The cursor for this proposal vote */
  cursor?: Maybe<Scalars['String']>;
  /** The proposal vote */
  node: ProposalVote;
};

export type ProposalVoteSide = {
  __typename?: 'ProposalVoteSide';
  /** Total equity like share weight for this side (only for UpdateMarket Proposals) */
  totalEquityLikeShareWeight: Scalars['String'];
  /** Total number of votes cast for this side */
  totalNumber: Scalars['String'];
  /** Total number of governance tokens from the votes cast for this side */
  totalTokens: Scalars['String'];
  /** Total weight of governance token from the votes cast for this side */
  totalWeight: Scalars['String'];
  /** All votes cast for this side */
  votes?: Maybe<Array<Vote>>;
};

export type ProposalVotes = {
  __typename?: 'ProposalVotes';
  /** No votes cast for this proposal */
  no: ProposalVoteSide;
  /** Yes votes cast for this proposal */
  yes: ProposalVoteSide;
};

/** Connection type for retrieving cursor-based paginated proposals information */
export type ProposalsConnection = {
  __typename?: 'ProposalsConnection';
  /** List of proposals available for the connection */
  edges?: Maybe<Array<Maybe<ProposalEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/** A proposal to upgrade the vega protocol (i.e. which version of the vega software nodes will run) */
export type ProtocolUpgradeProposal = {
  __typename?: 'ProtocolUpgradeProposal';
  /** Tendermint validators that have agreed to the upgrade */
  approvers: Array<Scalars['String']>;
  /** the status of the proposal */
  status: ProtocolUpgradeProposalStatus;
  /** At which block the upgrade is proposed */
  upgradeBlockHeight: Scalars['String'];
  /** To which vega release tag the upgrade is proposed */
  vegaReleaseTag: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated protocol upgrade proposals */
export type ProtocolUpgradeProposalConnection = {
  __typename?: 'ProtocolUpgradeProposalConnection';
  /** The positions in this connection */
  edges?: Maybe<Array<ProtocolUpgradeProposalEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the protocol upgrade protocol cursor information */
export type ProtocolUpgradeProposalEdge = {
  __typename?: 'ProtocolUpgradeProposalEdge';
  /** Cursor identifying the protocol upgrade proposal */
  cursor: Scalars['String'];
  /** The protocol upgrade proposal */
  node: ProtocolUpgradeProposal;
};

/** The set of valid statuses for a protocol upgrade proposal */
export enum ProtocolUpgradeProposalStatus {
  /** Proposal to upgrade protocol version accepted */
  PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED = 'PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED',
  /** Proposal to upgrade protocol version is awaiting sufficient validator approval */
  PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING = 'PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING',
  /** Proposal to upgrade protocol version has been rejected */
  PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED = 'PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED',
  /** Invalid proposal state */
  PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED = 'PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED'
}

/** Indicator showing whether the data-node is ready for the protocol upgrade to begin. */
export type ProtocolUpgradeStatus = {
  __typename?: 'ProtocolUpgradeStatus';
  ready: Scalars['Boolean'];
};

export type PubKey = {
  __typename?: 'PubKey';
  key?: Maybe<Scalars['String']>;
};

/** Queries allow a caller to read data and filter data via GraphQL. */
export type Query = {
  __typename?: 'Query';
  /** An asset which is used in the vega network */
  asset?: Maybe<Asset>;
  /** The list of all assets in use in the Vega network or the specified asset if ID is provided */
  assetsConnection?: Maybe<AssetsConnection>;
  /** Get historical balances for an account within the given date range */
  balanceChanges: AggregatedBalanceConnection;
  /** List core snapshots */
  coreSnapshots?: Maybe<CoreSnapshotConnection>;
  /** Get the current referral program */
  currentReferralProgram?: Maybe<CurrentReferralProgram>;
  /** Get the current volume discount program */
  currentVolumeDiscountProgram?: Maybe<VolumeDiscountProgram>;
  /** Find a deposit using its ID */
  deposit?: Maybe<Deposit>;
  /** Fetch all deposits */
  deposits?: Maybe<DepositsConnection>;
  /** Fetch all entities for a given transaction hash */
  entities: Entities;
  /** Get data for a specific epoch, if ID omitted it gets the current epoch. If the string is 'next', fetch the next epoch */
  epoch: Epoch;
  /** List reward summary per epoch by asset, market, reward type */
  epochRewardSummaries?: Maybe<EpochRewardSummaryConnection>;
  /** Get the signatures bundle to allowlist an ERC20 token in the collateral bridge */
  erc20ListAssetBundle?: Maybe<Erc20ListAssetBundle>;
  /** Get the signature bundle to add a particular validator to the signer list of the multisig contract */
  erc20MultiSigSignerAddedBundles: ERC20MultiSigSignerAddedConnection;
  /** Get the signatures bundle to remove a particular validator from signer list of the multisig contract */
  erc20MultiSigSignerRemovedBundles: ERC20MultiSigSignerRemovedConnection;
  /** Get the signature bundle to update the token limits (maxLifetimeDeposit and withdrawThreshold) for a given ERC20 token (already allowlisted) in the collateral bridge */
  erc20SetAssetLimitsBundle: ERC20SetAssetLimitsBundle;
  /** Find an erc20 withdrawal approval using its withdrawal ID */
  erc20WithdrawalApproval?: Maybe<Erc20WithdrawalApproval>;
  /** Return an estimation of the potential cost for a new order */
  estimateFees: FeeEstimate;
  /**
   * Return an estimation of the potential cost for a new order
   * @deprecated Use estimateFees and estimatePosition instead
   */
  estimateOrder: OrderEstimate;
  /** Return a margin range for the specified position and liquidation price range if available collateral is supplied */
  estimatePosition?: Maybe<PositionEstimate>;
  /** Query for historic ethereum key rotations */
  ethereumKeyRotations: EthereumKeyRotationsConnection;
  /** Get fees statistics */
  feesStats?: Maybe<FeesStats>;
  /** Funding payment for perpetual markets. */
  fundingPayments: FundingPaymentConnection;
  /**
   * Funding period data points for a perpetual market. The data points within a funding period are used to calculate the
   * time-weighted average price (TWAP), funding rate and funding payments for each funding period.
   */
  fundingPeriodDataPoints: FundingPeriodDataPointConnection;
  /** Funding periods for perpetual markets */
  fundingPeriods: FundingPeriodConnection;
  /** Get market data history for a specific market. If no dates are given, the latest snapshot will be returned. If only the start date is provided all history from the given date will be provided, and if only the end date is provided, all history from the start up to and including the end date will be provided. */
  getMarketDataHistoryConnectionByID?: Maybe<MarketDataConnection>;
  /** Query for historic key rotations */
  keyRotationsConnection: KeyRotationConnection;
  /** The last block process by the blockchain */
  lastBlockHeight: Scalars['String'];
  /** Get ledger entries by asset, market, party, account type, transfer type within the given date range. */
  ledgerEntries: AggregatedLedgerEntriesConnection;
  /** List all active liquidity providers for a specific market */
  liquidityProviders?: Maybe<LiquidityProviderConnection>;
  /** An instrument that is trading on the Vega network */
  market?: Maybe<Market>;
  /** One or more instruments that are trading on the Vega network */
  marketsConnection?: Maybe<MarketConnection>;
  /** The most recent history segment */
  mostRecentHistorySegment: HistorySegment;
  /** Current network limits */
  networkLimits?: Maybe<NetworkLimits>;
  /** Return a single network parameter */
  networkParameter?: Maybe<NetworkParameter>;
  /** Return the full list of network parameters */
  networkParametersConnection: NetworkParametersConnection;
  /** Specific node in network */
  node?: Maybe<Node>;
  /** Returns information about nodes */
  nodeData?: Maybe<NodeData>;
  /** Return a list of aggregated node signature for a given resource ID */
  nodeSignaturesConnection?: Maybe<NodeSignaturesConnection>;
  /** All known network nodes */
  nodesConnection: NodesConnection;
  /** All oracle data for a given oracle spec ID */
  oracleDataBySpecConnection?: Maybe<OracleDataConnection>;
  /** All registered oracle specs */
  oracleDataConnection?: Maybe<OracleDataConnection>;
  /** An oracle spec for a given oracle spec ID */
  oracleSpec?: Maybe<OracleSpec>;
  /** All registered oracle specs */
  oracleSpecsConnection?: Maybe<OracleSpecsConnection>;
  /** An order in the Vega network found by orderID */
  orderByID: Order;
  /** An order in the Vega network found by referenceID */
  orderByReference: Order;
  /** Order versions (created via amendments if any) found by orderID */
  orderVersionsConnection?: Maybe<OrderConnection>;
  /** One or more entities that are trading on the Vega network */
  partiesConnection?: Maybe<PartyConnection>;
  /** An entity that is trading on the Vega network */
  party?: Maybe<Party>;
  /** Fetch all positions */
  positions?: Maybe<PositionConnection>;
  /** A governance proposal located by either its ID or reference. If both are set, ID is used. */
  proposal?: Maybe<Proposal>;
  /** All governance proposals in the Vega network */
  proposalsConnection?: Maybe<ProposalsConnection>;
  /** List protocol upgrade proposals, optionally filtering on status or approver */
  protocolUpgradeProposals?: Maybe<ProtocolUpgradeProposalConnection>;
  /** Flag indicating whether the data-node is ready to begin the protocol upgrade */
  protocolUpgradeStatus?: Maybe<ProtocolUpgradeStatus>;
  referralSetReferees: ReferralSetRefereeConnection;
  /** Get referral set statistics */
  referralSetStats: ReferralSetStatsConnection;
  /** List referral sets */
  referralSets: ReferralSetConnection;
  /** Get statistics about the Vega node */
  statistics: Statistics;
  /** Get stop order by ID */
  stopOrder?: Maybe<StopOrder>;
  /** Get a list of stop orders. If provided, the filter will be applied to the list of stop orders to restrict the results. */
  stopOrders?: Maybe<StopOrderConnection>;
  /** List markets in a succession line */
  successorMarkets?: Maybe<SuccessorMarketConnection>;
  /** List a referee's team history */
  teamRefereeHistory?: Maybe<TeamRefereeHistoryConnection>;
  /** List all referees for a team */
  teamReferees?: Maybe<TeamRefereeConnection>;
  /**
   * List information about all teams or filter for a specific team ID or referrer, or referee's party ID
   * If no filter is provided all teams will be listed.
   * If a team ID is provided, only the team with that ID will be returned
   * If a party ID is provided, the team whose referrer party ID or a referee's party ID matches will be return
   * If both team ID and party ID is provided, only the team ID will be used.
   */
  teams?: Maybe<TeamConnection>;
  /** Get a list of all trades and apply any given filters to the results */
  trades?: Maybe<TradeConnection>;
  /** Find a transfer using its ID */
  transfer?: Maybe<Transfer>;
  /** Get a list of all transfers for a public key */
  transfersConnection?: Maybe<TransferConnection>;
  /** Get volume discount statistics */
  volumeDiscountStats: VolumeDiscountStatsConnection;
  /** Find a withdrawal using its ID */
  withdrawal?: Maybe<Withdrawal>;
  /** Fetch all withdrawals */
  withdrawals?: Maybe<WithdrawalsConnection>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryassetArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryassetsConnectionArgs = {
  id?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerybalanceChangesArgs = {
  dateRange?: InputMaybe<DateRange>;
  filter?: InputMaybe<AccountFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerycoreSnapshotsArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerydepositArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerydepositsArgs = {
  dateRange?: InputMaybe<DateRange>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryentitiesArgs = {
  txHash: Scalars['String'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryepochArgs = {
  block?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryepochRewardSummariesArgs = {
  filter?: InputMaybe<RewardSummaryFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type Queryerc20ListAssetBundleArgs = {
  assetId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type Queryerc20MultiSigSignerAddedBundlesArgs = {
  epochSeq?: InputMaybe<Scalars['String']>;
  nodeId: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
  submitter?: InputMaybe<Scalars['String']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type Queryerc20MultiSigSignerRemovedBundlesArgs = {
  epochSeq?: InputMaybe<Scalars['String']>;
  nodeId: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
  submitter?: InputMaybe<Scalars['String']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type Queryerc20SetAssetLimitsBundleArgs = {
  proposalId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type Queryerc20WithdrawalApprovalArgs = {
  withdrawalId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryestimateFeesArgs = {
  expiration?: InputMaybe<Scalars['Timestamp']>;
  marketId: Scalars['ID'];
  partyId: Scalars['ID'];
  price?: InputMaybe<Scalars['String']>;
  side: Side;
  size: Scalars['String'];
  timeInForce: OrderTimeInForce;
  type: OrderType;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryestimateOrderArgs = {
  expiration?: InputMaybe<Scalars['Timestamp']>;
  marketId: Scalars['ID'];
  partyId: Scalars['ID'];
  price?: InputMaybe<Scalars['String']>;
  side: Side;
  size: Scalars['String'];
  timeInForce: OrderTimeInForce;
  type: OrderType;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryestimatePositionArgs = {
  collateralAvailable?: InputMaybe<Scalars['String']>;
  marketId: Scalars['ID'];
  openVolume: Scalars['String'];
  orders?: InputMaybe<Array<OrderInfo>>;
  scaleLiquidationPriceToMarketDecimals?: InputMaybe<Scalars['Boolean']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryethereumKeyRotationsArgs = {
  nodeId?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryfeesStatsArgs = {
  assetId?: InputMaybe<Scalars['ID']>;
  epoch?: InputMaybe<Scalars['Int']>;
  marketId?: InputMaybe<Scalars['ID']>;
  referee?: InputMaybe<Scalars['ID']>;
  referrer?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryfundingPaymentsArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  partyId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryfundingPeriodDataPointsArgs = {
  dateRange?: InputMaybe<DateRange>;
  marketId: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
  source?: InputMaybe<FundingPeriodDataPointSource>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryfundingPeriodsArgs = {
  dateRange?: InputMaybe<DateRange>;
  marketId: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerygetMarketDataHistoryConnectionByIDArgs = {
  end?: InputMaybe<Scalars['Timestamp']>;
  id: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
  start?: InputMaybe<Scalars['Timestamp']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerykeyRotationsConnectionArgs = {
  id?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryledgerEntriesArgs = {
  dateRange?: InputMaybe<DateRange>;
  filter?: InputMaybe<LedgerEntryFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryliquidityProvidersArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerymarketArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerymarketsConnectionArgs = {
  id?: InputMaybe<Scalars['ID']>;
  includeSettled?: InputMaybe<Scalars['Boolean']>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerynetworkParameterArgs = {
  key: Scalars['String'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerynetworkParametersConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerynodeArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerynodeSignaturesConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
  resourceId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerynodesConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryoracleDataBySpecConnectionArgs = {
  oracleSpecId: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryoracleDataConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryoracleSpecArgs = {
  oracleSpecId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryoracleSpecsConnectionArgs = {
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryorderByIDArgs = {
  id: Scalars['ID'];
  version?: InputMaybe<Scalars['Int']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryorderByReferenceArgs = {
  reference: Scalars['String'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryorderVersionsConnectionArgs = {
  orderId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerypartiesConnectionArgs = {
  id?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerypartyArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerypositionsArgs = {
  filter?: InputMaybe<PositionsFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryproposalArgs = {
  id?: InputMaybe<Scalars['ID']>;
  reference?: InputMaybe<Scalars['String']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryproposalsConnectionArgs = {
  inState?: InputMaybe<ProposalState>;
  pagination?: InputMaybe<Pagination>;
  proposalType?: InputMaybe<ProposalType>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryprotocolUpgradeProposalsArgs = {
  approvedBy?: InputMaybe<Scalars['String']>;
  inState?: InputMaybe<ProtocolUpgradeProposalStatus>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryreferralSetRefereesArgs = {
  aggregationDays?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  referee?: InputMaybe<Scalars['ID']>;
  referrer?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryreferralSetStatsArgs = {
  epoch?: InputMaybe<Scalars['Int']>;
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
  setId?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryreferralSetsArgs = {
  id?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
  referee?: InputMaybe<Scalars['ID']>;
  referrer?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerystopOrderArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerystopOrdersArgs = {
  filter?: InputMaybe<StopOrderFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerysuccessorMarketsArgs = {
  fullHistory?: InputMaybe<Scalars['Boolean']>;
  marketId: Scalars['ID'];
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryteamRefereeHistoryArgs = {
  pagination?: InputMaybe<Pagination>;
  referee: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryteamRefereesArgs = {
  pagination?: InputMaybe<Pagination>;
  teamId: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryteamsArgs = {
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
  teamId?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerytradesArgs = {
  dateRange?: InputMaybe<DateRange>;
  filter?: InputMaybe<TradesFilter>;
  pagination?: InputMaybe<Pagination>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerytransferArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerytransfersConnectionArgs = {
  direction?: InputMaybe<TransferDirection>;
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QueryvolumeDiscountStatsArgs = {
  epoch?: InputMaybe<Scalars['Int']>;
  pagination?: InputMaybe<Pagination>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerywithdrawalArgs = {
  id: Scalars['ID'];
};


/** Queries allow a caller to read data and filter data via GraphQL. */
export type QuerywithdrawalsArgs = {
  dateRange?: InputMaybe<DateRange>;
  pagination?: InputMaybe<Pagination>;
};

export type RankTable = {
  __typename?: 'RankTable';
  shareRatio: Scalars['Int'];
  startRank: Scalars['Int'];
};

export type RankingScore = {
  __typename?: 'RankingScore';
  /** The performance score of the validator */
  performanceScore: Scalars['String'];
  /** The former validation status of the validator */
  previousStatus: ValidatorStatus;
  /** The ranking score of the validator */
  rankingScore: Scalars['String'];
  /** The stake based score of the validator (no anti-whaling) */
  stakeScore: Scalars['String'];
  /** The current validation status of the validator */
  status: ValidatorStatus;
  /** The Tendermint voting power of the validator (uint32) */
  votingPower: Scalars['String'];
};

/** The specific details for a recurring governance transfer */
export type RecurringGovernanceTransfer = {
  __typename?: 'RecurringGovernanceTransfer';
  /** An optional dispatch strategy for the recurring transfer */
  dispatchStrategy?: Maybe<DispatchStrategy>;
  /** An optional epoch at which this transfer will stop */
  endEpoch?: Maybe<Scalars['Int']>;
  /** The epoch at which this recurring transfer will start */
  startEpoch: Scalars['Int'];
};

/** The specific details for a recurring transfer */
export type RecurringTransfer = {
  __typename?: 'RecurringTransfer';
  /** An optional dispatch strategy for the recurring transfer */
  dispatchStrategy?: Maybe<DispatchStrategy>;
  /** An optional epoch at which this transfer will stop */
  endEpoch?: Maybe<Scalars['Int']>;
  /** The factor of the initial amount to be distributed */
  factor: Scalars['String'];
  /** The epoch at which this recurring transfer will start */
  startEpoch: Scalars['Int'];
};

/** Referral program information */
export type ReferralProgram = {
  __typename?: 'ReferralProgram';
  /** Defined tiers in increasing order. First element will give Tier 1, second element will give Tier 2, etc. */
  benefitTiers: Array<BenefitTier>;
  /** Timestamp as RFC3339, after which when the current epoch ends, the programs will end and benefits will be disabled. */
  endOfProgramTimestamp: Scalars['String'];
  /** Unique ID generated from the proposal that created this program. */
  id: Scalars['ID'];
  /**
   * Defined staking tiers in increasing order. First element will give Tier 1,
   * second element will give Tier 2, and so on. Determines the level of
   * benefit a party can expect based on their staking.
   */
  stakingTiers: Array<StakingTier>;
  /** Incremental version of the program. It is incremented each time the referral program is edited. */
  version: Scalars['Int'];
  /** Number of epochs over which to evaluate a referral set's running volume. */
  windowLength: Scalars['Int'];
};

/** Data relating to a referral set. */
export type ReferralSet = {
  __typename?: 'ReferralSet';
  /** Timestamp as RFC3339Nano when the referral set was created. */
  createdAt: Scalars['Timestamp'];
  /** Unique ID of the created set. */
  id: Scalars['ID'];
  /** Party that created the set. */
  referrer: Scalars['ID'];
  /** Timestamp as RFC3339Nano when the referral set was updated. */
  updatedAt: Scalars['Timestamp'];
};

/** Connection type for retrieving cursor-based paginated referral set information */
export type ReferralSetConnection = {
  __typename?: 'ReferralSetConnection';
  /** The referral sets in this connection */
  edges: Array<Maybe<ReferralSetEdge>>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the referral set and cursor information returned by a ReferralSetConnection */
export type ReferralSetEdge = {
  __typename?: 'ReferralSetEdge';
  /** The cursor for this referral set */
  cursor: Scalars['String'];
  /** The referral set */
  node: ReferralSet;
};

/** Data relating to referees that have joined a referral set */
export type ReferralSetReferee = {
  __typename?: 'ReferralSetReferee';
  /** Epoch in which the party joined the set. */
  atEpoch: Scalars['Int'];
  /** Timestamp as RFC3339Nano when the party joined the set. */
  joinedAt: Scalars['Timestamp'];
  /** Party that joined the set. */
  refereeId: Scalars['ID'];
  /** Unique ID of the referral set the referee joined. */
  referralSetId: Scalars['ID'];
  /** Total rewards generated from the referee over the aggregation period, default is 30 days. */
  totalRefereeGeneratedRewards: Scalars['String'];
  /** Total notional volume of the referee's aggressive trades over the aggregation period, default is 30 days. */
  totalRefereeNotionalTakerVolume: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated information about the referral set referees */
export type ReferralSetRefereeConnection = {
  __typename?: 'ReferralSetRefereeConnection';
  /** The referral set referees in this connection */
  edges: Array<Maybe<ReferralSetRefereeEdge>>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the referral set referee and cursor information returned by a ReferralSetRefereeConnection */
export type ReferralSetRefereeEdge = {
  __typename?: 'ReferralSetRefereeEdge';
  /** The cursor for this referral set referee */
  cursor: Scalars['String'];
  /** The referral set referee */
  node: ReferralSetReferee;
};

export type ReferralSetStats = {
  __typename?: 'ReferralSetStats';
  /** Epoch at which the statistics are updated. */
  atEpoch: Scalars['Int'];
  /** Discount factor applied to the party. */
  discountFactor: Scalars['String'];
  /** Current referee notional taker volume */
  epochNotionalTakerVolume: Scalars['String'];
  /** Unique ID of the party. */
  partyId: Scalars['ID'];
  /** Running volume for the set based on the window length of the current referral program. */
  referralSetRunningNotionalTakerVolume: Scalars['String'];
  /** Reward factor applied to the party. */
  rewardFactor: Scalars['String'];
  /** The proportion of the referees taker fees to be rewarded to the referrer. */
  rewardsFactorMultiplier: Scalars['String'];
  /** The multiplier applied to the referral reward factor when calculating referral rewards due to the referrer. */
  rewardsMultiplier: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated referral set statistics information */
export type ReferralSetStatsConnection = {
  __typename?: 'ReferralSetStatsConnection';
  /** The referral set statistics in this connection */
  edges: Array<Maybe<ReferralSetStatsEdge>>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the referral set statistics and cursor information returned by a ReferralSetStatsConnection */
export type ReferralSetStatsEdge = {
  __typename?: 'ReferralSetStatsEdge';
  /** The cursor for this referral set statistics */
  cursor: Scalars['String'];
  /** The referral set statistics */
  node: ReferralSetStats;
};

/** Rewards generated for referrers by each of their referees */
export type ReferrerRewardsGenerated = {
  __typename?: 'ReferrerRewardsGenerated';
  /** The amount of rewards generated per party */
  generatedReward: Array<PartyAmount>;
  /** ID of the referral set's referrer */
  referrerId: Scalars['String'];
};

/** Reward information for a single party */
export type Reward = {
  __typename?: 'Reward';
  /** Amount received for this reward */
  amount: Scalars['String'];
  /** The asset this reward is paid in */
  asset: Asset;
  /** Epoch for which this reward was distributed */
  epoch: Epoch;
  /** The market ID for which this reward is paid if any */
  marketId: Scalars['ID'];
  /** Party receiving the reward */
  party: Party;
  /** Percentage out of the total distributed reward */
  percentageOfTotal: Scalars['String'];
  /** RFC3339Nano time when the rewards were received */
  receivedAt: Scalars['Timestamp'];
  /** The type of reward */
  rewardType: AccountType;
};

/** Edge type containing the reward and cursor information returned by a RewardsConnection */
export type RewardEdge = {
  __typename?: 'RewardEdge';
  /** The cursor for this reward */
  cursor: Scalars['String'];
  /** The reward information */
  node: Reward;
};

export type RewardScore = {
  __typename?: 'RewardScore';
  /** The multisig score of the validator */
  multisigScore: Scalars['String'];
  /** The normalised score of the validator */
  normalisedScore: Scalars['String'];
  /** The performance score of the validator */
  performanceScore: Scalars['String'];
  /** The stake based validator score with anti-whaling */
  rawValidatorScore: Scalars['String'];
  /** The composite score of the validator */
  validatorScore: Scalars['String'];
  /** The status of the validator for this score */
  validatorStatus: ValidatorStatus;
};

export type RewardSummary = {
  __typename?: 'RewardSummary';
  /** Total quantity of rewards awarded in this asset */
  amount: Scalars['String'];
  /** The asset for which these rewards are associated */
  asset: Asset;
  /** List of individual reward payouts, ordered by epoch */
  rewardsConnection?: Maybe<RewardsConnection>;
};


export type RewardSummaryrewardsConnectionArgs = {
  assetId?: InputMaybe<Scalars['ID']>;
  pagination?: InputMaybe<Pagination>;
};

/** Connection type for retrieving cursor-based paginated reward summary information */
export type RewardSummaryConnection = {
  __typename?: 'RewardSummaryConnection';
  /** List of reward summaries available for the connection */
  edges?: Maybe<Array<Maybe<RewardSummaryEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/** Edge type containing the reward summary and cursor information returned by a RewardSummaryConnection */
export type RewardSummaryEdge = {
  __typename?: 'RewardSummaryEdge';
  /** Cursor identifying the reward summary */
  cursor: Scalars['String'];
  /** The reward summary */
  node: RewardSummary;
};

/** Filter for historical reward summary queries */
export type RewardSummaryFilter = {
  assetIds?: InputMaybe<Array<Scalars['ID']>>;
  fromEpoch?: InputMaybe<Scalars['Int']>;
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  toEpoch?: InputMaybe<Scalars['Int']>;
};

/** Connection type for retrieving cursor-based paginated rewards information */
export type RewardsConnection = {
  __typename?: 'RewardsConnection';
  /** The rewards */
  edges?: Maybe<Array<Maybe<RewardEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** A risk factor emitted by the risk model for a given market */
export type RiskFactor = {
  __typename?: 'RiskFactor';
  /** Long factor */
  long: Scalars['String'];
  /** Market the risk factor was emitted for */
  market: Scalars['String'];
  /** Short factor */
  short: Scalars['String'];
};

export type RiskModel = LogNormalRiskModel | SimpleRiskModel;

export type ScalingFactors = {
  __typename?: 'ScalingFactors';
  /** The scaling factor that determines the overflow margin level */
  collateralRelease: Scalars['Float'];
  /** The scaling factor that determines the optimal margin level */
  initialMargin: Scalars['Float'];
  /** The scaling factor that determines the margin level at which Vega has to search for more money */
  searchLevel: Scalars['Float'];
};

export type SettleDistressed = {
  __typename?: 'SettleDistressed';
  /** The margin taken from distressed party */
  margin: Scalars['String'];
  /** The market in which a position was closed out */
  marketId: Scalars['ID'];
  /** The party that was closed out */
  partyId: Scalars['ID'];
  /** The price at which the position was closed out */
  price: Scalars['String'];
};

export type SettlePosition = {
  __typename?: 'SettlePosition';
  /** The market in which a position was settled */
  marketId: Scalars['ID'];
  /** The party who settled a position */
  partyId: Scalars['ID'];
  /** The settle price */
  price: Scalars['String'];
  /** The trades that were settled to close the overall position */
  tradeSettlements?: Maybe<Array<TradeSettlement>>;
};

/** Whether the placer of an order is aiming to buy or sell on the market */
export enum Side {
  /** The placer of the order is aiming to buy */
  SIDE_BUY = 'SIDE_BUY',
  /** The placer of the order is aiming to sell */
  SIDE_SELL = 'SIDE_SELL',
  /** Unspecified is only used for trades at the end of an auction, where neither party acts as the aggressor. */
  SIDE_UNSPECIFIED = 'SIDE_UNSPECIFIED'
}

/** Signer is the authorized signature used for the data. */
export type Signer = {
  __typename?: 'Signer';
  signer: SignerKind;
};

export type SignerKind = ETHAddress | PubKey;

/** A type of simple/dummy risk model where you can specify the risk factor long and short in params */
export type SimpleRiskModel = {
  __typename?: 'SimpleRiskModel';
  /** Params for the simple risk model */
  params: SimpleRiskModelParams;
};

/** Parameters for the simple risk model */
export type SimpleRiskModelParams = {
  __typename?: 'SimpleRiskModelParams';
  /** Risk factor for long */
  factorLong: Scalars['Float'];
  /** Risk factor for short */
  factorShort: Scalars['Float'];
};

/** Spot FX product */
export type Spot = {
  __typename?: 'Spot';
  /** Underlying base asset for the spot product */
  baseAsset: Asset;
  /** Name of the instrument */
  name: Scalars['String'];
  /** Underlying quote asset for the spot product */
  quoteAsset: Asset;
};

export type SpotProduct = {
  __typename?: 'SpotProduct';
  /** Underlying base asset for the spot product */
  baseAsset: Asset;
  /** Name of the instrument */
  name: Scalars['String'];
  /** Underlying quote asset for the spot product */
  quoteAsset: Asset;
};

/** A stake linking represent the intent from a party to deposit / remove stake on their account */
export type StakeLinking = {
  __typename?: 'StakeLinking';
  /** The amount linked or unlinked */
  amount: Scalars['String'];
  /** The (ethereum) block height of the link/unlink */
  blockHeight: Scalars['String'];
  /** The RFC3339Nano time at which the stake linking was fully processed by the Vega network, null until defined */
  finalizedAt?: Maybe<Scalars['Timestamp']>;
  id: Scalars['ID'];
  /** The party initiating the stake linking */
  party: Party;
  /** The status of the linking */
  status: StakeLinkingStatus;
  /** The RFC3339Nano time at which the request happened on ethereum */
  timestamp: Scalars['Timestamp'];
  /** The transaction hash (ethereum) which initiated the link/unlink */
  txHash: Scalars['String'];
  /** Type of linking: link|unlink */
  type: StakeLinkingType;
};

/** Edge type containing the stake linking and cursor information returned by a StakesConnection */
export type StakeLinkingEdge = {
  __typename?: 'StakeLinkingEdge';
  /** Cursor identifying the stake linking */
  cursor: Scalars['String'];
  /** The stake linking */
  node: StakeLinking;
};

/** The status of the stake linking */
export enum StakeLinkingStatus {
  /** The stake linking has been accepted and processed fully (balance updated) by the network */
  STATUS_ACCEPTED = 'STATUS_ACCEPTED',
  /**
   * The stake linking is pending in the Vega network. This means that
   * the Vega network have seen a stake linking, but is still to confirm
   * it's valid on the ethereum chain and accepted by all nodes of the network
   */
  STATUS_PENDING = 'STATUS_PENDING',
  /** The Vega network has rejected this stake linking */
  STATUS_REJECTED = 'STATUS_REJECTED'
}

/** The type of stake linking */
export enum StakeLinkingType {
  /** The stake is being linked (deposited) to a Vega stake account */
  TYPE_LINK = 'TYPE_LINK',
  /** The stake is being unlinked (removed) from a Vega stake account */
  TYPE_UNLINK = 'TYPE_UNLINK'
}

/** Connection type for retrieving cursor-based paginated stake linking information */
export type StakesConnection = {
  __typename?: 'StakesConnection';
  /** List of stake links available for the connection */
  edges?: Maybe<Array<Maybe<StakeLinkingEdge>>>;
  /** Page information for the connection */
  pageInfo: PageInfo;
};

/**
 * All staking information related to a Party.
 * Contains the current recognised balance by the network and
 * all the StakeLink/Unlink seen by the network
 */
export type StakingSummary = {
  __typename?: 'StakingSummary';
  /** The stake currently available for the party */
  currentStakeAvailable: Scalars['String'];
  /** The list of all stake link/unlink for the party */
  linkings: StakesConnection;
};


/**
 * All staking information related to a Party.
 * Contains the current recognised balance by the network and
 * all the StakeLink/Unlink seen by the network
 */
export type StakingSummarylinkingsArgs = {
  pagination?: InputMaybe<Pagination>;
};

export type StakingTier = {
  __typename?: 'StakingTier';
  /** Required number of governance tokens ($VEGA) a referrer must have staked to receive the multiplier */
  minimumStakedTokens: Scalars['String'];
  /** Multiplier applied to the referral reward factor when calculating referral rewards due to the referrer */
  referralRewardMultiplier: Scalars['String'];
};

/** Statistics about the node */
export type Statistics = {
  __typename?: 'Statistics';
  /** Version of the Vega node (semver) */
  appVersion: Scalars['String'];
  /** Version commit hash of the Vega node */
  appVersionHash: Scalars['String'];
  /** Average number of orders added per blocks */
  averageOrdersPerBlock: Scalars['String'];
  /** Average size of the transactions */
  averageTxBytes: Scalars['String'];
  /** Number of items in the backlog */
  backlogLength: Scalars['String'];
  /** Duration of the last block, in nanoseconds */
  blockDuration: Scalars['String'];
  /** Current block hash */
  blockHash: Scalars['String'];
  /** Current block number */
  blockHeight: Scalars['String'];
  /** Current chain ID */
  chainId: Scalars['ID'];
  /** Version of the chain (semver) */
  chainVersion: Scalars['String'];
  /** RFC3339Nano current time (real) */
  currentTime: Scalars['Timestamp'];
  /** Total number of events on the last block */
  eventCount: Scalars['String'];
  /** The number of events per second on the last block */
  eventsPerSecond: Scalars['String'];
  /** RFC3339Nano genesis time of the chain */
  genesisTime: Scalars['Timestamp'];
  /** Number of orders per seconds */
  ordersPerSecond: Scalars['String'];
  /** Status of the Vega application connection with the chain */
  status: Scalars['String'];
  /** Total number of amended orders */
  totalAmendOrder: Scalars['String'];
  /** Total number of cancelled orders */
  totalCancelOrder: Scalars['String'];
  /** Total number of orders created */
  totalCreateOrder: Scalars['String'];
  /** Total number of markets */
  totalMarkets: Scalars['String'];
  /** Total number of orders */
  totalOrders: Scalars['String'];
  /** Total number of peers on the Vega network */
  totalPeers: Scalars['String'];
  /** Total number of trades */
  totalTrades: Scalars['String'];
  /** Number of the trades per seconds */
  tradesPerSecond: Scalars['String'];
  /** Number of transaction processed per block */
  txPerBlock: Scalars['String'];
  /** RFC3339Nano uptime of the node */
  upTime: Scalars['String'];
  /** RFC3339Nano current time of the chain (decided through consensus) */
  vegaTime: Scalars['Timestamp'];
};

/** A stop order in Vega */
export type StopOrder = {
  __typename?: 'StopOrder';
  /** RFC3339Nano time the stop order was created. */
  createdAt: Scalars['Timestamp'];
  /** RFC3339Nano time at which the order will expire if an expiry time is set. */
  expiresAt?: Maybe<Scalars['Timestamp']>;
  /** If an expiry is set, what should the stop order do when it expires. */
  expiryStrategy?: Maybe<StopOrderExpiryStrategy>;
  /** Hash of the stop order data */
  id: Scalars['ID'];
  /** Market the stop order is for. */
  marketId: Scalars['ID'];
  /** If OCO (one-cancels-other) order, the ID of the associated order. */
  ocoLinkId?: Maybe<Scalars['ID']>;
  /** The order that was created when triggered. */
  order?: Maybe<Order>;
  /** Party that submitted the stop order. */
  partyId: Scalars['ID'];
  /** Optional rejection reason for an order */
  rejectionReason?: Maybe<StopOrderRejectionReason>;
  /** Status of the stop order */
  status: StopOrderStatus;
  /** Order to submit when the stop order is triggered. */
  submission: OrderSubmission;
  /** Price movement that will trigger the stop order */
  trigger: StopOrderTrigger;
  /** Direction the price is moving to trigger the stop order. */
  triggerDirection: StopOrderTriggerDirection;
  /** RFC3339Nano time the stop order was last updated. */
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

/** Connection type for retrieving cursory-based paginated stop order information */
export type StopOrderConnection = {
  __typename?: 'StopOrderConnection';
  /** The stop orders in this connection */
  edges?: Maybe<Array<StopOrderEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the stop order and cursor information returned by a StopOrderConnection */
export type StopOrderEdge = {
  __typename?: 'StopOrderEdge';
  /** The cursor for this stop order */
  cursor?: Maybe<Scalars['String']>;
  /** The stop order */
  node?: Maybe<StopOrder>;
};

/** Valid stop order expiry strategies. The expiry strategy determines what happens to a stop order when it expires. */
export enum StopOrderExpiryStrategy {
  /** The stop order will be cancelled when it expires. */
  EXPIRY_STRATEGY_CANCELS = 'EXPIRY_STRATEGY_CANCELS',
  /** The stop order will be submitted when the expiry time is reached. */
  EXPIRY_STRATEGY_SUBMIT = 'EXPIRY_STRATEGY_SUBMIT',
  /** The stop order expiry strategy has not been specified by the trader. */
  EXPIRY_STRATEGY_UNSPECIFIED = 'EXPIRY_STRATEGY_UNSPECIFIED'
}

/** Filter to be applied when querying a list of stop orders. If multiple criteria are specified, e.g. parties and markets, then the filter is applied as an AND. */
export type StopOrderFilter = {
  /** Date range to retrieve order from/to. Start and end time should be expressed as an integer value of Unix nanoseconds */
  dateRange?: InputMaybe<DateRange>;
  /** Zero or more expiry strategies to filter by */
  expiryStrategy?: InputMaybe<Array<StopOrderExpiryStrategy>>;
  /** Filter for live stop orders only */
  liveOnly?: InputMaybe<Scalars['Boolean']>;
  /** Zero or more market IDs to filter by */
  markets?: InputMaybe<Array<Scalars['ID']>>;
  /** Zero or more party IDs to filter by */
  parties?: InputMaybe<Array<Scalars['ID']>>;
  /** Zero or more order status to filter by */
  status?: InputMaybe<Array<StopOrderStatus>>;
};

/** Price at which a stop order will trigger */
export type StopOrderPrice = {
  __typename?: 'StopOrderPrice';
  price: Scalars['String'];
};

/** Why the order was rejected by the core node */
export enum StopOrderRejectionReason {
  /** Expiry of the stop order is in the past */
  REJECTION_REASON_EXPIRY_IN_THE_PAST = 'REJECTION_REASON_EXPIRY_IN_THE_PAST',
  /** Party has reached the maximum stop orders allowed for this market */
  REJECTION_REASON_MAX_STOP_ORDERS_PER_PARTY_REACHED = 'REJECTION_REASON_MAX_STOP_ORDERS_PER_PARTY_REACHED',
  /** Stop orders submission must be reduce only */
  REJECTION_REASON_MUST_BE_REDUCE_ONLY = 'REJECTION_REASON_MUST_BE_REDUCE_ONLY',
  /** Stop orders are not allowed without a position */
  REJECTION_REASON_STOP_ORDER_NOT_ALLOWED_WITHOUT_A_POSITION = 'REJECTION_REASON_STOP_ORDER_NOT_ALLOWED_WITHOUT_A_POSITION',
  /** This stop order does not close the position */
  REJECTION_REASON_STOP_ORDER_NOT_CLOSING_THE_POSITION = 'REJECTION_REASON_STOP_ORDER_NOT_CLOSING_THE_POSITION',
  /** Trading is not allowed yet */
  REJECTION_REASON_TRADING_NOT_ALLOWED = 'REJECTION_REASON_TRADING_NOT_ALLOWED'
}

/** Valid stop order statuses, these determine several states for a stop order that cannot be expressed with other fields in StopOrder. */
export enum StopOrderStatus {
  /** Stop order has been cancelled. This could be by the trader or by the network. */
  STATUS_CANCELLED = 'STATUS_CANCELLED',
  /** Stop order has expired. This means the trigger conditions have not been met and the stop order has expired. */
  STATUS_EXPIRED = 'STATUS_EXPIRED',
  /** Stop order is pending. This means the stop order has been accepted in the network, but the trigger conditions have not been met. */
  STATUS_PENDING = 'STATUS_PENDING',
  /** Stop order has been rejected. This means the stop order was not accepted by the network. */
  STATUS_REJECTED = 'STATUS_REJECTED',
  /** Stop order has been stopped. This means the trigger conditions have been met, but the stop order was not executed, and stopped. */
  STATUS_STOPPED = 'STATUS_STOPPED',
  /** Stop order has been triggered. This means the trigger conditions have been met, and the stop order was executed. */
  STATUS_TRIGGERED = 'STATUS_TRIGGERED',
  /** Stop order has been submitted to the network but does not have a status yet */
  STATUS_UNSPECIFIED = 'STATUS_UNSPECIFIED'
}

/** Percentage movement in the price at which a stop order will trigger. */
export type StopOrderTrailingPercentOffset = {
  __typename?: 'StopOrderTrailingPercentOffset';
  trailingPercentOffset: Scalars['String'];
};

export type StopOrderTrigger = StopOrderPrice | StopOrderTrailingPercentOffset;

/** Valid stop order trigger direction. The trigger direction determines whether the price should rise above or fall below the stop order trigger. */
export enum StopOrderTriggerDirection {
  /** The price should fall below the trigger. */
  TRIGGER_DIRECTION_FALLS_BELOW = 'TRIGGER_DIRECTION_FALLS_BELOW',
  /** The price should rise above the trigger. */
  TRIGGER_DIRECTION_RISES_ABOVE = 'TRIGGER_DIRECTION_RISES_ABOVE'
}

/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to the accounts updates */
  accounts: Array<AccountUpdate>;
  /** Subscribe to event data from the event bus */
  busEvents?: Maybe<Array<BusEvent>>;
  /** Subscribe to the candles updates */
  candles: Candle;
  /** Subscribe to liquidity provisioning data */
  liquidityProvisions?: Maybe<Array<LiquidityProvisionUpdate>>;
  /** Subscribe to the margin changes */
  margins: MarginLevelsUpdate;
  /** Subscribe to the mark price changes */
  marketsData: Array<ObservableMarketData>;
  /** Subscribe to the market depths update */
  marketsDepth: Array<ObservableMarketDepth>;
  /** Subscribe to price level market depth updates */
  marketsDepthUpdate: Array<ObservableMarketDepthUpdate>;
  /** Subscribe to orders updates */
  orders?: Maybe<Array<OrderUpdate>>;
  /** Subscribe to the positions updates */
  positions: Array<PositionUpdate>;
  /** Subscribe to proposals. Leave out all arguments to receive all proposals */
  proposals: Proposal;
  /**
   * Subscribe to the trades updates
   * @deprecated Use tradesStream instead as it allows for filtering multiple markets and/or parties at once
   */
  trades?: Maybe<Array<TradeUpdate>>;
  /** Subscribe to the trades updates */
  tradesStream?: Maybe<Array<TradeUpdate>>;
  /** Subscribe to votes, either by proposal ID or party ID */
  votes: ProposalVote;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionaccountsArgs = {
  assetId?: InputMaybe<Scalars['ID']>;
  marketId?: InputMaybe<Scalars['ID']>;
  partyId?: InputMaybe<Scalars['ID']>;
  type?: InputMaybe<AccountType>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionbusEventsArgs = {
  batchSize: Scalars['Int'];
  marketId?: InputMaybe<Scalars['ID']>;
  partyId?: InputMaybe<Scalars['ID']>;
  types: Array<BusEventType>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptioncandlesArgs = {
  interval: Interval;
  marketId: Scalars['ID'];
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionliquidityProvisionsArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionmarginsArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  partyId: Scalars['ID'];
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionmarketsDataArgs = {
  marketIds: Array<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionmarketsDepthArgs = {
  marketIds: Array<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionmarketsDepthUpdateArgs = {
  marketIds: Array<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionordersArgs = {
  filter?: InputMaybe<OrderByMarketAndPartyIdsFilter>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionpositionsArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionproposalsArgs = {
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptiontradesArgs = {
  marketId?: InputMaybe<Scalars['ID']>;
  partyId?: InputMaybe<Scalars['ID']>;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptiontradesStreamArgs = {
  filter: TradesSubscriptionFilter;
};


/** Subscriptions allow a caller to receive new information as it is available from the Vega network. */
export type SubscriptionvotesArgs = {
  partyId?: InputMaybe<Scalars['ID']>;
  proposalId?: InputMaybe<Scalars['ID']>;
};

export type SuccessorConfiguration = {
  __typename?: 'SuccessorConfiguration';
  /** Decimal value between 0 and 1, specifying the fraction of the insurance pool balance is carried over from the parent market to the successor. */
  insurancePoolFraction: Scalars['String'];
  /** ID of the market this proposal will succeed */
  parentMarketId: Scalars['String'];
};

export type SuccessorMarket = {
  __typename?: 'SuccessorMarket';
  /** The market */
  market: Market;
  /** Proposals for child markets */
  proposals?: Maybe<Array<Maybe<Proposal>>>;
};

/** Connection type for retrieving cursor-based paginated market information */
export type SuccessorMarketConnection = {
  __typename?: 'SuccessorMarketConnection';
  /** The markets in this connection */
  edges: Array<SuccessorMarketEdge>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the market and cursor information returned by a MarketConnection */
export type SuccessorMarketEdge = {
  __typename?: 'SuccessorMarketEdge';
  /** The cursor for this market */
  cursor: Scalars['String'];
  /** The market */
  node: SuccessorMarket;
};

/** TargetStakeParameters contains parameters used in target stake calculation */
export type TargetStakeParameters = {
  __typename?: 'TargetStakeParameters';
  /** Specifies scaling factors used in target stake calculation */
  scalingFactor: Scalars['Float'];
  /** Specifies length of time window expressed in seconds for target stake calculation */
  timeWindow: Scalars['Int'];
};

/** Team record containing the team information. */
export type Team = {
  __typename?: 'Team';
  /** Link to an image of the team's avatar. */
  avatarURL: Scalars['String'];
  /** Tells if a party can join the team or not. */
  closed: Scalars['Boolean'];
  /** Time in RFC3339Nano format when the team was created. */
  createdAt: Scalars['Timestamp'];
  /** Epoch at which the team was created. */
  createdAtEpoch: Scalars['Int'];
  /** Name of the team. */
  name: Scalars['String'];
  /** Party ID that created the team. */
  referrer: Scalars['ID'];
  /** Unique ID of the team. */
  teamId: Scalars['ID'];
  /** Link to the team's homepage. */
  teamURL: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated team data */
export type TeamConnection = {
  __typename?: 'TeamConnection';
  /** Teams in this connection */
  edges: Array<TeamEdge>;
  /** Pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing a team cursor and its associated team data */
export type TeamEdge = {
  __typename?: 'TeamEdge';
  /** Cursor identifying the team data */
  cursor: Scalars['String'];
  /** Team data */
  node: Team;
};

/** A team's referee info */
export type TeamReferee = {
  __typename?: 'TeamReferee';
  /** Time in RFC3339Nano format when the referee joined the team. */
  joinedAt: Scalars['Timestamp'];
  /** Epoch at which the referee joined the team. */
  joinedAtEpoch: Scalars['Int'];
  /** Party ID of the referee */
  referee: Scalars['ID'];
  /** Team ID. */
  teamId: Scalars['ID'];
};

/** Connection type for retrieving cursor-based paginated team referee data */
export type TeamRefereeConnection = {
  __typename?: 'TeamRefereeConnection';
  /** Team referees in this connection */
  edges: Array<TeamRefereeEdge>;
  /** Pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing a team referee cursor and its associated team referee data */
export type TeamRefereeEdge = {
  __typename?: 'TeamRefereeEdge';
  /** Cursor identifying the team referee data */
  cursor: Scalars['String'];
  /** Team referee data */
  node: TeamReferee;
};

/** Referee's team history, i.e. which team a referee has been a member of. */
export type TeamRefereeHistory = {
  __typename?: 'TeamRefereeHistory';
  /** Time in RFC3339Nano format when the referee joined the team. */
  joinedAt: Scalars['Timestamp'];
  /** Epoch at which the referee joined the team. */
  joinedAtEpoch: Scalars['Int'];
  /** ID of the team the referee joined. */
  teamId: Scalars['ID'];
};

/** Connection type for retrieving cursor-based paginated team referee history data */
export type TeamRefereeHistoryConnection = {
  __typename?: 'TeamRefereeHistoryConnection';
  /** Team referee history in this connection */
  edges: Array<TeamRefereeHistoryEdge>;
  /** Pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing a team referee history cursor and its associated team referee history data */
export type TeamRefereeHistoryEdge = {
  __typename?: 'TeamRefereeHistoryEdge';
  /** Cursor identifying the team referee history data */
  cursor: Scalars['String'];
  /** Team referee history data */
  node: TeamRefereeHistory;
};

export type TimeUpdate = {
  __typename?: 'TimeUpdate';
  /** RFC3339Nano time of new block time */
  timestamp: Scalars['Timestamp'];
};

/** A tradable instrument is a combination of an instrument and a risk model */
export type TradableInstrument = {
  __typename?: 'TradableInstrument';
  /** An instance of, or reference to, a fully specified instrument. */
  instrument: Instrument;
  /** Margin calculation info, currently only the scaling factors (search, initial, release) for this tradable instrument */
  marginCalculator?: Maybe<MarginCalculator>;
  /** A reference to a risk model that is valid for the instrument */
  riskModel: RiskModel;
};

/** A trade on Vega, the result of two orders being 'matched' in the market */
export type Trade = {
  __typename?: 'Trade';
  /** The aggressor indicates whether this trade was related to a BUY or SELL */
  aggressor: Side;
  /** The order that bought */
  buyOrder: Scalars['String'];
  /** The party that bought */
  buyer: Party;
  /** The batch in which the buyer order was submitted (applies only for auction modes) */
  buyerAuctionBatch?: Maybe<Scalars['Int']>;
  /** The fee paid by the buyer side of the trade */
  buyerFee: TradeFee;
  /** RFC3339Nano time for when the trade occurred */
  createdAt: Scalars['Timestamp'];
  /** The hash of the trade data */
  id: Scalars['ID'];
  /** The market the trade occurred on */
  market: Market;
  /** The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64) */
  price: Scalars['String'];
  /** The order that sold */
  sellOrder: Scalars['String'];
  /** The party that sold */
  seller: Party;
  /** The batch in which the seller order was submitted (applies only for auction modes) */
  sellerAuctionBatch?: Maybe<Scalars['Int']>;
  /** The fee paid by the seller side of the trade */
  sellerFee: TradeFee;
  /** The number of units traded, will always be <= the remaining size of both orders immediately before the trade (uint64) */
  size: Scalars['String'];
  /** The type of trade */
  type: TradeType;
};

/** Connection type for retrieving cursor-based paginated trade information */
export type TradeConnection = {
  __typename?: 'TradeConnection';
  /** The trade in this connection */
  edges: Array<TradeEdge>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the trade and cursor information returned by a TradeConnection */
export type TradeEdge = {
  __typename?: 'TradeEdge';
  /** The cursor for this trade */
  cursor: Scalars['String'];
  /** The trade */
  node: Trade;
};

/** The fee paid by the party when a trade occurs */
export type TradeFee = {
  __typename?: 'TradeFee';
  /** The infrastructure fee, a fee paid to the validators to maintain the Vega network */
  infrastructureFee: Scalars['String'];
  /** Referral discount on infrastructure fees for the trade */
  infrastructureFeeReferralDiscount?: Maybe<Scalars['String']>;
  /** Volume discount on infrastructure fees for the trade */
  infrastructureFeeVolumeDiscount?: Maybe<Scalars['String']>;
  /** The fee paid to the liquidity providers that committed liquidity to the market */
  liquidityFee: Scalars['String'];
  /** Referral discount on liquidity fees for the trade */
  liquidityFeeReferralDiscount?: Maybe<Scalars['String']>;
  /** Volume discount on liquidity fees for the trade */
  liquidityFeeVolumeDiscount?: Maybe<Scalars['String']>;
  /** The maker fee, paid by the aggressive party to the other party (the one who had an order in the book) */
  makerFee: Scalars['String'];
  /** Referral discount on maker fees for the trade */
  makerFeeReferralDiscount?: Maybe<Scalars['String']>;
  /** Volume discount on maker fees for the trade */
  makerFeeVolumeDiscount?: Maybe<Scalars['String']>;
};

export type TradeSettlement = {
  __typename?: 'TradeSettlement';
  /** The price of the trade */
  price: Scalars['String'];
  /** The size of the trade */
  size: Scalars['Int'];
};

/** Valid trade types */
export enum TradeType {
  /** Default trade type */
  TYPE_DEFAULT = 'TYPE_DEFAULT',
  /** Network close-out - good */
  TYPE_NETWORK_CLOSE_OUT_BAD = 'TYPE_NETWORK_CLOSE_OUT_BAD',
  /** Network close-out - bad */
  TYPE_NETWORK_CLOSE_OUT_GOOD = 'TYPE_NETWORK_CLOSE_OUT_GOOD'
}

/** A trade on Vega, the result of two orders being 'matched' in the market */
export type TradeUpdate = {
  __typename?: 'TradeUpdate';
  /** The aggressor indicates whether this trade was related to a BUY or SELL */
  aggressor: Side;
  /** The order that bought */
  buyOrder: Scalars['String'];
  /** The batch in which the buyer order was submitted (applies only for auction modes) */
  buyerAuctionBatch?: Maybe<Scalars['Int']>;
  /** The fee paid by the buyer side of the trade */
  buyerFee: TradeFee;
  /** The party that bought */
  buyerId: Scalars['ID'];
  /** RFC3339Nano time for when the trade occurred */
  createdAt: Scalars['Timestamp'];
  /** The hash of the trade data */
  id: Scalars['ID'];
  /** The market the trade occurred on */
  marketId: Scalars['ID'];
  /** The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64) */
  price: Scalars['String'];
  /** The order that sold */
  sellOrder: Scalars['String'];
  /** The batch in which the seller order was submitted (applies only for auction modes) */
  sellerAuctionBatch?: Maybe<Scalars['Int']>;
  /** The fee paid by the seller side of the trade */
  sellerFee: TradeFee;
  /** The party that sold */
  sellerId: Scalars['ID'];
  /** The number of units traded, will always be <= the remaining size of both orders immediately before the trade (uint64) */
  size: Scalars['String'];
  /** The type of trade */
  type: TradeType;
};

/** Filter to apply to the trade connection query */
export type TradesFilter = {
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  orderIds?: InputMaybe<Array<Scalars['ID']>>;
  partyIds?: InputMaybe<Array<Scalars['ID']>>;
};

/** Filter to apply to the trade subscription request */
export type TradesSubscriptionFilter = {
  marketIds?: InputMaybe<Array<Scalars['ID']>>;
  partyIds?: InputMaybe<Array<Scalars['ID']>>;
};

/** The result from processing a transaction */
export type TransactionResult = {
  __typename?: 'TransactionResult';
  /** The error emitted by the transaction, will be null if the transaction succeeded */
  error?: Maybe<Scalars['String']>;
  /** The hash of the transaction */
  hash: Scalars['String'];
  /** The party which submitted this transaction */
  partyId: Scalars['String'];
  /** Was the transaction successful or not? */
  status: Scalars['Boolean'];
};

export type TransactionSubmitted = {
  __typename?: 'TransactionSubmitted';
  success: Scalars['Boolean'];
};

/** A user initiated transfer */
export type Transfer = {
  __typename?: 'Transfer';
  /** The amount sent */
  amount: Scalars['String'];
  /** The asset */
  asset?: Maybe<Asset>;
  /** The public key of the sender in this transfer */
  from: Scalars['String'];
  /** The account type from which funds have been sent */
  fromAccountType: AccountType;
  /** ID of this transfer */
  id: Scalars['ID'];
  /** The type of transfer being made, i.e. a one-off or recurring transfer */
  kind: TransferKind;
  /** An optional reason explaining the status of the transfer */
  reason?: Maybe<Scalars['String']>;
  /** An optional reference */
  reference?: Maybe<Scalars['String']>;
  /** The status of this transfer */
  status: TransferStatus;
  /** The RFC3339Nano time at which the transfer was submitted */
  timestamp: Scalars['Timestamp'];
  /** The public key of the recipient of the funds */
  to: Scalars['String'];
  /** The account type that has received the funds */
  toAccountType: AccountType;
};

export type TransferBalance = {
  __typename?: 'TransferBalance';
  /** Account involved in transfer */
  account: AccountDetails;
  /** The new balance of the account */
  balance: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated transfers information */
export type TransferConnection = {
  __typename?: 'TransferConnection';
  edges?: Maybe<Array<Maybe<TransferEdge>>>;
  pageInfo: PageInfo;
};

/** Filter type for specifying the types of transfers to filter for */
export enum TransferDirection {
  From = 'From',
  To = 'To',
  ToOrFrom = 'ToOrFrom'
}

/** Edge type containing the transfer and cursor information returned by a TransferConnection */
export type TransferEdge = {
  __typename?: 'TransferEdge';
  cursor: Scalars['String'];
  node: Transfer;
};

export type TransferKind = OneOffGovernanceTransfer | OneOffTransfer | RecurringGovernanceTransfer | RecurringTransfer;

export type TransferResponse = {
  __typename?: 'TransferResponse';
  /** The balances of accounts involved in the transfer */
  balances?: Maybe<Array<TransferBalance>>;
  /** The ledger entries and balances resulting from a transfer request */
  transfers?: Maybe<Array<LedgerEntry>>;
};

export type TransferResponses = {
  __typename?: 'TransferResponses';
  /** A group of transfer responses - events from core */
  responses?: Maybe<Array<TransferResponse>>;
};

/** All the states a transfer can transition between */
export enum TransferStatus {
  /** Indication of a transfer cancelled by the user */
  STATUS_CANCELLED = 'STATUS_CANCELLED',
  /** Indicates a transfer accepted by the Vega network */
  STATUS_DONE = 'STATUS_DONE',
  /** Indicates a transfer still being processed */
  STATUS_PENDING = 'STATUS_PENDING',
  /** Indicates a transfer rejected by the Vega network */
  STATUS_REJECTED = 'STATUS_REJECTED',
  /**
   * Indicates a transfer stopped by the Vega network
   * e.g: no funds left to cover the transfer
   */
  STATUS_STOPPED = 'STATUS_STOPPED'
}

/** Types that describe why a transfer has been made */
export enum TransferType {
  /** Bond returned to general account after liquidity commitment was reduced */
  TRANSFER_TYPE_BOND_HIGH = 'TRANSFER_TYPE_BOND_HIGH',
  /** Bond account funded from general account to meet required bond amount */
  TRANSFER_TYPE_BOND_LOW = 'TRANSFER_TYPE_BOND_LOW',
  /** Bond account penalised when liquidity commitment not met */
  TRANSFER_TYPE_BOND_SLASHING = 'TRANSFER_TYPE_BOND_SLASHING',
  /** Balances are being restored to the user's account following a checkpoint restart of the network */
  TRANSFER_TYPE_CHECKPOINT_BALANCE_RESTORE = 'TRANSFER_TYPE_CHECKPOINT_BALANCE_RESTORE',
  /** Market-related accounts emptied because market has closed */
  TRANSFER_TYPE_CLEAR_ACCOUNT = 'TRANSFER_TYPE_CLEAR_ACCOUNT',
  /** Funds deposited to general account */
  TRANSFER_TYPE_DEPOSIT = 'TRANSFER_TYPE_DEPOSIT',
  /** An internal instruction to transfer a quantity corresponding to an active spot order from a general account into a party holding account */
  TRANSFER_TYPE_HOLDING_LOCK = 'TRANSFER_TYPE_HOLDING_LOCK',
  /** An internal instruction to transfer an excess quantity corresponding to an active spot order from a holding account into a party general account */
  TRANSFER_TYPE_HOLDING_RELEASE = 'TRANSFER_TYPE_HOLDING_RELEASE',
  /** Infrastructure fee received into general account */
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_DISTRIBUTE = 'TRANSFER_TYPE_INFRASTRUCTURE_FEE_DISTRIBUTE',
  /** Infrastructure fee paid from general account */
  TRANSFER_TYPE_INFRASTRUCTURE_FEE_PAY = 'TRANSFER_TYPE_INFRASTRUCTURE_FEE_PAY',
  /** Allocates liquidity fee earnings to each liquidity provider's network controlled liquidity fee account. */
  TRANSFER_TYPE_LIQUIDITY_FEE_ALLOCATE = 'TRANSFER_TYPE_LIQUIDITY_FEE_ALLOCATE',
  /** Liquidity fee received into general account */
  TRANSFER_TYPE_LIQUIDITY_FEE_DISTRIBUTE = 'TRANSFER_TYPE_LIQUIDITY_FEE_DISTRIBUTE',
  /** Distributes net fee earnings from liquidity provider's fee account to their general account. */
  TRANSFER_TYPE_LIQUIDITY_FEE_NET_DISTRIBUTE = 'TRANSFER_TYPE_LIQUIDITY_FEE_NET_DISTRIBUTE',
  /** Liquidity fee paid from general account */
  TRANSFER_TYPE_LIQUIDITY_FEE_PAY = 'TRANSFER_TYPE_LIQUIDITY_FEE_PAY',
  /** Collects penalties from the liquidity provider's fee account before the fee revenue is paid, and transfers it to the market's bonus distribution account. */
  TRANSFER_TYPE_LIQUIDITY_FEE_UNPAID_COLLECT = 'TRANSFER_TYPE_LIQUIDITY_FEE_UNPAID_COLLECT',
  /** Funds deducted after final settlement loss */
  TRANSFER_TYPE_LOSS = 'TRANSFER_TYPE_LOSS',
  /** Maker fee paid from general account */
  TRANSFER_TYPE_MAKER_FEE_PAY = 'TRANSFER_TYPE_MAKER_FEE_PAY',
  /** Maker fee received into general account */
  TRANSFER_TYPE_MAKER_FEE_RECEIVE = 'TRANSFER_TYPE_MAKER_FEE_RECEIVE',
  /** Margin confiscated from margin account to fulfil closeout */
  TRANSFER_TYPE_MARGIN_CONFISCATED = 'TRANSFER_TYPE_MARGIN_CONFISCATED',
  /** Excess margin amount returned to general account */
  TRANSFER_TYPE_MARGIN_HIGH = 'TRANSFER_TYPE_MARGIN_HIGH',
  /** Funds transferred from general account to meet margin requirement */
  TRANSFER_TYPE_MARGIN_LOW = 'TRANSFER_TYPE_MARGIN_LOW',
  /** Funds deducted from margin account after mark to market loss */
  TRANSFER_TYPE_MTM_LOSS = 'TRANSFER_TYPE_MTM_LOSS',
  /** Funds added to margin account after mark to market gain */
  TRANSFER_TYPE_MTM_WIN = 'TRANSFER_TYPE_MTM_WIN',
  /** Funds deducted from margin account after a perpetuals funding loss. */
  TRANSFER_TYPE_PERPETUALS_FUNDING_LOSS = 'TRANSFER_TYPE_PERPETUALS_FUNDING_LOSS',
  /** Funds added to margin account after a perpetuals funding gain. */
  TRANSFER_TYPE_PERPETUALS_FUNDING_WIN = 'TRANSFER_TYPE_PERPETUALS_FUNDING_WIN',
  /** Funds moved from the vesting account to the vested account once the vesting period is reached. */
  TRANSFER_TYPE_REWARDS_VESTED = 'TRANSFER_TYPE_REWARDS_VESTED',
  /** Reward payout received */
  TRANSFER_TYPE_REWARD_PAYOUT = 'TRANSFER_TYPE_REWARD_PAYOUT',
  /** Applies SLA penalty by moving funds from party's bond account to market's insurance pool. */
  TRANSFER_TYPE_SLA_PENALTY_BOND_APPLY = 'TRANSFER_TYPE_SLA_PENALTY_BOND_APPLY',
  /** Applies SLA penalty by moving funds from the liquidity provider's fee account to market insurance pool. */
  TRANSFER_TYPE_SLA_PENALTY_LP_FEE_APPLY = 'TRANSFER_TYPE_SLA_PENALTY_LP_FEE_APPLY',
  /** Distributes performance bonus from market bonus to liquidity provider's general account. */
  TRANSFER_TYPE_SLA_PERFORMANCE_BONUS_DISTRIBUTE = 'TRANSFER_TYPE_SLA_PERFORMANCE_BONUS_DISTRIBUTE',
  /** Spot trade delivery */
  TRANSFER_TYPE_SPOT = 'TRANSFER_TYPE_SPOT',
  /** Insurance pool fraction transfer from parent to successor market. */
  TRANSFER_TYPE_SUCCESSOR_INSURANCE_FRACTION = 'TRANSFER_TYPE_SUCCESSOR_INSURANCE_FRACTION',
  /** A network internal instruction for the collateral engine to move funds from the pending transfers pool account into the destination account */
  TRANSFER_TYPE_TRANSFER_FUNDS_DISTRIBUTE = 'TRANSFER_TYPE_TRANSFER_FUNDS_DISTRIBUTE',
  /** A network internal instruction for the collateral engine to move funds from a user's general account into the pending transfers pool */
  TRANSFER_TYPE_TRANSFER_FUNDS_SEND = 'TRANSFER_TYPE_TRANSFER_FUNDS_SEND',
  /** Default value, always invalid */
  TRANSFER_TYPE_UNSPECIFIED = 'TRANSFER_TYPE_UNSPECIFIED',
  /** Funds added to general account after final settlement gain */
  TRANSFER_TYPE_WIN = 'TRANSFER_TYPE_WIN',
  /** Funds withdrawn from general account */
  TRANSFER_TYPE_WITHDRAW = 'TRANSFER_TYPE_WITHDRAW'
}

export type TriggerKind = EthTimeTrigger;

/** A proposal to update an asset's details */
export type UpdateAsset = {
  __typename?: 'UpdateAsset';
  /** The asset to update */
  assetId: Scalars['ID'];
  /** The minimum economically meaningful amount of this specific asset */
  quantum: Scalars['String'];
  /** The source of the updated asset */
  source: UpdateAssetSource;
};

/** One of the possible asset sources for update assets proposals */
export type UpdateAssetSource = UpdateERC20;

/** An asset originated from an Ethereum ERC20 Token */
export type UpdateERC20 = {
  __typename?: 'UpdateERC20';
  /**
   * The lifetime limits deposit per address
   * Note: this is a temporary measure that can be changed by governance
   */
  lifetimeLimit: Scalars['String'];
  /**
   * The maximum you can withdraw instantly. All withdrawals over the threshold will be delayed by the withdrawal delay.
   * There is no limit on the size of a withdrawal
   * Note: this is a temporary measure that can be changed by governance
   */
  withdrawThreshold: Scalars['String'];
};

export type UpdateFutureProduct = {
  __typename?: 'UpdateFutureProduct';
  dataSourceSpecBinding: DataSourceSpecToFutureBinding;
  dataSourceSpecForSettlementData: DataSourceDefinition;
  dataSourceSpecForTradingTermination: DataSourceDefinition;
  quoteName: Scalars['String'];
};

export type UpdateInstrumentConfiguration = {
  __typename?: 'UpdateInstrumentConfiguration';
  code: Scalars['String'];
  product: UpdateProductConfiguration;
};

/**
 * Incomplete change definition for governance proposal terms
 * TODO: complete the type
 */
export type UpdateMarket = {
  __typename?: 'UpdateMarket';
  marketId: Scalars['ID'];
  updateMarketConfiguration: UpdateMarketConfiguration;
};

export type UpdateMarketConfiguration = {
  __typename?: 'UpdateMarketConfiguration';
  /** Updated futures market instrument configuration. */
  instrument: UpdateInstrumentConfiguration;
  /** Linear slippage factor is used to cap the slippage component of maintenance margin - it is applied to the slippage volume. */
  linearSlippageFactor: Scalars['String'];
  /** Liquidity monitoring parameters. */
  liquidityMonitoringParameters: LiquidityMonitoringParameters;
  /** Liquidity SLA Parameters. */
  liquiditySLAParameters?: Maybe<LiquiditySLAParameters>;
  /** Optional futures market metadata, tags. */
  metadata?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Price monitoring parameters. */
  priceMonitoringParameters: PriceMonitoringParameters;
  /** Quadratic slippage factor is used to cap the slippage component of maintenance margin - it is applied to the square of the slippage volume. */
  quadraticSlippageFactor: Scalars['String'];
  /** Updated futures market risk model parameters. */
  riskParameters: UpdateMarketRiskParameters;
};

export type UpdateMarketLogNormalRiskModel = {
  __typename?: 'UpdateMarketLogNormalRiskModel';
  logNormal?: Maybe<LogNormalRiskModel>;
};

export type UpdateMarketRiskParameters = UpdateMarketLogNormalRiskModel | UpdateMarketSimpleRiskModel;

export type UpdateMarketSimpleRiskModel = {
  __typename?: 'UpdateMarketSimpleRiskModel';
  simple?: Maybe<SimpleRiskModelParams>;
};

export type UpdateMarketState = {
  __typename?: 'UpdateMarketState';
  /** The market for which to update the state */
  market: Market;
  /** Optional settlement price for terminating and settling futures market. Must be empty for other types of updates and other types of markets */
  price?: Maybe<Scalars['String']>;
  /** The type of update */
  updateType: MarketUpdateType;
};

/** Allows submitting a proposal for changing network parameters */
export type UpdateNetworkParameter = {
  __typename?: 'UpdateNetworkParameter';
  networkParameter: NetworkParameter;
};

export type UpdatePerpetualProduct = {
  __typename?: 'UpdatePerpetualProduct';
  /** Lower bound for the clamp function used as part of the funding rate calculation, in the range [-1, 1] */
  clampLowerBound: Scalars['String'];
  /** Upper bound for the clamp function used as part of the funding rate calculation, in the range [-1, 1] */
  clampUpperBound: Scalars['String'];
  /** Binding between the data source spec and the settlement data */
  dataSourceSpecBinding: DataSourceSpecPerpetualBinding;
  /** Data source specification describing the data source for settlement */
  dataSourceSpecForSettlementData: DataSourceDefinition;
  /** Data source specification describing the data source for settlement schedule */
  dataSourceSpecForSettlementSchedule: DataSourceDefinition;
  /** Continuously compounded interest rate used in funding rate calculation, in the range [-1, 1] */
  interestRate: Scalars['String'];
  /** Controls how much the upcoming funding payment liability contributes to party's margin, in the range [0, 1] */
  marginFundingFactor: Scalars['String'];
  /** Quote name of the instrument */
  quoteName: Scalars['String'];
};

export type UpdateProductConfiguration = UpdateFutureProduct | UpdatePerpetualProduct;

export type UpdateReferralProgram = {
  __typename?: 'UpdateReferralProgram';
  /** Defined tiers in increasing order. First element will give Tier 1, second element will give Tier 2, etc. */
  benefitTiers: Array<BenefitTier>;
  /** Timestamp as RFC3339, after which when the current epoch ends, the programs will end and benefits will be disabled. */
  endOfProgramTimestamp: Scalars['String'];
  /**
   * Defined staking tiers in increasing order. First element will give Tier 1,
   * second element will give Tier 2, and so on. Determines the level of
   * benefit a party can expect based on their staking.
   */
  stakingTiers: Array<StakingTier>;
  /** Number of epochs over which to evaluate a referral set's running volume. */
  windowLength: Scalars['Int'];
};

/** Update an existing spot market on Vega */
export type UpdateSpotMarket = {
  __typename?: 'UpdateSpotMarket';
  /** Market ID the update is for */
  marketId: Scalars['ID'];
  /** Updated configuration of the spot market */
  updateSpotMarketConfiguration: UpdateSpotMarketConfiguration;
};

export type UpdateSpotMarketConfiguration = {
  __typename?: 'UpdateSpotMarketConfiguration';
  /** Specifies the liquidity provision SLA parameters */
  liquiditySLAParams: LiquiditySLAParameters;
  /** Optional spot market metadata tags */
  metadata: Array<Scalars['String']>;
  /** Price monitoring parameters */
  priceMonitoringParameters: PriceMonitoringParameters;
  /** Update spot market risk model parameters */
  riskParameters: RiskModel;
  /** Specifies parameters related to target stake calculation */
  targetStakeParameters: TargetStakeParameters;
};

export type UpdateVolumeDiscountProgram = {
  __typename?: 'UpdateVolumeDiscountProgram';
  /** The benefit tiers for the program */
  benefitTiers: Array<VolumeBenefitTier>;
  /** The end time of the program */
  endOfProgramTimestamp: Scalars['Timestamp'];
  /** The window length to consider for the volume discount program */
  windowLength: Scalars['Int'];
};

/** Status of a validator node */
export enum ValidatorStatus {
  /** The node is a candidate to become a Tendermint validator if a slot is made available */
  VALIDATOR_NODE_STATUS_ERSATZ = 'VALIDATOR_NODE_STATUS_ERSATZ',
  /** The node is pending promotion to ersatz (standby), if a slot is available and if the node fulfils the requirements */
  VALIDATOR_NODE_STATUS_PENDING = 'VALIDATOR_NODE_STATUS_PENDING',
  /** The node is taking part in Tendermint consensus */
  VALIDATOR_NODE_STATUS_TENDERMINT = 'VALIDATOR_NODE_STATUS_TENDERMINT'
}

export type VolumeBenefitTier = {
  __typename?: 'VolumeBenefitTier';
  /** The minimum running notional for the given benefit tier */
  minimumRunningNotionalTakerVolume: Scalars['String'];
  /** Discount given to those in this benefit tier */
  volumeDiscountFactor: Scalars['String'];
};

/** Volume discount program information */
export type VolumeDiscountProgram = {
  __typename?: 'VolumeDiscountProgram';
  /** Defined tiers in increasing order. First element will give Tier 1, second element will give Tier 2, etc. */
  benefitTiers: Array<VolumeBenefitTier>;
  /** Timestamp as Unix time in nanoseconds, after which when the current epoch ends, the programs will end and benefits will be disabled. */
  endOfProgramTimestamp: Scalars['Timestamp'];
  /** Timestamp as RFC3339Nano when the program ended. If present, the current program has ended and no program is currently running. */
  endedAt?: Maybe<Scalars['Timestamp']>;
  /** Unique ID generated from the proposal that created this program. */
  id: Scalars['ID'];
  /** Incremental version of the program. It is incremented each time the volume discount program is edited. */
  version: Scalars['Int'];
  /** Number of epochs over which to evaluate parties' running volume. */
  windowLength: Scalars['Int'];
};

export type VolumeDiscountStats = {
  __typename?: 'VolumeDiscountStats';
  /** Epoch at which the statistics are updated. */
  atEpoch: Scalars['Int'];
  /** Discount factor applied to the party. */
  discountFactor: Scalars['String'];
  /** Unique ID of the party. */
  partyId: Scalars['ID'];
  /** Party's running volume. */
  runningVolume: Scalars['String'];
};

/** Connection type for retrieving cursor-based paginated volume discount statistics information */
export type VolumeDiscountStatsConnection = {
  __typename?: 'VolumeDiscountStatsConnection';
  /** The volume discount statistics in this connection */
  edges: Array<Maybe<VolumeDiscountStatsEdge>>;
  /** The pagination information */
  pageInfo: PageInfo;
};

/** Edge type containing the volume discount statistics and cursor information returned by a VolumeDiscountStatsConnection */
export type VolumeDiscountStatsEdge = {
  __typename?: 'VolumeDiscountStatsEdge';
  /** The cursor for this volume discount statistics */
  cursor: Scalars['String'];
  /** The volume discount statistics */
  node: VolumeDiscountStats;
};

export type Vote = {
  __typename?: 'Vote';
  /** RFC3339Nano time and date when the vote reached Vega network */
  datetime: Scalars['Timestamp'];
  /** The weight of this vote based on the total equity like share */
  equityLikeShareWeight: Scalars['String'];
  /** Total number of governance tokens for the party that cast the vote */
  governanceTokenBalance: Scalars['String'];
  /** The weight of this vote based on the total of governance token */
  governanceTokenWeight: Scalars['String'];
  /** The party casting the vote */
  party: Party;
  /** The ID of the proposal this vote applies to */
  proposalId: Scalars['ID'];
  /** The vote value cast */
  value: VoteValue;
};

/** Connection type for retrieving cursor-based paginated vote information */
export type VoteConnection = {
  __typename?: 'VoteConnection';
  /** The votes in this connection */
  edges?: Maybe<Array<VoteEdge>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};

/** Edge type containing the vote and cursor information returned by a VoteConnection */
export type VoteEdge = {
  __typename?: 'VoteEdge';
  /** The cursor for this vote */
  cursor?: Maybe<Scalars['String']>;
  /** The vote */
  node: Vote;
};

/** Whether a governance vote is yes or no */
export enum VoteValue {
  /** No votes against a proposal */
  VALUE_NO = 'VALUE_NO',
  /** Yes votes for a proposal */
  VALUE_YES = 'VALUE_YES'
}

/** The details of a withdrawal processed by Vega */
export type Withdrawal = {
  __typename?: 'Withdrawal';
  /** The amount to be withdrawn */
  amount: Scalars['String'];
  /** The asset to be withdrawn */
  asset: Asset;
  /** RFC3339Nano time at which the withdrawal was created */
  createdTimestamp: Scalars['Timestamp'];
  /** Foreign chain specific details about the withdrawal */
  details?: Maybe<WithdrawalDetails>;
  /** The Vega internal ID of the withdrawal */
  id: Scalars['ID'];
  /** The Party initiating the withdrawal */
  party: Party;
  /** Whether or the not the withdrawal is being processed on Ethereum */
  pendingOnForeignChain: Scalars['Boolean'];
  /** A reference the foreign chain can use to refer to when processing the withdrawal */
  ref: Scalars['String'];
  /** The current status of the withdrawal */
  status: WithdrawalStatus;
  /** Hash of the transaction on the foreign chain */
  txHash?: Maybe<Scalars['String']>;
  /** RFC3339Nano time at which the withdrawal was finalised */
  withdrawnTimestamp?: Maybe<Scalars['Timestamp']>;
};

export type WithdrawalDetails = Erc20WithdrawalDetails;

/** Edge type containing the withdrawal and cursor information returned by a WithdrawalsConnection */
export type WithdrawalEdge = {
  __typename?: 'WithdrawalEdge';
  /** The cursor for the withdrawal */
  cursor: Scalars['String'];
  /** The withdrawal */
  node: Withdrawal;
};

/** The status of a withdrawal */
export enum WithdrawalStatus {
  /** The withdrawal was finalised, it was valid, the foreign chain has executed it and the network updated all accounts */
  STATUS_FINALIZED = 'STATUS_FINALIZED',
  /** The withdrawal is open and being processed by the network */
  STATUS_OPEN = 'STATUS_OPEN',
  /** The withdrawal have been cancelled by the network, either because it expired, or something went wrong with the foreign chain */
  STATUS_REJECTED = 'STATUS_REJECTED'
}

/** Connection type for retrieving cursor-based paginated withdrawals information */
export type WithdrawalsConnection = {
  __typename?: 'WithdrawalsConnection';
  /** The withdrawals */
  edges?: Maybe<Array<Maybe<WithdrawalEdge>>>;
  /** The pagination information */
  pageInfo?: Maybe<PageInfo>;
};
