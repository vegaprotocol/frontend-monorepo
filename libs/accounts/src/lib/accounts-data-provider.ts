import produce from 'immer';
import { AccountsDocument, AccountEventsDocument } from './__generated__/Accounts';
import type {
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
} from './__generated__/Accounts';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

export const getId = (
  data: AccountFieldsFragment,
) => `${data.type}-${data.asset.symbol}-${data.market?.id ?? 'null'}`;

const update = (
  data: AccountFieldsFragment[],
  delta: AccountFieldsFragment
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

const getData = (responseData: AccountsQuery): AccountFieldsFragment[] | null => {
  return responseData.party?.accounts ?? null;
}

const getDelta = (
  subscriptionData: AccountEventsSubscription
): AccountFieldsFragment => subscriptionData.accounts;

export const accountsDataProvider = makeDataProvider<
  AccountsQuery,
  AccountFieldsFragment[],
  AccountEventsSubscription,
  AccountFieldsFragment
>({
  query: AccountsDocument,
  subscriptionQuery: AccountEventsDocument,
  update,
  getData,
  getDelta,
});
