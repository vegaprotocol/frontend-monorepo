import { removePaginationWrapper } from '@vegaprotocol/utils';

import { restApiUrl } from '../paths';
import {
  type v2ListAssetsResponse,
  type vegaAsset,
  vegaAssetStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';
import { z } from 'zod';
import { type QueryClient } from '@tanstack/react-query';

export const erc20AssetSchema = z.object({
  id: z.string(),
  type: z.literal('erc20'),
  status: z.nativeEnum(vegaAssetStatus),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  quantum: z.string(),
  chainId: z.number(),
  contractAddress: z.string(),
  lifetimeLimit: z.string(),
  withdrawThreshold: z.string(),
});
export type Asset = z.infer<typeof erc20AssetSchema>;

const assetsSchema = z.map(z.string(), erc20AssetSchema);

export type ERC20Asset = z.infer<typeof erc20AssetSchema>;
export type Assets = z.infer<typeof assetsSchema>;

export const retrieveAssets = async () => {
  const endpoint = restApiUrl('/api/v2/assets');
  const res = await axios.get<v2ListAssetsResponse>(endpoint);
  const edges = res.data.assets?.edges;
  const rawAssets = removePaginationWrapper(edges);
  const assets = rawAssets.map((asset) => {
    if (!asset.details?.erc20) return null;
    return {
      id: asset.id,
      type: 'erc20',
      status: asset.status,
      name: asset.details?.name,
      symbol: asset.details.symbol,
      decimals: Number(asset.details.decimals),
      quantum: asset.details.quantum,
      chainId: Number(asset.details.erc20.chainId),
      contractAddress: asset.details.erc20.contractAddress,
      lifetimeLimit: asset.details.erc20.lifetimeLimit,
      withdrawThreshold: asset.details.erc20.withdrawThreshold,
    };
  });

  const map = new Map(Object.entries(keyBy(compact(assets), 'id')));
  return assetsSchema.parse(map);
};

export const enabledAssets = (assets?: vegaAsset[]) => {
  return compact(
    assets?.filter((a) => a.status === vegaAssetStatus.STATUS_ENABLED)
  );
};

export function getAssetsFromCache(queryClient: QueryClient) {
  const assets = queryClient.getQueryData<Assets>(queryKeys.all);

  if (!assets) {
    throw new Error('assets not cached');
  }

  return assets;
}

export function getAssetFromCache(queryClient: QueryClient, assetId: string) {
  const assets = getAssetsFromCache(queryClient);
  const asset = assets.get(assetId);

  if (!asset) {
    throw new Error(`asset ${assetId} not fuond`);
  }

  return asset;
}

export const queryKeys = {
  all: ['assets'],
  list: () => [...queryKeys.all, 'list'],
  single: (assetId?: string | null) => [
    ...queryKeys.all,
    'single',
    { assetId },
  ],
} as const;
