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
import { getMarkets } from './markets';
import type { QueryClient } from '@tanstack/react-query';

export { v1AMMStatus as AMMStatus };

const ammStatusSchema = z.nativeEnum(v1AMMStatus);

const ammStatusReasonSchema = z.nativeEnum(AMMStatusReason);

const searchParamsSchema = z.object({
  id: z.optional(z.string().length(64)),
  partyId: z.optional(z.string().length(64)),
  marketId: z.optional(z.string().length(64)),
  ammPartyId: z.optional(z.string().length(64)),
  status: z.optional(ammStatusSchema),
});
export type SearchParams = z.infer<typeof searchParamsSchema>;

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
  leverageAtUpperBound: z.number(),
  lowerBound: z.instanceof(Decimal),
  leverageAtLowerBound: z.number(),
  market: z.object({
    code: z.string(),
  }),
});
const ammsSchema = z.array(ammSchema);

export type AMM = z.infer<typeof ammSchema>;
export type AMMs = z.infer<typeof ammsSchema>;

export const retrieveAMMs = async (
  queryClient: QueryClient,
  params?: SearchParams
) => {
  const endpoint = restApiUrl('/api/v2/amms');

  const searchParams = searchParamsSchema.parse(params);
  const [markets, res] = await Promise.all([
    getMarkets(queryClient),
    axios.get<v2ListAMMsResponse>(endpoint, {
      params: new URLSearchParams(searchParams),
    }),
  ]);

  const edges = res.data.amms?.edges;
  const rawAMMs = removePaginationWrapper(edges);

  const amms = rawAMMs.map((a) => {
    if (!a.marketId) {
      throw new Error('missing marketId');
    }

    const market = markets.get(a.marketId);

    if (!market) {
      throw new Error('market for amm not found');
    }

    const data = {
      id: a.id,
      marketId: a.marketId,
      partyId: a.partyId,
      ammPartyId: a.ammPartyId,

      commitment: new Decimal(
        a.commitment || 0,
        market.settlementAsset.decimals
      ),
      proposedFee: a.proposedFee,
      status: a.status,
      statusReason: a.statusReason,

      // concentrated liquidity parameters:
      base: new Decimal(a.parameters?.base, market.decimalPlaces),
      upperBound: new Decimal(a.parameters?.upperBound, market.decimalPlaces),
      leverageAtUpperBound: Number(a.parameters?.leverageAtUpperBound),
      lowerBound: new Decimal(a.parameters?.lowerBound, market.decimalPlaces),
      leverageAtLowerBound: Number(a.parameters?.leverageAtLowerBound),

      market: {
        code: market.code,
      },
    };

    return data;
  });

  return ammsSchema.parse(amms);
};

export const ACTIVE_AMM_STATUSES = [
  v1AMMStatus.STATUS_ACTIVE,
  v1AMMStatus.STATUS_REDUCE_ONLY,
];

export const INACTIVE_AMM_STATUSES = [
  v1AMMStatus.STATUS_UNSPECIFIED,
  v1AMMStatus.STATUS_REJECTED,
  v1AMMStatus.STATUS_CANCELLED,
  v1AMMStatus.STATUS_STOPPED,
];

export const isActiveAMM = (amm: AMM) => {
  return ACTIVE_AMM_STATUSES.includes(amm.status);
};

export const queryKeys = {
  all: ['amm'],
  list: () => [...queryKeys.all, 'list'],
  filtered: (params: SearchParams) => [
    ...queryKeys.all,
    'filtered',
    { params },
  ],
} as const;
