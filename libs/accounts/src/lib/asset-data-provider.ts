import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { AssetsDocument } from './__generated__/Accounts';
import type {
  AssetsQuery,
  AssetsFieldsFragment,
} from './__generated__/Accounts';

const getData = (responseData: AssetsQuery) =>
  responseData.assetsConnection?.edges?.reduce((aggr, edge) => {
    if (edge?.node) {
      aggr.push(edge.node);
    }
    return aggr;
  }, [] as AssetsFieldsFragment[]) || null;

export const assetProvider = makeDataProvider<
  AssetsQuery,
  AssetsFieldsFragment[] | null,
  never,
  never
>({
  query: AssetsDocument,
  getData,
});
