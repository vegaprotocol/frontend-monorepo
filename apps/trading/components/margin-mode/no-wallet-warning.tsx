import { InputError } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const NoWalletWarning = ({
  isReadOnly,
  noWalletConnected,
}: {
  isReadOnly: boolean;
  noWalletConnected?: boolean;
}) => {
  const t = useT();

  if (noWalletConnected) {
    return (
      <div className="mb-2">
        <InputError testId="deal-ticket-error-message-summary">
          {t('Connect your wallet')}
        </InputError>
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div className="mb-2">
        <InputError testId="deal-ticket-error-message-summary">
          {t(
            'You need to connect your own wallet to start trading on this market'
          )}
        </InputError>
      </div>
    );
  }

  return null;
};
