import { removePaginationWrapper } from '@vegaprotocol/utils';

import { NODE_URL } from '../env';
import {
  type v2ListAllLiquidityProvisionsResponse,
  type v2ListLiquidityProvidersResponse,
  vegaLiquidityProvisionStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import groupBy from 'lodash/groupBy';
import maxBy from 'lodash/maxBy';
import { z } from 'zod';
import { Decimal } from '../utils';
import { getMarketFromCache } from './markets';

const parametersSchema = z.object({
  marketId: z.string(),
});

type QueryParams = z.infer<typeof parametersSchema>;

const liquidityProvisionsSchema = z.array(
  z.object({
    id: z.string(),
    marketId: z.string(),
    partyId: z.string(),
    commitmentAmount: z.instanceof(Decimal),
    status: z.nativeEnum(vegaLiquidityProvisionStatus),
  })
);

export async function retrieveLiquidityProviders(
  apiUrl: string | undefined,
  params: QueryParams
) {
  const API = apiUrl || NODE_URL;

  const searchParams = parametersSchema.parse(params);
  const res = await axios.get<v2ListLiquidityProvidersResponse>(
    `${API}/liquidity/providers`,
    {
      params: new URLSearchParams(searchParams),
    }
  );
  const providers = compact(
    res.data.liquidityProviders?.edges?.map((e) => e.node?.partyId)
  );

  return providers;
}

export async function retrieveLiquidityProvisions(
  apiUrl: string | undefined,
  params: QueryParams
) {
  const API = apiUrl || NODE_URL;

  const searchParams = parametersSchema.parse(params);

  const market = getMarketFromCache(searchParams.marketId);
  if (!market) {
    throw new Error('market not found');
  }

  const res = await axios.get<v2ListAllLiquidityProvisionsResponse>(
    `${API}/liquidity/all-provisions`,
    {
      params: new URLSearchParams(searchParams),
    }
  );

  const data = removePaginationWrapper(res.data.liquidityProvisions?.edges);
  const allCurrentProvisions = compact(
    data
      .map((d) => d.current)
      .map((p) => {
        if (
          !p ||
          !p.id ||
          !p.commitmentAmount ||
          !p.marketId ||
          !p.partyId ||
          !p.version
        ) {
          return;
        }
        return {
          id: p.id,
          marketId: p.marketId,
          partyId: p.partyId,
          commitmentAmount: new Decimal(
            p.commitmentAmount,
            market.quoteAsset.decimals
          ),
          status: p.status,
          version: Number(p.version),
        };
      })
  );

  const currentProvisions = Object.entries(
    groupBy(allCurrentProvisions, (p) => p?.id)
  ).map(([, provisions]) => {
    const currentProvision = maxBy(provisions, (p) => p.version);
    return currentProvision;
  });

  return liquidityProvisionsSchema.parse(currentProvisions);
}

export const queryKeys = {
  all: ['liquidity-provisions'],
  market: (marketId: string) => [...queryKeys.all, 'market', { marketId }],
  providers: (marketId: string) => [
    ...queryKeys.all,
    'providers',
    { marketId },
  ],
} as const;
