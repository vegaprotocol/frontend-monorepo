import { Callout, Intent, Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Trans, useTranslation } from 'react-i18next';

import type { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';

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
  const { ETHERSCAN_URL } = useEnvironment();
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
            href={`${ETHERSCAN_URL}/tx/${commitTxHash}`}
            target="_blank"
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
            href={`${ETHERSCAN_URL}/tx/${claimTxHash}`}
            target="_blank"
          >
            {claimTxHash}
          </Link>
        </p>
      )}
    </Callout>
  );
};
