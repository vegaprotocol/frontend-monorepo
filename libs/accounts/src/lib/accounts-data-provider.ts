import produce from 'immer';
import { gql } from '@apollo/client';
import type {
  Accounts,
  Accounts_party_accounts,
} from './__generated__/Accounts';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

import type {
  AccountSubscribe,
  AccountSubscribe_accounts,
} from './__generated__/AccountSubscribe';

const ACCOUNTS_FRAGMENT = gql`
  fragment AccountFields on Account {
    type
    balance
    market {
      id
      name
    }
    asset {
      id
      symbol
      decimals
    }
  }
`;

const ACCOUNTS_QUERY = gql`
  ${ACCOUNTS_FRAGMENT}
  query Accounts($partyId: ID!) {
    party(id: $partyId) {
      id
      accounts {
        ...AccountFields
      }
    }
  }
`;

export const ACCOUNTS_SUB = gql`
  ${ACCOUNTS_FRAGMENT}
  subscription AccountSubscribe($partyId: ID!) {
    accounts(partyId: $partyId) {
      ...AccountFields
    }
  }
`;

export const getId = (
  data: Accounts_party_accounts | AccountSubscribe_accounts
) => `${data.type}-${data.asset.symbol}-${data.market?.id ?? 'null'}`;

const update = (
  data: Accounts_party_accounts[],
  delta: AccountSubscribe_accounts
) => {
  return produce(data, (draft) => {
    const id = getId(delta);
    const index = draft.findIndex((a) => getId(a) === id);
    if (index !== -1) {
      draft[index] = delta;
    } else {
      draft.push(delta);
    }
  });
};

const getData = (responseData: Accounts): Accounts_party_accounts[] | null =>
  responseData.party ? responseData.party.accounts : null;
const getDelta = (
  subscriptionData: AccountSubscribe
): AccountSubscribe_accounts => subscriptionData.accounts;

export const accountsDataProvider = makeDataProvider<
  Accounts,
  Accounts_party_accounts[],
  AccountSubscribe,
  AccountSubscribe_accounts
>(ACCOUNTS_QUERY, ACCOUNTS_SUB, update, getData, getDelta);
