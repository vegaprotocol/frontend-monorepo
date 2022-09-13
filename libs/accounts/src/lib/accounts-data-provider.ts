import produce from 'immer';
import {
  AccountsDocument,
  AccountEventsDocument,
} from './__generated___/Accounts';
import type {
  AccountsQuery,
  AccountEventsSubscription,
  AccountFieldsFragment,
} from './__generated___/Accounts';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { AccountType } from '@vegaprotocol/types';

interface Account {
  type: AccountType;
  balance: string;
  market: {
    id: string;
    name: string;
  } | null;
  asset: {
    symbol: string;
    decimals: number;
  };
}

export const getId = (data: Account) =>
  `${data.type}-${data.asset.symbol}-${data.market?.id ?? 'null'}`;

const update = (data: Account[], delta: Account[]) => {
  return produce(data, (draft) => {
    // @ts-ignore FIXME stagnet3 update
    const id = getId(delta);
    const index = draft.findIndex((a) => getId(a) === id);
    if (index !== -1) {
      // @ts-ignore FIXME stagnet3 update
      draft[index] = delta;
    } else {
      // @ts-ignore FIXME stagnet3 update
      draft.push(delta);
    }
  });
};

const getData = (responseData: AccountsQuery): Account[] | null => {
  if (!responseData?.party?.accounts?.length) return null;
  return responseData.party?.accounts?.map((a) => {
    return {
      type: a.type,
      balance: a.balance,
      market: a.market
        ? {
            id: a.market.id,
            name: a.market.tradableInstrument.instrument.name,
          }
        : null,
      asset: {
        symbol: a.asset.symbol,
        decimals: a.asset.decimals,
      },
    };
  });
};

const getDelta = (subscriptionData: AccountEventsSubscription): Account[] => {
  // return subscriptionData.accounts

  // what to do here?
  // @ts-ignore how to retrieve market data for each account?
  return subscriptionData.accounts.map((a) => ({
    type: a.type,
    balance: a.balance,
    asset: {},
    market: a.marketId ? {} : null,
  }));
};

export const accountsDataProvider = makeDataProvider<
  AccountsQuery,
  Account[],
  AccountEventsSubscription,
  AccountFieldsFragment
>({
  query: AccountsDocument,
  subscriptionQuery: AccountEventsDocument,
  // @ts-ignore FIXME stagnet3 update
  update,
  getData,
  // @ts-ignore FIXME stagnet3 update
  getDelta,
});
