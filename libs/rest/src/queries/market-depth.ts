import { NODE_URL } from '../env';
import { vegaMarketDepth } from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import { z } from 'zod';
import { Decimal } from '../utils';
import { getMarketFromCache } from './markets';

const parametersSchema = z.object({
  marketId: z.string(),
});

export type QueryParams = z.infer<typeof parametersSchema>;

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
  apiUrl: string | undefined,
  params: QueryParams
) {
  const searchParams = parametersSchema.parse(params);

  const market = getMarketFromCache(searchParams.marketId);
  if (!market) {
    throw new Error('market not found');
  }

  const API = apiUrl || NODE_URL;

  const res = await axios.get<vegaMarketDepth>(
    `${API}/market/depth/${searchParams.marketId}/latest`
  );

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
