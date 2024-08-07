export const HALF_MAX_POSITION_SIZE = '4611686018427387903';

export type BatchTransactionCommands =
  | TransactionKeys.ORDER_SUBMISSION
  | TransactionKeys.ORDER_CANCELLATION
  | TransactionKeys.ORDER_AMENDMENT
  | TransactionKeys.STOP_ORDERS_SUBMISSION
  | TransactionKeys.STOP_ORDERS_CANCELLATION;

export enum TransactionKeys {
  UNKNOWN = 'unknown',
  ORDER_SUBMISSION = 'orderSubmission',
  ORDER_CANCELLATION = 'orderCancellation',
  ORDER_AMENDMENT = 'orderAmendment',
  WITHDRAW_SUBMISSION = 'withdrawSubmission',
  PROPOSAL_SUBMISSION = 'proposalSubmission',
  VOTE_SUBMISSION = 'voteSubmission',
  LIQUIDITY_PROVISION_SUBMISSION = 'liquidityProvisionSubmission',
  DELEGATE_SUBMISSION = 'delegateSubmission',
  UNDELEGATE_SUBMISSION = 'undelegateSubmission',
  LIQUIDITY_PROVISION_CANCELLATION = 'liquidityProvisionCancellation',
  LIQUIDITY_PROVISION_AMENDMENT = 'liquidityProvisionAmendment',
  TRANSFER = 'transfer',
  CANCEL_TRANSFER = 'cancelTransfer',
  ANNOUNCE_NODE = 'announceNode',
  BATCH_MARKET_INSTRUCTIONS = 'batchMarketInstructions',
  STOP_ORDERS_SUBMISSION = 'stopOrdersSubmission',
  STOP_ORDERS_CANCELLATION = 'stopOrdersCancellation',
  CREATE_REFERRAL_SET = 'createReferralSet',
  UPDATE_REFERRAL_SET = 'updateReferralSet',
  APPLY_REFERRAL_CODE = 'applyReferralCode',
  UPDATE_MARGIN_MODE = 'updateMarginMode',
  JOIN_TEAM = 'joinTeam',
  NODE_VOTE = 'nodeVote',
  NODE_SIGNATURE = 'nodeSignature',
  CHAIN_EVENT = 'chainEvent',
  KEY_ROTATE_SUBMISSION = 'keyRotateSubmission',
  STATE_VARIABLE_PROPOSAL = 'stateVariableProposal',
  VALIDATOR_HEARTBEAT = 'validatorHeartbeat',
  ETHEREUM_KEY_ROTATE_SUBMISSION = 'ethereumKeyRotateSubmission',
  PROTOCOL_UPGRADE_PROPOSAL = 'protocolUpgradeProposal',
  ISSUE_SIGNATURES = 'issueSignatures',
  ORACLE_DATA_SUBMISSION = 'oracleDataSubmission',
  BATCH_PROPOSAL_SUBMISSION = 'batchProposalSubmission',
}

export const TRANSACTION_TITLES: Record<TransactionKeys, string> = {
  [TransactionKeys.UNKNOWN]: 'Unknown',
  [TransactionKeys.ORDER_SUBMISSION]: 'Order Submission',
  [TransactionKeys.ORDER_CANCELLATION]: 'Order Cancellation',
  [TransactionKeys.ORDER_AMENDMENT]: 'Order Amendment',
  [TransactionKeys.WITHDRAW_SUBMISSION]: 'Withdraw Submission',
  [TransactionKeys.PROPOSAL_SUBMISSION]: 'Proposal Submission',
  [TransactionKeys.VOTE_SUBMISSION]: 'Vote Submission',
  [TransactionKeys.LIQUIDITY_PROVISION_SUBMISSION]:
    'Liquidity Provision Submission',
  [TransactionKeys.DELEGATE_SUBMISSION]: 'Delegate Submission',
  [TransactionKeys.UNDELEGATE_SUBMISSION]: 'Undelegate Submission',
  [TransactionKeys.LIQUIDITY_PROVISION_CANCELLATION]:
    'Liquidity Provision Cancellation',
  [TransactionKeys.LIQUIDITY_PROVISION_AMENDMENT]:
    'Liquidity Provision Amendment',
  [TransactionKeys.TRANSFER]: 'Transfer',
  [TransactionKeys.CANCEL_TRANSFER]: 'Cancel Transfer',
  [TransactionKeys.ANNOUNCE_NODE]: 'Announce Node',
  [TransactionKeys.BATCH_MARKET_INSTRUCTIONS]: 'Batch Market Instructions',
  [TransactionKeys.STOP_ORDERS_SUBMISSION]: 'Stop Orders Submission',
  [TransactionKeys.STOP_ORDERS_CANCELLATION]: 'Stop Orders Cancellation',
  [TransactionKeys.CREATE_REFERRAL_SET]: 'Create Referral Set',
  [TransactionKeys.UPDATE_REFERRAL_SET]: 'Update Referral Set',
  [TransactionKeys.APPLY_REFERRAL_CODE]: 'Apply Referral Code',
  [TransactionKeys.NODE_VOTE]: 'Node Vote',
  [TransactionKeys.NODE_SIGNATURE]: 'Node Signature',
  [TransactionKeys.CHAIN_EVENT]: 'Chain Event',
  [TransactionKeys.KEY_ROTATE_SUBMISSION]: 'Key Rotate Submission',
  [TransactionKeys.STATE_VARIABLE_PROPOSAL]: 'State Variable Proposal',
  [TransactionKeys.VALIDATOR_HEARTBEAT]: 'Validator Heartbeat',
  [TransactionKeys.ETHEREUM_KEY_ROTATE_SUBMISSION]:
    'Ethereum Key Rotate Submission',
  [TransactionKeys.PROTOCOL_UPGRADE_PROPOSAL]: 'Protocol Upgrade Proposal',
  [TransactionKeys.ISSUE_SIGNATURES]: 'Issue Signatures',
  [TransactionKeys.ORACLE_DATA_SUBMISSION]: 'Oracle Data Submission',
  [TransactionKeys.UPDATE_MARGIN_MODE]: 'Update Margin Mode',
  [TransactionKeys.JOIN_TEAM]: 'Join Team',
  [TransactionKeys.BATCH_PROPOSAL_SUBMISSION]: 'Batch Proposal Submission',
};

type TransactionData = Record<string, any>;

export type Transaction = {
  [key in TransactionKeys]?: TransactionData;
};

export enum SendingMode {
  ASYNC = 'TYPE_ASYNC',
  SYNC = 'TYPE_SYNC',
  COMMIT = 'TYPE_COMMIT',
}

export interface TransactionMessage {
  transaction: Transaction;
  publicKey: string;
  name: string;
  wallet: string;
  sendingMode: string;
  origin: string;
  receivedAt: string;
  chainId: string;
}

export type IcebergOptions = {
  peakSize: string;
  minimumVisibleSize: string;
};

export function getTransactionType(tx: Transaction) {
  return Object.keys(tx)[0];
}
