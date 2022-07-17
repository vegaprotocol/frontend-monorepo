import type { ComponentProps } from 'react';
import { Dialog, Loader } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { NodeSwitcher } from '../node-switcher';
import { useEnvironment } from '../../hooks/use-environment';
import type { Configuration } from '../../types';

type NodeSwitcherDialogProps = Pick<
  ComponentProps<typeof NodeSwitcher>,
  'initialErrorType' | 'onConnect'
> & {
  loading: boolean;
  config?: Configuration;
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
};

export const NodeSwitcherDialog = ({
  config,
  loading,
  initialErrorType,
  dialogOpen,
  setDialogOpen,
  onConnect,
}: NodeSwitcherDialogProps) => {
  const { VEGA_ENV } = useEnvironment();
  return (
    <Dialog open={dialogOpen} onChange={setDialogOpen}>
      <div className="uppercase text-h3 text-center mb-8">
        {t('Connected node')}
      </div>
      {!config && loading && (
        <div className="py-16">
          <p className="mb-32 text-center">{t('Loading configuration...')}</p>
          <Loader size="large" />
        </div>
      )}
      {config && dialogOpen && (
        <>
          <p className="mb-32 text-center">
            {t(`This app will only work on a `)}
            <span className="font-mono capitalize">
              {VEGA_ENV.toLowerCase()}
            </span>
            {t(' chain ID')}
          </p>
          <NodeSwitcher
            config={config}
            initialErrorType={initialErrorType}
            onConnect={(url) => {
              onConnect(url);
              setDialogOpen(false);
            }}
          />
        </>
      )}
    </Dialog>
  );
};
