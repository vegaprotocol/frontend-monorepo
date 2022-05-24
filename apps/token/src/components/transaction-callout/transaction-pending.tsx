import React from 'react';
import { Callout } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Link, useEnvironment } from '@vegaprotocol/ui-toolkit';

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
    <Callout iconName="refresh" title={title}>
      {body && <p data-testid="transaction-pending-body">{body}</p>}
      <p>
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
