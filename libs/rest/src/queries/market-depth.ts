import { restApiUrl } from '../paths';
import { type vegaMarketDepth } from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { Decimal } from '../utils';
import { getMarket } from './markets';
import { type QueryClient } from '@tanstack/react-query';

const pathParamsSchema = z.object({
  marketId: z.string(),
});

export type PathParams = z.infer<typeof pathParamsSchema>;

const priceLevelSchema = z.object({
  //   ammVolume: z.instanceof(Decimal),
  //   ammVolumeEstimated: z.instanceof(Decimal),
  numberOfOrders: z.number(),
  price: z.instanceof(Decimal),
  volume: z.instanceof(Decimal),
});

const marketDepthSchema = z.object({
  buy: z.array(priceLevelSchema),
  sell: z.array(priceLevelSchema),
  marketId: z.string(),
  sequenceNumber: z.string(),
});

export async function retrieveMarketDepth(
  pathParams: PathParams,
  queryClient: QueryClient
) {
  const params = pathParamsSchema.parse(pathParams);
  const endpoint = restApiUrl('/api/v2/market/depth/{marketId}/latest', {
    marketId: params.marketId,
  });

  const [market, res] = await Promise.all([
    getMarket(queryClient, params.marketId),
    axios.get<vegaMarketDepth>(endpoint),
  ]);

  const data = res.data;

  const buy = data.buy?.map((a) => ({
    numberOfOrders: Number(a.numberOfOrders),
    // TODO: Uncomment once the types are updated
    // ammVolume: new Decimal(a.ammVolume, market.positionDecimalPlaces),
    // ammVolumeEstimated: new Decimal(
    //   a.ammVolumeEstimated,
    //   market.positionDecimalPlaces,
    // ),
    volume: new Decimal(a.volume, market.positionDecimalPlaces),
    price: new Decimal(a.price, market.decimalPlaces),
  }));

  const sell = data.sell?.map((a) => ({
    numberOfOrders: Number(a.numberOfOrders),
    // TODO: Uncomment once the types are updated
    // ammVolume: new Decimal(a.ammVolume, market.positionDecimalPlaces),
    // ammVolumeEstimated: new Decimal(
    //   a.ammVolumeEstimated,
    //   market.positionDecimalPlaces,
    // ),
    volume: new Decimal(a.volume, market.positionDecimalPlaces),
    price: new Decimal(a.price, market.decimalPlaces),
  }));

  return marketDepthSchema.parse({
    ...data,
    buy,
    sell,
  });
}

export const queryKeys = {
  all: ['market-depth'],
  single: (marketId: string) => [...queryKeys.all, 'single', { marketId }],
} as const;
