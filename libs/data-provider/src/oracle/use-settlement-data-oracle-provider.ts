import { useMarket } from '../markets/use-markets';
import { getProduct } from '../markets/utils';
import { useOracle } from './use-oracle';
import { useOracleProviders } from './use-oracle-providers';
import { getMatchingOracleProvider } from './utils';

/** Returns the settlement data oracle provider */
export const useSettlementDataOracleProvider = (marketId: string) => {
  const { data: market } = useMarket({ marketId });
  const { data: providers } = useOracleProviders();

  const product = getProduct(market);
  let oracleSpecId;

  if (product?.__typename === 'Future' || product?.__typename === 'Perpetual') {
    oracleSpecId = product.dataSourceSpecForSettlementData.id;
  }

  const queryResult = useOracle({ oracleSpecId });

  let data;

  if (oracleSpecId && providers && queryResult.data) {
    data = {
      provider: getMatchingOracleProvider(providers, queryResult.data.data),
      dataSourceSpecId: oracleSpecId,
    };
  }

  return {
    ...queryResult,
    data,
  };
};
