import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { ERC20_APPROVAL_QUERY } from './queries';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
  Erc20Approval_erc20WithdrawalApproval,
} from './__generated__/Erc20Approval';

export const useWithdrawalApproval = () => {
  const client = useApolloClient();
  // eslint-disable-next-line
  const intervalRef = useRef<any>();

  const waitForWithdrawalApproval = useCallback(
    (
      id: string,
      callback: (approval: Erc20Approval_erc20WithdrawalApproval) => void
    ) => {
      intervalRef.current = setInterval(async () => {
        try {
          const res = await client.query<Erc20Approval, Erc20ApprovalVariables>(
            {
              query: ERC20_APPROVAL_QUERY,
              variables: { withdrawalId: id },
              fetchPolicy: 'network-only',
            }
          );

          if (
            res.data.erc20WithdrawalApproval &&
            res.data.erc20WithdrawalApproval.signatures.length > 2
          ) {
            clearInterval(intervalRef.current);
            callback(res.data.erc20WithdrawalApproval);
          }
        } catch (err) {
          // no op as the query will error until the approval is created
        }
      }, 1000);
    },
    [client]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return waitForWithdrawalApproval;
};
