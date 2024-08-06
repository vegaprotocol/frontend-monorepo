import type { Transaction } from '@/lib/transactions';
import { TransactionKeys } from '@/lib/transactions';

import { ApplyReferralCode } from './apply-referral-code';
import { BatchMarketInstructions } from './batch-market-instructions';
import { CreateReferralSet } from './create-referral-set';
import { DelegateSubmission } from './delegate-submission';
import { JoinTeam } from './join-team';
import { Amendment } from './orders/amend';
import { Cancellation } from './orders/cancellation';
import { StopOrderCancellation } from './orders/stop-cancellation';
import { StopOrderSubmission } from './orders/stop-submission';
import { Submission } from './orders/submission';
import type { ReceiptMap } from './receipts';
import { Transfer } from './transfer';
import { UndelegateSubmission } from './undelegate-submission';
import { UpdateMarginMode } from './update-margin-mode';
import { UpdateReferralSet } from './update-referral-set';
import { VoteSubmission } from './vote-submission';
import { Withdraw } from './withdrawal';

export const hasReceiptView = (transaction: Transaction) => {
  const type = Object.keys(transaction)[0] as TransactionKeys;
  const Component = TransactionMap[type];
  return !!Component;
};

export const TransactionMap: Partial<ReceiptMap> = {
  [TransactionKeys.TRANSFER]: Transfer,
  [TransactionKeys.WITHDRAW_SUBMISSION]: Withdraw,
  [TransactionKeys.ORDER_AMENDMENT]: Amendment,
  [TransactionKeys.ORDER_CANCELLATION]: Cancellation,
  [TransactionKeys.ORDER_SUBMISSION]: Submission,
  [TransactionKeys.STOP_ORDERS_SUBMISSION]: StopOrderSubmission,
  [TransactionKeys.STOP_ORDERS_CANCELLATION]: StopOrderCancellation,
  [TransactionKeys.BATCH_MARKET_INSTRUCTIONS]: BatchMarketInstructions,
  [TransactionKeys.APPLY_REFERRAL_CODE]: ApplyReferralCode,
  [TransactionKeys.VOTE_SUBMISSION]: VoteSubmission,
  [TransactionKeys.DELEGATE_SUBMISSION]: DelegateSubmission,
  [TransactionKeys.UNDELEGATE_SUBMISSION]: UndelegateSubmission,
  [TransactionKeys.UPDATE_MARGIN_MODE]: UpdateMarginMode,
  [TransactionKeys.CREATE_REFERRAL_SET]: CreateReferralSet,
  [TransactionKeys.UPDATE_REFERRAL_SET]: UpdateReferralSet,
  [TransactionKeys.JOIN_TEAM]: JoinTeam,
};
