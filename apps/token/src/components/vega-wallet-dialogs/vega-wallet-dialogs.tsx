import { VegaConnectDialog, VegaManageDialog } from '@vegaprotocol/wallet';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { Connectors } from '../../lib/vega-connectors';

export const VegaWalletDialogs = () => {
  const { appState, appDispatch } = useAppState();
  return (
    <>
      <VegaConnectDialog
        connectors={Connectors}
        dialogOpen={appState.vegaWalletOverlay}
        setDialogOpen={(open) =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
            isOpen: open,
          })
        }
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
    </>
  );
};
