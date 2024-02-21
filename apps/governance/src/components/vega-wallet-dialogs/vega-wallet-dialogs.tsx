import { ConnectDialog, useDialogStore } from '@vegaprotocol/wallet-react';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
// TODO: handle risk message
// import { RiskMessage } from './risk-message';
import { VegaManageDialog } from '../manage-dialog';

export const VegaWalletDialogs = () => {
  const { appState, appDispatch } = useAppState();
  const vegaWalletDialogOpen = useDialogStore((store) => store.isOpen);
  const setVegaWalletDialog = useDialogStore((store) => store.set);
  return (
    <>
      <ConnectDialog
        open={vegaWalletDialogOpen}
        onChange={setVegaWalletDialog}
      />
      <VegaManageDialog
        dialogOpen={appState.vegaWalletManageOverlay}
        setDialogOpen={(open) =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_MANAGE_OVERLAY,
            isOpen: open,
          })
        }
      />

      {/* <ViewAsDialog connector={connectors.view} /> */}
    </>
  );
};
