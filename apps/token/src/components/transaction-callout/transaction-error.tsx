import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import type { Error } from '../icons';

export interface TransactionErrorProps {
  error: Error | null;
  hash: string | null;
  onActionClick: () => void;
}

export const TransactionError = ({
  error,
  hash,
  onActionClick,
}: TransactionErrorProps) => {
  const { t } = useTranslation();

  return (
    <Callout iconName="error" intent={Intent.Danger}>
      <p>{error ? error.message : t('Something went wrong')}</p>
      {hash ? (
        <p>
          <EtherscanLink tx={hash} />
        </p>
      ) : null}
      <button onClick={() => onActionClick()}>{t('Try again')}</button>
    </Callout>
  );
};
