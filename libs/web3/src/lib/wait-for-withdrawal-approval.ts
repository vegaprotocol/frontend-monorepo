import { type ApolloClient } from '@apollo/client';
import { type VegaStoredTxState } from './use-vega-transaction-store';
import {
  WithdrawalApprovalDocument,
  type WithdrawalApprovalQuery,
  type WithdrawalApprovalQueryVariables,
} from './__generated__/WithdrawalApproval';

export const waitForWithdrawalApproval = (
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
