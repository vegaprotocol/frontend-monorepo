import { useApolloClient } from '@apollo/client';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  useOrderTxUpdateSubscription,
  useWithdrawalBusEventSubscription,
  useTransactionEventSubscription,
  usePositionUpdateSubscription,
} from './__generated__/TransactionResult';
import { useVegaTransactionStore } from './use-vega-transaction-store';
import { waitForWithdrawalApproval } from './wait-for-withdrawal-approval';
import {
  determineId,
  isStopOrdersSubmissionTransaction,
} from '@vegaprotocol/wallet';
import { waitForStopOrder } from './wait-for-stop-order';
import {
  StopOrderRejectionReasonMapping,
  StopOrderStatus,
  StopOrderStatusMapping,
} from '@vegaprotocol/types';

export const useVegaTransactionUpdater = () => {
  const client = useApolloClient();
  const updateWithdrawal = useVegaTransactionStore(
    (state) => state.updateWithdrawal
  );
  const updateOrder = useVegaTransactionStore((state) => state.updateOrder);
  const updatePosition = useVegaTransactionStore(
    (state) => state.updatePosition
  );
  const updateTransaction = useVegaTransactionStore(
    (state) => state.updateTransactionResult
  );
  const getTransaction = useVegaTransactionStore(
    (state) => state.getTransaction
  );

  const { pubKey } = useVegaWallet();
  const variables = { partyId: pubKey || '' };
  const skip = !pubKey;

  useOrderTxUpdateSubscription({
    variables,
    skip,
    fetchPolicy: 'no-cache',
    onData: ({ data: result }) =>
      result.data?.orders?.forEach((order) => {
        updateOrder(order);
      }),
  });

  usePositionUpdateSubscription({
    variables,
    skip,
    fetchPolicy: 'no-cache',
    onData: ({ data: result }) =>
      result.data?.positions.forEach((position) => {
        updatePosition(position);
      }),
  });

  useWithdrawalBusEventSubscription({
    variables,
    skip,
    fetchPolicy: 'no-cache',
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Withdrawal') {
          const withdrawal = event.event;
          waitForWithdrawalApproval(withdrawal.id, client).then((approval) => {
            updateWithdrawal(withdrawal, approval);
          });
        }
      }),
  });

  useTransactionEventSubscription({
    variables,
    skip,
    fetchPolicy: 'no-cache',
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach(({ event }) => {
        if (event.__typename === 'TransactionResult') {
          let updateImmediately = true;
          if (event.status && !event.error) {
            const transaction = getTransaction(event.hash.toLocaleLowerCase());
            if (
              transaction &&
              transaction.signature &&
              isStopOrdersSubmissionTransaction(transaction.body)
            ) {
              waitForStopOrder(determineId(transaction.signature), client).then(
                (stopOrder) => {
                  updateTransaction(
                    stopOrder &&
                      stopOrder.status === StopOrderStatus.STATUS_REJECTED
                      ? {
                          ...event,
                          error:
                            (stopOrder.rejectionReason &&
                              StopOrderRejectionReasonMapping[
                                stopOrder.rejectionReason
                              ]) ||
                            StopOrderStatusMapping[stopOrder.status],
                        }
                      : event
                  );
                }
              );
              updateImmediately = false;
            }
          }
          if (updateImmediately) {
            updateTransaction(event);
          }
        }
      }),
  });
};
