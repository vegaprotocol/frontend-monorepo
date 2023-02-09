import type { ComponentProps } from 'react';
import { Dialog, Loader } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { NodeSwitcher2 } from '../node-switcher';
import { useEnvironment } from '../../hooks/use-environment';
import type { Configuration } from '../../types';

type NodeSwitcherDialogProps = Pick<
  ComponentProps<typeof NodeSwitcher2>,
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
    <Dialog open={dialogOpen} onChange={setDialogOpen} size="medium">
      <div className="uppercase text-xl text-center mb-2">
        {t('Connected node')}
      </div>
      {!config && loading && (
        <div className="py-8">
          <p className="mb-4 text-center">{t('Loading configuration...')}</p>
          <Loader size="large" />
        </div>
      )}
      {config && dialogOpen && (
        <>
          <p className="mb-2 text-center">
            {t(`This app will only work on a `)}
            <span className="font-mono capitalize">
              {VEGA_ENV.toLowerCase()}
            </span>
            {t(' chain ID')}
          </p>
          <NodeSwitcher2
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
