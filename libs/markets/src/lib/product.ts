import type {
  FutureFragment,
  MarketInfo,
  PerpetualFragment,
} from './components';

type Product = MarketInfo['tradableInstrument']['instrument']['product'];

export const isFuture = (product: Product): product is FutureFragment =>
  product.__typename === 'Future';

export const isPerpetual = (product: Product): product is PerpetualFragment =>
  product.__typename === 'Perpetual';

export const getDataSourceSpecForSettlementData = (product: Product) =>
  isFuture(product) || isPerpetual(product)
    ? product.dataSourceSpecForSettlementData
    : undefined;

export const getDataSourceSpecForSettlementSchedule = (product: Product) =>
  isPerpetual(product)
    ? product.dataSourceSpecForSettlementSchedule
    : undefined;

export const getDataSourceSpecForTradingTermination = (product: Product) =>
  isFuture(product) ? product.dataSourceSpecForTradingTermination : undefined;

export const getDataSourceSpecBinding = (product: Product) =>
  isFuture(product) || isPerpetual(product)
    ? product.dataSourceSpecBinding
    : undefined;
