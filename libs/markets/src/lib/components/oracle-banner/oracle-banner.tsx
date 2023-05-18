import { useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { useMarketOracle } from '../../hooks';
import {
  Intent,
  NotificationBanner,
  ButtonLink,
} from '@vegaprotocol/ui-toolkit';
import { OracleDialog } from '../oracle-dialog';
import { oracleStatuses } from './oracle-statuses';

export const OracleBanner = ({ marketId }: { marketId: string }) => {
  const [open, onChange] = useState(false);
  const { data: settlementOracle, loading: settlementOracleLoading } =
    useMarketOracle(marketId);
  const {
    data: tradingTerminationOracle,
    loading: tradingTerminationOracleLoading,
  } = useMarketOracle(marketId, 'dataSourceSpecForTradingTermination');
  if (settlementOracleLoading || tradingTerminationOracleLoading) {
    return null;
  }
  let maliciousOracle = null;
  if (settlementOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = settlementOracle;
  } else if (tradingTerminationOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = tradingTerminationOracle;
  }

  if (!maliciousOracle) return null;
  if (!settlementOracle && !tradingTerminationOracle) {
    return (
      <NotificationBanner intent={Intent.Primary}>
        <div>{t('There is no oracle for this market.')} </div>
      </NotificationBanner>
    );
  }

  const { provider } = maliciousOracle;
  return (
    <>
      <OracleDialog open={open} onChange={onChange} {...maliciousOracle} />
      <NotificationBanner intent={Intent.Danger}>
        <div>
          Oracle status for this market is{' '}
          <span data-testid="oracle-banner-status">
            {provider.oracle.status}
          </span>
          . {oracleStatuses[provider.oracle.status]}{' '}
          <ButtonLink
            onClick={() => onChange(!open)}
            data-testid="oracle-banner-dialog-trigger"
          >
            {t('Show more')}
          </ButtonLink>
        </div>
      </NotificationBanner>
    </>
  );
};
