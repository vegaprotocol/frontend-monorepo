import { Callout, Intent, Link, Button } from '@vegaprotocol/ui-toolkit';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouteLink } from 'react-router-dom';

import type { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';
import { Routes } from '../router-config';

export const Complete = ({
  address,
  balanceFormatted,
  commitTxHash,
  claimTxHash,
}: {
  address: string;
  balanceFormatted: BigNumber;
  commitTxHash: string | null;
  claimTxHash: string | null;
}) => {
  const { t } = useTranslation();

  return (
    <Callout intent={Intent.Success} title="Claim complete" iconName="tick">
      <p>
        <Trans
          i18nKey="claimCompleteMessage"
          values={{
            address,
            balance: formatNumber(balanceFormatted),
          }}
        />
      </p>
      {commitTxHash && (
        <p style={{ margin: 0 }}>
          {t('Link transaction')}:{' '}
          <Link
            title={t('View transaction on Etherscan')}
            href={`${process.env['NX_ETHERSCAN_URL']}/tx/${commitTxHash}`}
          >
            {commitTxHash}
          </Link>
        </p>
      )}
      {claimTxHash && (
        <p>
          {t('Claim transaction')}:{' '}
          <Link
            title={t('View transaction on Etherscan')}
            href={`${process.env['NX_ETHERSCAN_URL']}/tx/${claimTxHash}`}
          >
            {claimTxHash}
          </Link>
        </p>
      )}
      <RouteLink to={Routes.VESTING}>
        <Button className="fill">{t('Check your vesting VEGA tokens')}</Button>
      </RouteLink>
    </Callout>
  );
};
