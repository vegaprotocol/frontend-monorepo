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
  const oracle = useMarketOracle(marketId);
  if (!oracle || oracle.provider.oracle.status === 'GOOD') {
    return null;
  }
  const { provider } = oracle;
  return (
    <>
      <OracleDialog open={open} onChange={onChange} {...oracle} />
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
