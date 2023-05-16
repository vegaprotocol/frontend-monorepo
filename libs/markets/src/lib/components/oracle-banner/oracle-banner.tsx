import { useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { useMarketOracle } from '../../hooks';
import {
  Intent,
  NotificationBanner,
  ButtonLink,
} from '@vegaprotocol/ui-toolkit';
import { OracleDialog } from '../market-info';

export const oracleStatuses = {
  UNKNOWN: t(
    "This public key's proofs have not been verified yet, or no proofs have been provided yet."
  ),
  GOOD: t("This public key's proofs have been verified."),
  SUSPICIOUS: t(
    'This public key is suspected to be acting in bad faith, pending investigation.'
  ),
  MALICIOUS: t('This public key has been observed acting in bad faith.'),
  RETIRED: t('This public key is no longer in use.'),
  COMPROMISED: t(
    'This public key is no longer in the control of its original owners.'
  ),
};

export const OracleBanner = ({ marketId }: { marketId: string }) => {
  const [open, onChange] = useState(false);
  const settlementOracle = useMarketOracle(marketId);
  const tradingTerminationOracle = useMarketOracle(
    marketId,
    'dataSourceSpecForTradingTermination'
  );
  let maliciousOracle = null;
  if (settlementOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = settlementOracle;
  } else if (tradingTerminationOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = tradingTerminationOracle;
  }
  if (!settlementOracle && !tradingTerminationOracle) {
    return (
      <NotificationBanner intent={Intent.Primary}>
        <div>{t('There is no oracle for this market yet.')} </div>
      </NotificationBanner>
    );
  }
  if (!maliciousOracle) return null;

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
