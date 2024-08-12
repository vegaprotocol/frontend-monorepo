import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../env';
import { queryClient } from '../query-client';
import {
  AMMStatusReason,
  v1AMMStatus,
  type v2ListAMMsResponse,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { Decimal } from '../utils';
import { type Market, queryKeys as marketQueryKeys } from './markets';

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

export const retrieveAMMs = (apiUrl?: string, params?: AMMsQueryParams) => {
  const API = apiUrl || restApiUrl();

  const searchParams = parametersSchema.parse(params);

  return axios
    .get<v2ListAMMsResponse>(`${API}/amms`, {
      params: new URLSearchParams(searchParams),
    })
    .then((res) => {
      const edges = res.data.amms?.edges;
      const rawAMMs = removePaginationWrapper(edges);

      const amms = rawAMMs.map((a) => {
        const market = queryClient.getQueryData<Market>(
          marketQueryKeys.single(a.marketId)
        );

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
    });
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
