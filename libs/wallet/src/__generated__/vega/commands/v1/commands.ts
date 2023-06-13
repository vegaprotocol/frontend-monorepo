/* eslint-disable */
import type { ProposalRationale, ProposalTerms, Vote_Value } from "../../governance";
import type {
  AccountType,
  DispatchStrategy,
  LiquidityOrder,
  Order_TimeInForce,
  Order_Type,
  PeggedOrder,
  PeggedReference,
  Side,
  WithdrawExt,
} from "../../vega";
import type { NodeSignatureKind } from "./validator_commands";

export const protobufPackage = "vega.commands.v1";

/**
 * Batch of order instructions.
 * This command accepts only the following batches of commands
 * and will be processed in the following order:
 * - OrderCancellation
 * - OrderAmendment
 * - OrderSubmission
 * The total amount of commands in the batch across all three lists of
 * instructions is restricted by the following network parameter:
 * "spam.protection.max.batchSize"
 */
export interface BatchMarketInstructions {
  /** List of order cancellations to be processed sequentially. */
  cancellations: OrderCancellation[];
  /** List of order amendments to be processed sequentially. */
  amendments: OrderAmendment[];
  /** List of order submissions to be processed sequentially. */
  submissions: OrderSubmission[];
}

/** Order submission is a request to submit or create a new order on Vega */
export interface OrderSubmission {
  /** Market ID for the order, required field. */
  marketId: string;
  /**
   * Price for the order, the price is an integer, for example `123456` is a correctly
   * formatted price of `1.23456` assuming market configured to 5 decimal places,
   * required field for limit orders, however it is not required for market orders.
   * This field is an unsigned integer scaled to the market's decimal places.
   */
  price: string;
  /** Size for the order, for example, in a futures market the size equals the number of units, cannot be negative. */
  size: number;
  /** Side for the order, e.g. SIDE_BUY or SIDE_SELL, required field. */
  side: Side;
  /** Time in force indicates how long an order will remain active before it is executed or expires, required field. */
  timeInForce: Order_TimeInForce;
  /**
   * Timestamp in Unix nanoseconds for when the order will expire,
   * required field only for `Order.TimeInForce`.TIME_IN_FORCE_GTT`.
   */
  expiresAt: number;
  /** Type for the order, required field - See `Order.Type`. */
  type: Order_Type;
  /**
   * Reference given for the order, this is typically used to retrieve an order submitted through consensus, currently
   * set internally by the node to return a unique reference ID for the order submission.
   */
  reference: string;
  /** Used to specify the details for a pegged order. */
  peggedOrder:
    | PeggedOrder
    | undefined;
  /** Only valid for Limit orders. Cannot be True at the same time as Reduce-Only. */
  postOnly: boolean;
  /**
   * Only valid for Non-Persistent orders. Cannot be True at the same time as Post-Only.
   * If set, order will only be executed if the outcome of the trade moves the trader's position closer to 0.
   */
  reduceOnly: boolean;
  /** Parameters used to specify an iceberg order. */
  icebergOpts?: IcebergOpts | undefined;
}

/** Iceberg order options */
export interface IcebergOpts {
  /** Size of the order that is initially made visible and can cause a trade within a single transaction. */
  initialPeakSize: number;
  /** Threshold at which the order's visible remaining size will be refreshed back to its initial peak size. */
  minimumPeakSize: number;
}

/** Order cancellation is a request to cancel an existing order on Vega */
export interface OrderCancellation {
  /** Unique ID for the order. This is set by the system after consensus. Required field. */
  orderId: string;
  /** Market ID for the order, required field. */
  marketId: string;
}

/** An order amendment is a request to amend or update an existing order on Vega */
export interface OrderAmendment {
  /** Order ID, this is required to find the order and will not be updated, required field. */
  orderId: string;
  /** Market ID, this is required to find the order and will not be updated. */
  marketId: string;
  /**
   * Amend the price for the order if the price value is set, otherwise price will remain unchanged.
   * This field is an unsigned integer scaled to the market's decimal places.
   */
  price?:
    | string
    | undefined;
  /**
   * Amend the size for the order by the delta specified:
   * - To reduce the size from the current value set a negative integer value
   * - To increase the size from the current value, set a positive integer value
   * - To leave the size unchanged set a value of zero
   * This field needs to be scaled using the market's position decimal places.
   */
  sizeDelta: number;
  /** Amend the expiry time for the order, if the Timestamp value is set, otherwise expiry time will remain unchanged. */
  expiresAt?:
    | number
    | undefined;
  /** Amend the time in force for the order, set to TIME_IN_FORCE_UNSPECIFIED to remain unchanged. */
  timeInForce: Order_TimeInForce;
  /** Amend the pegged order offset for the order. This field is an unsigned integer scaled to the market's decimal places. */
  peggedOffset: string;
  /** Amend the pegged order reference for the order. */
  peggedReference: PeggedReference;
}

