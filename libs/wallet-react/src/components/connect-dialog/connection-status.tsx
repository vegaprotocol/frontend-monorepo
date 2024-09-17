import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type Status } from '@vegaprotocol/wallet';
import { useT } from '../../hooks/use-t';
import { BrowserWallet } from '@vegaprotocol/browser-wallet';
import { useConfig } from '../../hooks/use-config';

export const ConnectionStatus = ({ status }: { status: Status }) => {
  const t = useT();
  const {
    walletConfig: {
      explorer,
      docs,
      governance,
      console,
      chainId,
      etherscanUrl,
    },
  } = useConfig();

  if (status === 'connecting') {
    return (
      <>
        <h3 className="text-lg">{t('Connecting...')}</h3>
        <p className="text-surface-0-fg-muted">
          {t('Approve the connection from your wallet app.')}
        </p>
      </>
    );
  }

  if (status === 'importing' && typeof window !== 'undefined') {
    return (
      <>
        <h3 className="text-lg">{t('Importing')}</h3>
        <BrowserWallet
          explorer={explorer}
          docs={docs}
          governance={governance}
          console={console}
          chainId={chainId}
          etherscanUrl={etherscanUrl}
        />
      </>
    );
  }

  if (status === 'creating') {
    return (
      <>
        <h3 className="text-lg">{t('Creating...')}</h3>
        <p className="text-surface-0-fg-muted">
          {t('Creating your wallet...')}
        </p>
      </>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-3">
        <VegaIcon name={VegaIconNames.TICK} className="text-green" />
        <h3 className="text-lg">{t('Successfully connected')}</h3>
      </div>
    );
  }

  return null;
};
