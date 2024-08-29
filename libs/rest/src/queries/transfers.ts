import { type QueryClient } from '@tanstack/react-query';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../paths';
import {
  v1TransferStatus,
  type v2ListTransfersResponse,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { Decimal } from '../utils';
import { erc20AssetSchema, getAssets } from './assets';

const transferStatusSchema = z.nativeEnum(v1TransferStatus);

const queyrParamsSchema = z.object({
  'pagination.first': z
    .number()
    .optional()
    .transform((v) => (v ? String(v) : undefined)),
  'pagination.last': z
    .number()
    .optional()
    .transform((v) => (v ? String(v) : undefined)),
  isReward: z
    .boolean()
    .optional()
    .transform((v) => (v ? 'true' : 'false')),
  status: transferStatusSchema.optional(),
});
export type QueryParams = z.input<typeof queyrParamsSchema>;

const transferSchema = z.object({
  id: z.string(),
  amount: z.instanceof(Decimal),
  asset: erc20AssetSchema,
});
export type Transfer = z.infer<typeof transferSchema>;

const transfersSchema = z.array(transferSchema);

export const retrieveTransfers = async (
  queryClient: QueryClient,
  params?: QueryParams
) => {
  const queryParams = queyrParamsSchema.parse(params);
  const endpoint = restApiUrl('/api/v2/transfers');
  const assets = await getAssets(queryClient);
  const res = await axios.get<v2ListTransfersResponse>(endpoint, {
    params: new URLSearchParams(queryParams),
  });
  const tranfers = removePaginationWrapper(res.data.transfers?.edges).map(
    (t) => {
      const transfer = t.transfer;
      if (!transfer) return null;
      if (!transfer.asset) return null;
      const asset = assets.get(transfer.asset);
      if (!asset) return null;
      return {
        id: transfer.id,
        amount: new Decimal(transfer.amount, asset.decimals),
        asset,
      };
    }
  );

  return transfersSchema.parse(tranfers);
};

export const queryKeys = {
  all: ['transfers'],
  list: (params?: QueryParams) => [...queryKeys.all, params],
} as const;
