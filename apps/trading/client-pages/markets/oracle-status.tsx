import { useEnvironment } from '@vegaprotocol/environment';
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import type { Market } from '@vegaprotocol/markets';
import {
  getMatchingOracleProvider,
  getVerifiedStatusIcon,
  useOracleProofs,
} from '@vegaprotocol/markets';

export const OracleStatus = ({
  dataSourceSpecForSettlementData,
  dataSourceSpecForTradingTermination,
}: Pick<
  Market['tradableInstrument']['instrument']['product'],
  'dataSourceSpecForSettlementData' | 'dataSourceSpecForTradingTermination'
>) => {
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const { data: providers } = useOracleProofs(ORACLE_PROOFS_URL);

  if (providers) {
    const settlementDataProvider = getMatchingOracleProvider(
      dataSourceSpecForSettlementData.data,
      providers
    );
    const tradingTerminationDataProvider = getMatchingOracleProvider(
      dataSourceSpecForTradingTermination.data,
      providers
    );
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
};
