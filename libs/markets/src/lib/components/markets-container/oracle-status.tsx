import { useMemo } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { getMatchingOracleProvider, useOracleProofs } from '../../hooks';
import type { Market } from '../../markets-provider';

export const OracleStatus = ({
  dataSourceSpecForSettlementData,
  dataSourceSpecForTradingTermination,
}: Pick<
  Market['tradableInstrument']['instrument']['product'],
  'dataSourceSpecForSettlementData' | 'dataSourceSpecForTradingTermination'
>) => {
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const { data: providers } = useOracleProofs(ORACLE_PROOFS_URL);
  return useMemo(() => {
    if (providers) {
      const settlementDataProvider = getMatchingOracleProvider(
        dataSourceSpecForSettlementData.data,
        providers
      );
      const tradingTerminationDataProvider = getMatchingOracleProvider(
        dataSourceSpecForTradingTermination.data,
        providers
      );
      if (
        (settlementDataProvider &&
          settlementDataProvider.oracle.status !== 'GOOD') ||
        (tradingTerminationDataProvider &&
          tradingTerminationDataProvider.oracle.status !== 'GOOD')
      ) {
        return (
          <span
            className="ml-1"
            role="img"
            aria-label={t('oracle status not healthy')}
          >
            ⛔
          </span>
        );
      }
    }
    return null;
  }, [
    providers,
    dataSourceSpecForSettlementData,
    dataSourceSpecForTradingTermination,
  ]);
};
