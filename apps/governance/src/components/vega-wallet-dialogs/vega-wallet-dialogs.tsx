import {
  ConnectDialogWithRiskAck,
  useDialogStore,
  useWallet,
} from '@vegaprotocol/wallet-react';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { RiskMessage } from './risk-message';
import { VegaManageDialog } from '../manage-dialog';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { BrowserWallet } from '@vegaprotocol/browser-wallet';

const EmbeddedWalletDialog = () => {
  const { appState, appDispatch } = useAppState();
  const state = useEnvironment();
  const vegaChainId = useWallet((store) => store.chainId);
  return (
    <Dialog
      open={appState.embeddedWalletOpen}
      onChange={(open) =>
        appDispatch({
          type: AppStateActionType.SET_EMBEDDED_WALLET_MANAGE_OVERLAY,
          isOpen: open,
        })
      }
      size="small"
    >
      <div className="h-full" style={{ height: 650 }}>
        <BrowserWallet
          explorer={state.VEGA_EXPLORER_URL ?? ''}
          docs={state.VEGA_DOCS_URL ?? ''}
          governance={state.VEGA_TOKEN_URL ?? ''}
          console={state.VEGA_CONSOLE_URL ?? ''}
          chainId={vegaChainId}
          etherscanUrl={state.ETHERSCAN_URL ?? ''}
        />
      </div>
    </Dialog>
  );
};

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
      <EmbeddedWalletDialog />
    </>
  );
};
