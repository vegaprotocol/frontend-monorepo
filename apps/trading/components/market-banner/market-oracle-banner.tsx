import { useState } from 'react';
import { Trans } from 'react-i18next';
import {
  OracleDialog,
  useOracleStatuses,
  type useMaliciousOracle,
} from '@vegaprotocol/markets';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';

export type Oracle = ReturnType<typeof useMaliciousOracle>['data'];

export const MarketOracleBanner = ({
  oracle,
}: {
  oracle: NonNullable<Oracle>;
}) => {
  const [open, setOpen] = useState(false);
  const oracleStatuses = useOracleStatuses();

  return (
    <>
      <OracleDialog open={open} onChange={setOpen} {...oracle} />
      <p>
        <Trans
          defaults="Oracle status for this market is <0>{{status}}</0>. {{description}} <1>Show more</1>"
          components={[
            <span key="oracle-status" data-testid="oracle-banner-status">
              status
            </span>,
            <ButtonLink
              key="oracle-button"
              onClick={() => setOpen((x) => !x)}
              data-testid="oracle-banner-dialog-trigger"
            >
              Show more
            </ButtonLink>,
          ]}
          values={{
            status: oracle.provider.oracle.status,
            description: oracleStatuses[oracle.provider.oracle.status],
          }}
        />
      </p>
    </>
  );
};
