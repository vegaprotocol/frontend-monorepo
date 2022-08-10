import { gql } from '@apollo/client';

export const ERC20_APPROVAL_QUERY_NEW = gql`
  query Erc20ApprovalNew($withdrawalId: ID!) {
    erc20WithdrawalApproval(withdrawalId: $withdrawalId) {
      assetSource
      amount
      nonce
      signatures
      targetAddress
      expiry
      creation
    }
  }
`;
