import { useQuery } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client';
import {
  AssetsV2Document,
  type AssetFieldsV2Fragment,
  type AssetsV2Query,
  type AssetsV2QueryVariables,
} from './__generated__/Assets';

export type Asset = AssetFieldsV2Fragment;

export const useAssets = () => {
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const result = await client.query<AssetsV2Query, AssetsV2QueryVariables>({
        query: AssetsV2Document,
        fetchPolicy: 'no-cache',
      });

      const assets = new Map<string, Asset>();

      if (!result.data.assetsConnection?.edges?.length) {
        return assets;
      }

      for (const edge of result.data.assetsConnection.edges) {
        const a = edge?.node;

        if (a) {
          assets.set(a.id, a);
        }
      }

      return assets;
    },
  });

  return queryResult;
};
