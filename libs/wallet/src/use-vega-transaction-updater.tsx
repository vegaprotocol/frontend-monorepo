import type { SubscriptionResult } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { useVegaWallet } from './use-vega-wallet';
import type {
  OrderTxUpdateSubscription,
  OrderTxUpdateSubscriptionVariables,
} from './__generated__/TransactionResult';
import type {
  WithdrawalBusEventSubscription,
  WithdrawalBusEventSubscriptionVariables,
  TransactionEventSubscription,
  TransactionEventSubscriptionVariables,
} from './__generated__/TransactionResult';
import {
  useOrderTxUpdateSubscription,
  useWithdrawalBusEventSubscription,
  useTransactionEventSubscription,
} from './__generated__/TransactionResult';
import { useVegaTransactionStore } from './use-vega-transaction-store';

import { waitForWithdrawalApproval } from './wait-for-withdrawal-approval';
import { useCallback, useMemo } from 'react';

export const useVegaTransactionUpdater = () => {
  const client = useApolloClient();
  const updateWithdrawal = useVegaTransactionStore(
    (state) => state.updateWithdrawal
  );
  const updateOrder = useVegaTransactionStore((state) => state.updateOrder);
  const updateTransaction = useVegaTransactionStore(
    (state) => state.updateTransactionResult
  );

  const { pubKey } = useVegaWallet();
  const variables = useMemo(() => ({ partyId: pubKey || '' }), [pubKey]);
  const skip = !pubKey;

  const onOrderUpdate = useCallback(
    ({
      data: result,
    }: {
      data: SubscriptionResult<
        OrderTxUpdateSubscription,
        OrderTxUpdateSubscriptionVariables
      >;
    }) =>
      result.data?.orders?.forEach((order) => {
        updateOrder(order);
      }),
    [updateOrder]
  );

  const orderSubscriptionOptions = useMemo(
    () => ({
      variables,
      skip,
      onData: onOrderUpdate,
    }),
    [variables, skip, onOrderUpdate]
  );

  useOrderTxUpdateSubscription(orderSubscriptionOptions);

  const onWithdrawalUpdate = useCallback(
    ({
      data: result,
    }: {
      data: SubscriptionResult<
        WithdrawalBusEventSubscription,
        WithdrawalBusEventSubscriptionVariables
      >;
    }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Withdrawal') {
          const withdrawal = event.event;
          waitForWithdrawalApproval(withdrawal.id, client).then((approval) =>
            updateWithdrawal(withdrawal, approval)
          );
        }
      }),
    [waitForWithdrawalApproval, client, updateWithdrawal]
  );

  const withdrawalSubscriptionOptions = useMemo(
    () => ({
      variables,
      skip,
      onData: onWithdrawalUpdate,
    }),
    [variables, skip, onWithdrawalUpdate]
  );
  useWithdrawalBusEventSubscription(withdrawalSubscriptionOptions);

  const onUpdateTransaction = useCallback(
    ({
      data: result,
    }: {
      data: SubscriptionResult<
        TransactionEventSubscription,
        TransactionEventSubscriptionVariables
      >;
    }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'TransactionResult') {
          updateTransaction(event.event);
        }
      }),
    [updateTransaction]
  );
  const transactionSubscriptionOption = useMemo(
    () => ({
      variables,
      skip,
      onData: onUpdateTransaction,
    }),
    [variables, skip, onUpdateTransaction]
  );

  useTransactionEventSubscription(transactionSubscriptionOption);
};
