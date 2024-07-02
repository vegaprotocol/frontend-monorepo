import type {
  DataSourceFragment,
  FutureFragment,
  MarketInfo,
  PerpetualFragment,
  SpotFragment,
} from './components';

type Product = MarketInfo['tradableInstrument']['instrument']['product'];

export const isSpot = (product: Product): product is SpotFragment =>
  product.__typename === 'Spot';

export const isFuture = (product: Product): product is FutureFragment =>
  product.__typename === 'Future';

export const isPerpetual = (product: Product): product is PerpetualFragment =>
  product.__typename === 'Perpetual';

export const getDataSourceSpecForSettlementData = (product: Product) => {
  if (isFuture(product)) {
    return product.dataSourceSpecForSettlementData;
  }
  if (isPerpetual(product)) {
    return product.dataSourceSpecForSettlementData;
  }

  return undefined;
};

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

export const getSigners = ({ data }: DataSourceFragment) => {
  if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
    const signers =
      ('signers' in data.sourceType.sourceType &&
        data.sourceType.sourceType.signers) ||
      [];

    return signers.map(({ signer }, i) => {
      return (
        (signer.__typename === 'ETHAddress' && signer.address) ||
        (signer.__typename === 'PubKey' && signer.key)
      );
    });
  }
  return [];
};
