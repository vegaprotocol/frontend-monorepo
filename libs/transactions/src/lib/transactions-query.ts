import { gql } from '@apollo/client';

const TRANSACTIONS_FRAGMENT = gql`
  fragment DepositFields on Deposit {
    id
    amount
    createdTimestamp
    creditedTimestamp
    asset {
      id
      symbol
      decimals
    }
    status
    txHash
  }
  fragment WithdrawalFields on Withdrawal {
    id
    amount
    createdTimestamp
    withdrawnTimestamp
    asset {
      id
      symbol
      decimals
    }
    status
    txHash
  }
`;

export const TRANSACTIONS_QUERY = gql`
  ${TRANSACTIONS_FRAGMENT}
  query Transactions($partyId: ID!) {
    party(id: $partyId) {
      id
      deposits {
        ...DepositFields
      }
      withdrawals {
        ...WithdrawalFields
      }
    }
  }
`;
