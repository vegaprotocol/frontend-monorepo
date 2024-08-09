import { NODE_URL } from '../env';
import {
  v2GetFeesStatsResponse,
  v2ListPaidLiquidityFeesResponse,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import omit from 'lodash/omit';
import { z } from 'zod';
import { Decimal, removePaginationWrapper } from '../utils';
import { getMarketFromCache } from './markets';

const parametersSchema = z.object({
  marketId: z.string(),
  epochSeq: z.optional(z.string()),
});
type QueryParams = z.infer<typeof parametersSchema>;

const totalSchema = z.array(
  z.object({
    assetId: z.string(),
    marketId: z.string(),
    epoch: z.number(),
    totalFeesPaid: z.instanceof(Decimal),
  })
);

const perPartySchema = z.array(
  z.object({
    assetId: z.string(),
    marketId: z.string(),
    partyId: z.string(),
    epoch: z.number(),
    amount: z.instanceof(Decimal),
    quantumAmount: z.instanceof(Decimal),
  })
);

const paidFeesSchema = z.object({
  total: totalSchema,
  perParty: perPartySchema,
  totalFeesPaid: z.instanceof(Decimal),
});

export async function retrieveLiquidityFees(
  apiUrl: string | undefined,
  params: QueryParams
) {
  const API = apiUrl || NODE_URL;

  let searchParams = parametersSchema.parse(params);
  if (searchParams.epochSeq == null) {
    searchParams = omit(searchParams, 'epochSeq');
  }

  const market = getMarketFromCache(searchParams.marketId);
  if (!market) {
    throw new Error('market not found');
  }

  const res = await axios.get<v2ListPaidLiquidityFeesResponse>(
    `${API}/liquidity/paidfees`,
    { params: new URLSearchParams(searchParams) }
  );

  const data = removePaginationWrapper(res.data.paidLiquidityFees?.edges);

  const total = compact(
    data.map((d) => {
      if (!d.totalFeesPaid || !d.asset || !d.market) return;
      return {
        assetId: d.asset,
        marketId: d.market,
        epoch: Number(d.epochSeq),
        totalFeesPaid: new Decimal(d.totalFeesPaid, market.quoteAsset.decimals),
      };
    })
  );

  const perParty = compact(
    flatten(
      data.map((d) => {
        if (!d.asset || !d.market || !d.feesPaidPerParty) return;
        return d.feesPaidPerParty.map((p) => {
          if (!p.party || !p.amount || !p.quantumAmount) return;
          return {
            assetId: d.asset,
            marketId: d.market,
            partyId: p.party,
            amount: new Decimal(p.amount, market.quoteAsset.decimals),
            quantumAmount: new Decimal(p.quantumAmount),
            epoch: Number(d.epochSeq),
          };
        });
      })
    )
  );

  return paidFeesSchema.parse({
    total,
    perParty,
    totalFeesPaid: new Decimal(
      BigNumber.sum.apply(
        null,
        total.length > 0 ? total.map((t) => t.totalFeesPaid.value) : [0]
      )
    ),
  });
}

export const liquidityFeesQueryKeys = {
  all: ['paid-fees'],
  market: (marketId: string, epochSeq?: string) => [
    ...liquidityFeesQueryKeys.all,
    'market',
    { marketId, epochSeq },
  ],
} as const;

const makerFeesSchema = z.object({
  perParty: z.array(
    z.object({
      assetId: z.string(),
      marketId: z.string(),
      partyId: z.string(),
      epoch: z.number(),
      amount: z.instanceof(Decimal),
      quantumAmount: z.instanceof(Decimal),
    })
  ),
  totalFeesPaid: z.instanceof(Decimal),
});

export async function retrieveMakerFees(
  apiUrl: string | undefined,
  params: QueryParams
) {
  const API = apiUrl || NODE_URL;

  let searchParams = parametersSchema.parse(params);
  if (searchParams.epochSeq == null) {
    searchParams = omit(searchParams, 'epochSeq');
  }

  const market = getMarketFromCache(searchParams.marketId);
  if (!market) {
    throw new Error('market not found');
  }

  const res = await axios.get<v2GetFeesStatsResponse>(`${API}/fees/stats`, {
    params: new URLSearchParams(searchParams),
  });

  const data = res.data.feesStats;

  const perParty = compact(
    data?.totalMakerFeesReceived?.map((d) => {
      if (!d.amount || !d.party || !d.quantumAmount) return;

      return {
        assetId: data.asset,
        marketId: data.market,
        partyId: d.party,
        epoch: Number(data.epochSeq),
        amount: new Decimal(d.amount, market.quoteAsset.decimals),
        quantumAmount: new Decimal(d.quantumAmount),
      };
    })
  );

  return makerFeesSchema.parse({
    perParty,
    totalFeesPaid: new Decimal(
      BigNumber.sum.apply(
        null,
        perParty.length > 0 ? perParty.map((p) => p.amount.value) : [0]
      )
    ),
  });
}

export const makerFeesQueryKeys = {
  all: ['make-fees'],
  market: (marketId: string, epochSeq?: string) => [
    ...makerFeesQueryKeys.all,
    'market',
    { marketId, epochSeq },
  ],
} as const;
