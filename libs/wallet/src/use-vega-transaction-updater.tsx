import type { ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { useVegaWallet } from './use-vega-wallet';
import {
  useOrderBusEventsSubscription,
  useWithdrawalBusEventSubscription,
  useTransactionEventSubscription,
} from './__generated__/TransactionResult';
import { useVegaTransactionStore } from './use-vega-transaction-store';
import type { VegaStoredTxState } from './use-vega-transaction-store';
import type {
  WithdrawalApprovalQuery,
  WithdrawalApprovalQueryVariables,
} from './__generated__/WithdrawalApproval';
import { WithdrawalApprovalDocument } from './__generated__/WithdrawalApproval';

const waitForWithdrawalApproval = (
  withdrawalId: string,
  client: ApolloClient<object>
) =>
  new Promise<NonNullable<VegaStoredTxState['withdrawalApproval']>>(
    (resolve) => {
      const interval = setInterval(async () => {
        try {
          const res = await client.query<
            WithdrawalApprovalQuery,
            WithdrawalApprovalQueryVariables
          >({
            query: WithdrawalApprovalDocument,
            variables: { withdrawalId },
            fetchPolicy: 'network-only',
          });

          if (
            res.data.erc20WithdrawalApproval &&
            res.data.erc20WithdrawalApproval.signatures.length > 2
          ) {
            clearInterval(interval);
            resolve(res.data.erc20WithdrawalApproval);
          }
        } catch (err) {
          // no op as the query will error until the approval is created
        }
      }, 1000);
    }
  );

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
          waitForWithdrawalApproval(event.event.id, client).then((approval) =>
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
