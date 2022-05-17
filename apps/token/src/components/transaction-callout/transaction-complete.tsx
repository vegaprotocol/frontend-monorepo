import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
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
  const { t } = useTranslation();
  return (
    <Callout
      iconName="tick"
      intent={Intent.Success}
      title={heading || t('Complete')}
    >
      {body && <p data-testid="transaction-complete-body">{body}</p>}
      <p>
        <EtherscanLink tx={hash} />
      </p>
      {footer && <p data-testid="transaction-complete-footer">{footer}</p>}
    </Callout>
  );
};
