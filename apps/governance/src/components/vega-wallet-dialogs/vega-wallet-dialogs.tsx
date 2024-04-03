import {
  ConnectDialogWithRiskAck,
  useDialogStore,
} from '@vegaprotocol/wallet-react';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { RiskMessage } from './risk-message';
import { VegaManageDialog } from '../manage-dialog';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { Networks, useEnvironment } from '@vegaprotocol/environment';

export const VegaWalletDialogs = () => {
  const { VEGA_ENV } = useEnvironment();
  const { appState, appDispatch } = useAppState();
  const [riskAccepted, setRiskAccepted] = useLocalStorage(
    'vega_wallet_risk_accepted'
  );
  const vegaWalletDialogOpen = useDialogStore((store) => store.isOpen);
  const setVegaWalletDialog = useDialogStore((store) => store.set);
  return (
    <>
      <ConnectDialogWithRiskAck
        open={vegaWalletDialogOpen}
        onChange={setVegaWalletDialog}
        riskAccepted={
          VEGA_ENV === Networks.TESTNET ? riskAccepted === 'true' : true
        }
        riskAckContent={<RiskMessage />}
        onRiskAccepted={() => setRiskAccepted('true')}
        onRiskRejected={() => {
          setRiskAccepted('false');
          setVegaWalletDialog(false);
        }}
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
