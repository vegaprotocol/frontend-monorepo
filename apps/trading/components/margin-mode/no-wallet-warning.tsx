import { ExternalLink, InputError } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Trans } from 'react-i18next';

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
          <Trans
            defaults="You need a <0>Vega wallet</0> to start trading in this market."
            components={[
              <ExternalLink href="https://vega.xyz/wallet" key="link">
                Vega wallet
              </ExternalLink>,
            ]}
          />
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
