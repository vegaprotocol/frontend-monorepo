import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type Status } from '@vegaprotocol/wallet';
import { useT } from '../../hooks/use-t';

export const ConnectionStatus = ({ status }: { status: Status }) => {
  const t = useT();

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
