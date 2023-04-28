import { t } from '@vegaprotocol/i18n';
import { useMarketOracle } from '@vegaprotocol/market-info';
import ReactMarkdown from 'react-markdown';
import { Intent, NotificationBanner } from '@vegaprotocol/ui-toolkit';

const oracleStatuses = {
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
  const oracle = useMarketOracle(marketId);
  if (!oracle || oracle.status === 'GOOD') {
    return null;
  }
  return (
    <NotificationBanner intent={Intent.Danger}>
      <div>
        Oracle status for this market is{' '}
        <span data-testId="oracle-status">{oracle.status}</span>.{' '}
        {oracleStatuses[oracle.status]}
      </div>
      {oracle.status_reason ? (
        <ReactMarkdown
          className="react-markdown-container"
          skipHtml={true}
          disallowedElements={['img']}
          linkTarget="_blank"
        >
          {oracle.status_reason}
        </ReactMarkdown>
      ) : null}
    </NotificationBanner>
  );
};
