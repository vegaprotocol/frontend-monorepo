import { Button, Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';

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
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();

  return (
    <Callout iconName="error" intent={Intent.Danger}>
      <p className="mb-8">
        {error ? error.message : t('Something went wrong')}
      </p>
      {hash ? (
        <p className="mb-8">
          <Link
            title={t('View transaction on Etherscan')}
            href={`${ETHERSCAN_URL}/tx/${hash}`}
            target="_blank"
          >
            {hash}
          </Link>
        </p>
      ) : null}
      <Button onClick={() => onActionClick()}>{t('Try again')}</Button>
    </Callout>
  );
};
