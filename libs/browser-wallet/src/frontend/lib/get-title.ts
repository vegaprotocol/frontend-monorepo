import type { Transaction } from '@/lib/transactions';
import {
  HALF_MAX_POSITION_SIZE,
  TRANSACTION_TITLES,
  TransactionKeys,
} from '@/lib/transactions';

const processTitle = (type: TransactionKeys, data: any) => {
  // If we have a mass order cancellation (i.e. no order ID, with or without a market ID)
  // then we want to display a different title
  if (type === TransactionKeys.ORDER_CANCELLATION && !data?.orderId) {
    return 'Mass Order Cancellation';
  } else if (
    type === TransactionKeys.ORDER_SUBMISSION &&
    data &&
    data.reduceOnly &&
    data.size === HALF_MAX_POSITION_SIZE
  ) {
    return 'Close Position';
  } else if (type === TransactionKeys.UPDATE_REFERRAL_SET && data) {
    return data.isTeam ? 'Update Team' : 'Update Referral Set';
  } else if (type === TransactionKeys.CREATE_REFERRAL_SET && data) {
    return data.isTeam ? 'Update Team' : 'Create Referral Set';
  }

  return TRANSACTION_TITLES[type];
};

export const getBatchTitle = (type: TransactionKeys, data: any) => {
  return processTitle(type, data);
};

export const getTitle = (transaction: Transaction) => {
  const type = Object.keys(transaction)[0] as TransactionKeys;

  return processTitle(type, transaction[type]);
};
