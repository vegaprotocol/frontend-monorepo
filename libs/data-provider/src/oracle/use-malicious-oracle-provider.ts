import { useMarket } from '../markets/use-markets';
import { getProduct } from '../markets/utils';
import { useOracles } from './use-oracle';
import { useOracleProviders } from './use-oracle-providers';
import { getMatchingOracleProvider } from './utils';

export const useMaliciousOracleProvider = ({
  marketId,
}: {
  marketId?: string;
}) => {
  const { data: providers } = useOracleProviders();
  const { data: market } = useMarket({ marketId });

  const product = getProduct(market);

  let oracleSpecIds: string[] = [];

  if (product?.__typename === 'Future') {
    oracleSpecIds = [
      product.dataSourceSpecForSettlementData.id,
      product.dataSourceSpecForTradingTermination.id,
    ];
  } else if (product?.__typename === 'Perpetual') {
    oracleSpecIds = [
      product.dataSourceSpecForSettlementData.id,
      product.dataSourceSpecForSettlementSchedule.id,
    ];
  }

  const queryResult = useOracles(oracleSpecIds);

  if (!providers) return;
  if (!queryResult.every((r) => r.data)) return;

  const providersForDataSources = queryResult.map((result) => {
    return getMatchingOracleProvider(providers, result.data?.data);
  });

  const index = providersForDataSources.findIndex((provider) => {
    if (!provider) return false;
    if (provider.oracle.status === 'GOOD') return false;
    return true;
  });

  const maliciousProvider = providersForDataSources[index];

  if (!maliciousProvider) return undefined;

  return {
    provider: maliciousProvider,
    dataSourceSpecId: oracleSpecIds[index],
  };
};
