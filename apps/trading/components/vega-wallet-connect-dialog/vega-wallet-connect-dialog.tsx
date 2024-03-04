import {
  ConnectDialogWithRiskAck,
  useDialogStore,
} from '@vegaprotocol/wallet-react';
import { useOnboardingStore } from '../../stores/onboarding';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { RiskAckContent } from '../risk-ack-content';

export const VegaWalletConnectDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const open = useDialogStore((store) => store.isOpen);
  const setDialog = useDialogStore((store) => store.set);
  const risk = useOnboardingStore((store) => store.risk);
  const acceptRisk = useOnboardingStore((store) => store.acceptRisk);
  const rejectRisk = useOnboardingStore((store) => store.rejectRisk);

  return (
    <ConnectDialogWithRiskAck
      open={open}
      riskAccepted={VEGA_ENV === Networks.MAINNET ? risk === 'accepted' : true}
      onChange={setDialog}
      onRiskAccepted={acceptRisk}
      onRiskRejected={() => {
        rejectRisk();
        setDialog(false);
      }}
      riskAckContent={<RiskAckContent />}
    />
  );
};
