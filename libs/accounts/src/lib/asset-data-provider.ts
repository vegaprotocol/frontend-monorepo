import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { AssetsDocument } from './__generated___/Accounts';
import type {
  AssetsQuery,
  AssetsFieldsFragment,
} from './__generated___/Accounts';

const getData = (responseData: AssetsQuery) =>
  responseData.assetsConnection?.edges
    ?.filter((e) => Boolean(e?.node))
    .map((e) => e?.node as AssetsFieldsFragment) ?? null;

export const assetProvider = makeDataProvider<
  AssetsQuery,
  AssetsFieldsFragment[] | null,
  never,
  never
>({
  query: AssetsDocument,
  getData,
});
