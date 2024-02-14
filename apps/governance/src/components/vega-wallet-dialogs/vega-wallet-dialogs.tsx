import { ConnectDialog, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
// TODO: handle risk message
// import { RiskMessage } from './risk-message';
import { VegaManageDialog } from '../manage-dialog';

export const VegaWalletDialogs = () => {
  const { appState, appDispatch } = useAppState();
  const vegaWalletDialogOpen = useVegaWalletDialogStore(
    (store) => store.vegaWalletDialogOpen
  );
  const updateVegaWalletDialog = useVegaWalletDialogStore(
    (store) => (open: boolean) => {
      store.updateVegaWalletDialog(open);
    }
  );
  return (
    <>
      <ConnectDialog
        open={vegaWalletDialogOpen}
        onChange={updateVegaWalletDialog}
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
