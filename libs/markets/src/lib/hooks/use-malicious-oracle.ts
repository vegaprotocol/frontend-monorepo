import { useMarketOracle } from './use-market-oracle';

/**
 * Returns an oracle if eithe the settlement or termination oracle is marked
 * as malicious
 */
export const useMaliciousOracle = (marketId: string) => {
  const { data: settlementOracle, loading: settlementLoading } =
    useMarketOracle(marketId);

  const { data: tradingTerminationOracle, loading: terminationLoading } =
    useMarketOracle(marketId, 'dataSourceSpecForTradingTermination');

  let maliciousOracle = undefined;

  if (settlementOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = settlementOracle;
  } else if (tradingTerminationOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = tradingTerminationOracle;
  }

  return {
    data: maliciousOracle,
    loading: settlementLoading || terminationLoading || false,
  };
};
