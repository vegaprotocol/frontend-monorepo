import { ConnectorError, QuickStartConnector } from '@vegaprotocol/wallet';
import { useT } from '../../../../hooks/use-t';
import { ConnectionOptionButton } from '../connection-option-button';
import { ConnectorIcon } from '../connector-icon';
import { type ConnectionOptionProps } from '../types';
import { useQuickstart } from 'libs/wallet-react/src/hooks/use-quickstart';

const USER_REJECTED_CODE = 4001;

export const QuickstartButton = ({
  onClick,
  isPending,
  error,
}: {
  onClick: () => void;
  isPending: boolean;
  error: ConnectorError | null;
}) => {
  const t = useT();

  return (
    <>
      <ConnectionOptionButton
        icon={<ConnectorIcon id="embedded-wallet-quickstart" />}
        id="embedded-wallet-quickstart"
        onClick={onClick}
        disabled={isPending}
      >
        {t('Connect with Ethereum')}
      </ConnectionOptionButton>
      {error &&
        error instanceof ConnectorError &&
        error.code !== USER_REJECTED_CODE && (
          <p
            className="text-intent-danger text-sm first-letter:uppercase"
            data-testid="connection-error"
          >
            {error.message}
            {error.data ? `: ${error.data}` : ''}
          </p>
        )}
    </>
  );
};

export const ConnectionOptionQuickstart = ({
  connector,
  onClick,
}: ConnectionOptionProps) => {
  if (!(connector instanceof QuickStartConnector)) {
    throw new Error('Tried to render QuickStartConnector with wrong connector');
  }
  const { createWallet, isPending, error } = useQuickstart({
    connector,
    onSuccess: () => onClick(),
  });

  return (
    <QuickstartButton
      onClick={createWallet}
      isPending={isPending}
      error={error as ConnectorError}
    />
  );
};
