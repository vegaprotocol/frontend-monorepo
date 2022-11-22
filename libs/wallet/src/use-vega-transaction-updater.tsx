import { useApolloClient } from '@apollo/client';
import { useVegaWallet } from './use-vega-wallet';
import {
  useOrderBusEventsSubscription,
  useWithdrawalBusEventSubscription,
  useTransactionEventSubscription,
} from './__generated__/TransactionResult';
import { useVegaTransactionStore } from './use-vega-transaction-store';

import { waitForWithdrawalApproval } from './wait-for-withdrawal-approval';

export const useVegaTransactionUpdater = () => {
  const client = useApolloClient();
  const { updateWithdrawal, updateOrder, updateTransaction } =
    useVegaTransactionStore((state) => ({
      updateWithdrawal: state.updateWithdrawal,
      updateOrder: state.updateOrder,
      updateTransaction: state.updateTransactionResult,
    }));
  const { pubKey } = useVegaWallet();
  const variables = { partyId: pubKey || '' };
  const skip = !pubKey;

  useOrderBusEventsSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Order') {
          updateOrder(event.event);
        }
      }),
  });

  useWithdrawalBusEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'Withdrawal') {
          const withdrawal = event.event;
          waitForWithdrawalApproval(withdrawal.id, client).then((approval) =>
            updateWithdrawal(withdrawal, approval)
          );
        }
      }),
  });

  useTransactionEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'TransactionResult') {
          updateTransaction(event.event);
        }
      }),
  });
};
