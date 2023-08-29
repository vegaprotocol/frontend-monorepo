import { useMemo } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import { getMatchingOracleProvider, useOracleProofs } from '../../hooks';
import type { MarketMaybeWithData } from '../../markets-provider';
import { getVerifiedStatusIcon } from '../oracle-basic-profile';

export const OracleStatus = ({ market }: { market: MarketMaybeWithData }) => {
  const product = market.tradableInstrument.instrument.product || undefined;
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const { data: providers } = useOracleProofs(ORACLE_PROOFS_URL);
  return useMemo(() => {
    if (providers) {
      const settlementDataProvider =
        product.__typename === 'Future'
          ? getMatchingOracleProvider(
              product.dataSourceSpecForSettlementData.data,
              providers
            )
          : undefined;
      const tradingTerminationDataProvider =
        product.__typename === 'Future'
          ? getMatchingOracleProvider(
              product.dataSourceSpecForTradingTermination.data,
              providers
            )
          : undefined;
      let maliciousOracleProvider = null;
      if (settlementDataProvider?.oracle.status !== 'GOOD') {
        maliciousOracleProvider = settlementDataProvider;
      } else if (tradingTerminationDataProvider?.oracle.status !== 'GOOD') {
        maliciousOracleProvider = tradingTerminationDataProvider;
      }
      if (!maliciousOracleProvider) return null;
      const { icon } = getVerifiedStatusIcon(maliciousOracleProvider);
      return <Icon size={3} name={icon as IconName} className="ml-1" />;
    }
    return null;
  }, [providers, product]);
};
