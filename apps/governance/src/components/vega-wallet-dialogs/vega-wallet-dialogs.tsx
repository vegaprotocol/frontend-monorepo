import {
  VegaConnectDialog,
  VegaManageDialog,
  ViewAsDialog,
} from '@vegaprotocol/wallet';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { useConnectors } from '../../lib/vega-connectors';
import { RiskMessage } from './risk-message';

export const VegaWalletDialogs = () => {
  const { appState, appDispatch } = useAppState();
  const connectors = useConnectors();
  return (
    <>
      <VegaConnectDialog
        connectors={connectors}
        riskMessage={<RiskMessage />}
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

      <ViewAsDialog connector={connectors.view} />
    </>
  );
};
