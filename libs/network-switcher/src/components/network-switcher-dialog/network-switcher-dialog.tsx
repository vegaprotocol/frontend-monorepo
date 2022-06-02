import type { ComponentProps } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { NetworkSwitcher } from '../network-switcher';

type NetworkSwitcherDialogProps = Pick<ComponentProps<typeof NetworkSwitcher>, 'onConnect' | 'onError'> & {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
  intent?: Intent;
};

export const NetworkSwitcherDialog = ({
  dialogOpen,
  setDialogOpen,
  intent,
  onConnect,
  onError,
}: NetworkSwitcherDialogProps) => {
  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      title={t('Choose a network')}
      intent={intent}
    >
      <NetworkSwitcher
        onConnect={onConnect}
        onError={onError}
        onClose={() => setDialogOpen(false)}
      />
    </Dialog>
  );
};
