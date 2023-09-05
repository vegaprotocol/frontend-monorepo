import { VegaConnectDialog, VegaManageDialog } from '@vegaprotocol/wallet';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { Connectors } from '../../lib/vega-connectors';
import { RiskMessage } from './risk-message';

export const VegaWalletDialogs = () => {
  const { appState, appDispatch } = useAppState();

  return (
    <>
      <VegaConnectDialog
        connectors={Connectors}
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
    </>
  );
};
