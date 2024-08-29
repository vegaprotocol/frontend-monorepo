import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../paths';
import {
  type v2ListAccountsResponse,
  vegaAccountType,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { erc20AssetSchema, getAssets } from './assets';
import { Decimal } from '../utils';
import { type QueryClient } from '@tanstack/react-query';

const accountTypeSchema = z.nativeEnum(vegaAccountType);
export type AccountType = z.infer<typeof accountTypeSchema>;

const queryParamSchema = z.object({
  'filter.accountTypes': accountTypeSchema.optional(),
  'filter.assetId': z.string().optional(),
});

export type QueryParams = z.input<typeof queryParamSchema>;

export const accountSchema = z.object({
  type: accountTypeSchema,
  asset: erc20AssetSchema,
  balance: z.instanceof(Decimal),
  marketId: z.string(),
  partyId: z.string(),
});
export type Reward = z.infer<typeof accountSchema>;

const accountsSchema = z.array(accountSchema);

export const retrieveAccounts = async (
  queryClient: QueryClient,
  params?: QueryParams
) => {
  const endpoint = restApiUrl('/api/v2/accounts');
  const queryParams = queryParamSchema.parse(params);
  const res = await axios.get<v2ListAccountsResponse>(endpoint, {
    params: new URLSearchParams(queryParams),
  });
  const assets = await getAssets(queryClient);

  const accounts = removePaginationWrapper(res.data.accounts?.edges).map(
    (account) => {
      if (!account.asset) return null;

      const asset = assets.get(account.asset);

      if (!asset) return null;

      return {
        type: account.type,
        asset,
        marketId: account.marketId,
        partyId: account.owner,
        balance: new Decimal(account.balance, asset.decimals),
      };
    }
  );

  return accountsSchema.parse(accounts);
};

export const queryKeys = {
  all: ['accounts'],
  list: (params?: QueryParams) => [...queryKeys.all, params],
} as const;
