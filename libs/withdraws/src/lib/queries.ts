import { gql } from '@apollo/client';

export const ERC20_APPROVAL_QUERY = gql`
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
