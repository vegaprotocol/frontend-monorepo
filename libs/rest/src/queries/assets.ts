import { removePaginationWrapper } from '@vegaprotocol/utils';

import { restApiUrl, restApiUrl } from '../env';
import {
  type v2ListAssetsResponse,
  type vegaAsset,
  vegaAssetStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';
import { z } from 'zod';

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

export const retrieveAssets = async (apiUrl?: string) => {
  const API = apiUrl || restApiUrl();
  const res = await axios.get<v2ListAssetsResponse>(`${API}/assets`);
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

export const queryKeys = {
  all: ['assets'],
  list: () => [...queryKeys.all, 'list'],
  single: (assetId?: string | null) => [
    ...queryKeys.all,
    'single',
    { assetId },
  ],
} as const;
