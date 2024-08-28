import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../paths';
import {
  type v2ListAccountsResponse,
  vegaAccountType,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { erc20AssetSchema, getAssetFromCache } from './assets';
import { Decimal } from '../utils';
import { type QueryClient } from '@tanstack/react-query';

const queryParamSchema = z.object({
  'filter.accountTypes': z.string(),
});

type QueryParams = z.infer<typeof queryParamSchema>;

export const accountSchema = z.object({
  type: z.nativeEnum(vegaAccountType),
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

  const accounts = removePaginationWrapper(res.data.accounts?.edges).map(
    (account) => {
      if (!account.asset) return null;

      const asset = getAssetFromCache(queryClient, account.asset);
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
  all: ['rewards'],
  list: () => [...queryKeys.all, 'list'],
} as const;
