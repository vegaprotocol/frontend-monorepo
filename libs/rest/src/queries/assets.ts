import { removePaginationWrapper } from '@vegaprotocol/utils';

import { restApiUrl } from '../paths';
import {
  type v2GetAssetResponse,
  type v2ListAssetsResponse,
  type vegaAsset,
  vegaAssetStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';
import { z } from 'zod';
import { type QueryClient } from '@tanstack/react-query';
import { assetOptions, assetsOptions } from '../hooks/use-assets';

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
  const assets = removePaginationWrapper(res.data.assets?.edges).map(mapAsset);
  const map = new Map(Object.entries(keyBy(compact(assets), 'id')));
  return assetsSchema.parse(map);
};

const pathParamsSchema = z.object({
  assetId: z.string(),
});

export const retrieveAsset = async (pathParams: { assetId?: string }) => {
  const params = pathParamsSchema.parse(pathParams);
  const endpoint = restApiUrl('/api/v2/asset/{assetId}', params);
  const res = await axios.get<v2GetAssetResponse>(endpoint);
  if (!res.data.asset) throw new Error('asset not found');
  const asset = mapAsset(res.data.asset);
  return erc20AssetSchema.parse(asset);
};

export const enabledAssets = (assets?: vegaAsset[]) => {
  return compact(
    assets?.filter((a) => a.status === vegaAssetStatus.STATUS_ENABLED)
  );
};

function mapAsset(asset: vegaAsset) {
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
}

/**
 * Fetch and cache assets. Use this if you need asset data
 * for other queries.
 */
export async function getAssets(queryClient: QueryClient) {
  const assets = await queryClient.fetchQuery(assetsOptions());

  if (!assets) {
    throw new Error('no assets');
  }

  return assets;
}

/** Fetch and cache single asset */
export async function getAsset(queryClient: QueryClient, assetId: string) {
  const asset = await queryClient.fetchQuery(
    assetOptions(queryClient, assetId)
  );

  if (!asset) {
    throw new Error(`asset ${assetId} not fuond`);
  }

  return asset;
}

export function getAssetsFromCache(queryClient: QueryClient) {
  return queryClient.getQueryData<Assets>(queryKeys.all);
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
