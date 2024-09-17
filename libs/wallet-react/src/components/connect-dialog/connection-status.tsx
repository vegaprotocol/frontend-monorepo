import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type Status } from '@vegaprotocol/wallet';
import { useT } from '../../hooks/use-t';
import { BrowserWallet } from '@vegaprotocol/browser-wallet';
import { useEnvironment } from '@vegaprotocol/environment';
import { useWallet } from '../../hooks/use-wallet';

export const ConnectionStatus = ({ status }: { status: Status }) => {
  const t = useT();
  const state = useEnvironment();
  const vegaChainId = useWallet((store) => store.chainId);

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
          explorer={state.VEGA_EXPLORER_URL ?? ''}
          docs={state.VEGA_DOCS_URL ?? ''}
          governance={state.VEGA_TOKEN_URL ?? ''}
          console={state.VEGA_CONSOLE_URL ?? ''}
          chainId={vegaChainId}
          etherscanUrl={state.ETHERSCAN_URL ?? ''}
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
