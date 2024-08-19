import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../paths';
import {
  AMMStatusReason,
  v1AMMStatus,
  type v2ListAMMsResponse,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { Decimal } from '../utils';
import { getMarketFromCache } from './markets';
import type { QueryClient } from '@tanstack/react-query';

const ammStatusSchema = z.nativeEnum(v1AMMStatus);
const ammStatusReasonSchema = z.nativeEnum(AMMStatusReason);

const parametersSchema = z.object({
  id: z.optional(z.string().length(64)),
  partyId: z.optional(z.string().length(64)),
  marketId: z.optional(z.string().length(64)),
  ammPartyId: z.optional(z.string().length(64)),
  status: z.optional(ammStatusSchema),
});

export type AMMsQueryParams = z.infer<typeof parametersSchema>;

const ammSchema = z.object({
  id: z.string().length(64),
  marketId: z.string().length(64),
  partyId: z.string().length(64),
  ammPartyId: z.optional(z.string().length(64)),
  commitment: z.instanceof(Decimal),
  proposedFee: z.string(),
  status: ammStatusSchema,
  statusReason: z.optional(ammStatusReasonSchema),
  // concentrated liquidity parameters:
  base: z.instanceof(Decimal),
  upperBound: z.instanceof(Decimal),
  leverageAtUpperBound: z.instanceof(Decimal),
  lowerBound: z.instanceof(Decimal),
  leverageAtLowerBound: z.instanceof(Decimal),
  market: z.object({
    code: z.string(),
  }),
});
const ammsSchema = z.array(ammSchema);

export type AMM = z.infer<typeof ammSchema>;
export type AMMs = z.infer<typeof ammsSchema>;

export const retrieveAMMs = async (
  queryClient: QueryClient,
  params?: AMMsQueryParams
) => {
  const endpoint = restApiUrl('/api/v2/amms');

  const searchParams = parametersSchema.parse(params);

  const res = await axios.get<v2ListAMMsResponse>(endpoint, {
    params: new URLSearchParams(searchParams),
  });

  const edges = res.data.amms?.edges;
  const rawAMMs = removePaginationWrapper(edges);

  const amms = rawAMMs.map((a) => {
    if (!a.marketId) {
      throw new Error('missing marketId');
    }

    const market = getMarketFromCache(queryClient, a.marketId);

    if (!market) {
      throw new Error('market for amm not found');
    }

    const asset = market.quoteAsset;

    const data = {
      id: a.id,
      marketId: a.marketId,
      partyId: a.partyId,
      ammPartyId: a.ammPartyId,

      commitment: new Decimal(a.commitment || 0, asset.decimals),
      proposedFee: a.proposedFee,
      status: a.status,
      statusReason: a.statusReason,

      // concentrated liquidity parameters:
      base: new Decimal(a.parameters?.base, asset.decimals),
      upperBound: new Decimal(a.parameters?.upperBound, asset.decimals),
      leverageAtUpperBound: new Decimal(
        a.parameters?.leverageAtUpperBound,
        asset.decimals
      ),
      lowerBound: new Decimal(a.parameters?.lowerBound, asset.decimals),
      leverageAtLowerBound: new Decimal(
        a.parameters?.leverageAtLowerBound,
        asset.decimals
      ),

      market: {
        code: market.code,
      },
    };

    return data;
  });

  return ammsSchema.parse(amms);
};

export const queryKeys = {
  all: ['amm'],
  list: () => [...queryKeys.all, 'list'],
  filtered: (params: AMMsQueryParams) => [
    ...queryKeys.all,
    'filtered',
    { params },
  ],
} as const;
