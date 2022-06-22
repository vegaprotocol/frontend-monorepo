import { gql } from '@apollo/client';

const FUNDING_FRAGMENT = gql`
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

export const FUNDING_QUERY = gql`
  ${FUNDING_FRAGMENT}
  query Funding($partyId: ID!) {
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
