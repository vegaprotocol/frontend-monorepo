import React from 'react';
import { Callout, Loader } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';

export const TransactionPending = ({
  hash,
  heading,
  footer,
  body,
  confirmations,
  requiredConfirmations,
}: {
  hash: string;
  confirmations: number | null;
  requiredConfirmations: number | null;
  heading?: React.ReactElement | string;
  footer?: React.ReactElement | string;
  body?: React.ReactElement | string;
}) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const remainingConfirmations = React.useMemo(() => {
    if (requiredConfirmations) {
      return Math.max(0, requiredConfirmations - (confirmations || 0));
    }
    return 0;
  }, [confirmations, requiredConfirmations]);
  const title = React.useMemo(() => {
    const defaultTitle = heading || t('Transaction in progress');
    if (remainingConfirmations > 0) {
      return `${defaultTitle}. ${t('blockCountdown', {
        amount: remainingConfirmations,
      })}`;
    }
    return defaultTitle;
  }, [heading, remainingConfirmations, t]);
  return (
    <Callout icon={<Loader size="small" />} title={title}>
      {body && (
        <p className="mb-8" data-testid="transaction-pending-body">
          {body}
        </p>
      )}
      <p className="mb-8">
        <Link
          title={t('View transaction on Etherscan')}
          href={`${ETHERSCAN_URL}/tx/${hash}`}
        >
          {hash}
        </Link>
      </p>
      {footer && <p data-testid="transaction-pending-footer">{footer}</p>}
    </Callout>
  );
};
