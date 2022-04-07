import { gql, useApolloClient } from "@apollo/client";
import React from "react";

import {
  Erc20Approval,
  Erc20Approval_erc20WithdrawalApproval,
  Erc20ApprovalVariables,
} from "./__generated__/Erc20Approval";

const ERC20_APPROVAL_QUERY = gql`
  query Erc20Approval($withdrawalId: ID!) {
    erc20WithdrawalApproval(withdrawalId: $withdrawalId) {
      assetSource
      amount
      nonce
      signatures
      targetAddress
      expiry
    }
  }
`;

export const usePollERC20Approval = (withdrawalId: string) => {
  const mountedRef = React.useRef(true);
  const client = useApolloClient();
  const [erc20Approval, setErc20Approval] =
    React.useState<Erc20Approval_erc20WithdrawalApproval | null>(null);

  const safeSetErc20Approval = (
    approval: Erc20Approval_erc20WithdrawalApproval
  ) => {
    if (mountedRef.current) {
      setErc20Approval(approval);
    }
  };

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await client.query<Erc20Approval, Erc20ApprovalVariables>({
          query: ERC20_APPROVAL_QUERY,
          variables: { withdrawalId },
        });

        if (res.data.erc20WithdrawalApproval) {
          safeSetErc20Approval(res.data.erc20WithdrawalApproval);
          clearInterval(interval);
        }
      } catch (err) {
        // No op. If the erc20 withdrawal is not created yet it will error
        // but we will just want to poll until it is. There is no bus event for
        // erc20 approvals yet..
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      mountedRef.current = false;
    };
  }, [withdrawalId, client]);

  return erc20Approval;
};
