import { useState } from 'react';
import { useMarketOracle } from '../../hooks';
import {
  Intent,
  NotificationBanner,
  ButtonLink,
} from '@vegaprotocol/ui-toolkit';
import { OracleDialog } from '../oracle-dialog';
import { useOracleStatuses } from './oracle-statuses';
import { Trans } from 'react-i18next';

export const OracleBanner = ({ marketId }: { marketId: string }) => {
  const oracleStatuses = useOracleStatuses();
  const [open, onChange] = useState(false);
  const { data: settlementOracle } = useMarketOracle(marketId);
  const { data: tradingTerminationOracle } = useMarketOracle(
    marketId,
    'dataSourceSpecForTradingTermination'
  );
  let maliciousOracle = null;
  if (settlementOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = settlementOracle;
  } else if (tradingTerminationOracle?.provider.oracle.status !== 'GOOD') {
    maliciousOracle = tradingTerminationOracle;
  }
  if (!maliciousOracle) return null;

  const { provider } = maliciousOracle;
  return (
    <>
      <OracleDialog open={open} onChange={onChange} {...maliciousOracle} />
      <NotificationBanner intent={Intent.Danger}>
        <div>
          <Trans
            defaults="Oracle status for this market is <0>{{status}}</0>. {{description}} <1>Show more</1>"
            components={[
              <span data-testid="oracle-banner-status">status</span>,
              <ButtonLink
                onClick={() => onChange(!open)}
                data-testid="oracle-banner-dialog-trigger"
              >
                Show more
              </ButtonLink>,
            ]}
            values={{
              status: provider.oracle.status,
              description: oracleStatuses[provider.oracle.status],
            }}
          />
        </div>
      </NotificationBanner>
    </>
  );
};
