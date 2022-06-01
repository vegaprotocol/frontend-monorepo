import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';
import type { ReactElement } from 'react';

export const TransactionComplete = ({
  hash,
  heading,
  footer,
  body,
}: {
  hash: string;
  heading?: ReactElement | string;
  footer?: ReactElement | string;
  body?: ReactElement | string;
}) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  return (
    <Callout
      iconName="tick"
      intent={Intent.Success}
      title={heading || t('Complete')}
    >
      {body && (
        <p className="mb-8" data-testid="transaction-complete-body">
          {body}
        </p>
      )}
      <p className="mb-8">
        <Link
          title={t('View transaction on Etherscan')}
          target="_blank"
          href={`${ETHERSCAN_URL}/tx/${hash}`}
        >
          {hash}
        </Link>
      </p>
      {footer && <p data-testid="transaction-complete-footer">{footer}</p>}
    </Callout>
  );
};