/** A liquidity provision submitted for a given market */
export interface LiquidityProvisionSubmission {
  /** Market ID for the order. */
  marketId: string;
  /**
   * Specified as a unitless number that represents the amount of settlement asset of the market.
   * This field is an unsigned integer scaled using the asset's decimal places.
   */
  commitmentAmount: string;
  /** Nominated liquidity fee factor, which is an input to the calculation of taker fees on the market, as per setting fees and rewarding liquidity providers. */
  fee: string;
  /** Set of liquidity sell orders to meet the liquidity provision obligation. */
  sells: LiquidityOrder[];
  /** Set of liquidity buy orders to meet the liquidity provision obligation. */
  buys: LiquidityOrder[];
  /** Reference to be added to every order created out of this liquidity provision submission. */
  reference: string;
}

/** Cancel a liquidity provision request */
export interface LiquidityProvisionCancellation {
  /** Unique ID for the market with the liquidity provision to be cancelled. */
  marketId: string;
}

/** Amend a liquidity provision request */
export interface LiquidityProvisionAmendment {
  /** Unique ID for the market with the liquidity provision to be amended. */
  marketId: string;
  /** From here at least one of the following is required to consider the command valid. */
  commitmentAmount: string;
  /** empty strings means no change */
  fee: string;
  /** empty slice means no change */
  sells: LiquidityOrder[];
  /** empty slice means no change */
  buys: LiquidityOrder[];
  /** empty string means no change */
  reference: string;
}

/** Represents the submission request to withdraw funds for a party on Vega */
export interface WithdrawSubmission {
  /** Amount to be withdrawn. This field is an unsigned integer scaled to the asset's decimal places. */
  amount: string;
  /** Asset to be withdrawn. */
  asset: string;
  /** Foreign chain specifics. */
  ext: WithdrawExt | undefined;
}

/**
 * Command to submit a new proposal for the
 * Vega network governance
 */
export interface ProposalSubmission {
  /** Reference identifying the proposal. */
  reference: string;
  /** Proposal configuration and the actual change that is meant to be executed when proposal is enacted. */
  terms:
    | ProposalTerms
    | undefined;
  /** Rationale behind a proposal. */
  rationale: ProposalRationale | undefined;
}

/** Command to submit a new vote for a governance proposal. */
export interface VoteSubmission {
  /** Submit vote for the specified proposal ID. */
  proposalId: string;
  /** Actual value of the vote. */
  value: Vote_Value;
}

/** Command to submit an instruction to delegate some stake to a node */
export interface DelegateSubmission {
  /** Delegate to the specified node ID. */
  nodeId: string;
  /** Amount of stake to delegate. This field is an unsigned integer scaled to the asset's decimal places. */
  amount: string;
}

export interface UndelegateSubmission {
  /** Node ID to delegate to. */
  nodeId: string;
  /**
   * Optional, if not specified = ALL.
   * If provided, this field must be an unsigned integer passed as a string
   * and needs to be scaled using the asset decimal places for the token.
   */
  amount: string;
  /** Method of delegation. */
  method: UndelegateSubmission_Method;
}

export enum UndelegateSubmission_Method {
  METHOD_UNSPECIFIED = 0,
  METHOD_NOW = 1,
  METHOD_AT_END_OF_EPOCH = 2,
  UNRECOGNIZED = -1,
}

/** Transfer initiated by a party */
export interface Transfer {
  /**
   * Account type from which the funds of the party
   * should be taken.
   */
  fromAccountType: AccountType;
  /** Public key of the destination account. */
  to: string;
  /** Type of the destination account. */
  toAccountType: AccountType;
  /** Asset ID of the asset to be transferred. */
  asset: string;
  /** Amount to be taken from the source account. This field is an unsigned integer scaled to the asset's decimal places. */
  amount: string;
  /** Reference to be attached to the transfer. */
  reference: string;
  oneOff?: OneOffTransfer | undefined;
  recurring?: RecurringTransfer | undefined;
}

/** Specific details for a one off transfer */
export interface OneOffTransfer {
  /** Timestamp in Unix nanoseconds for when the transfer should be delivered into the receiver's account. */
  deliverOn: number;
}

/** Specific details for a recurring transfer */
export interface RecurringTransfer {
  /** First epoch from which this transfer shall be paid. */
  startEpoch: number;
  /** Last epoch at which this transfer shall be paid. */
  endEpoch?:
    | number
    | undefined;
  /** Factor needs to be > 0. */
  factor: string;
  /** Optional parameter defining how a transfer is dispatched. */
  dispatchStrategy: DispatchStrategy | undefined;
}

/** Request for cancelling a recurring transfer */
export interface CancelTransfer {
  /** Transfer ID of the transfer to cancel. */
  transferId: string;
}

/** Transaction for a validator to submit signatures to a smart contract */
export interface IssueSignatures {
  /** Ethereum address which will submit the signatures to the smart contract. */
  submitter: string;
  /** What kind of signatures to generate, namely for whether a signer is being added or removed. */
  kind: NodeSignatureKind;
  /** Node ID of the validator node that will be signed in or out of the smart contract. */
  validatorNodeId: string;
}
