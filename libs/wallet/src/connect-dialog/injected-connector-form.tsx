import { t } from '@vegaprotocol/i18n';
import { Status } from '../use-injected-connector';
import { ConnectDialogTitle } from './connect-dialog-elements';
import type { ReactNode } from 'react';
import { Button, Diamond, Loader, Tick } from '@vegaprotocol/ui-toolkit';
import { setAcknowledged } from '../storage';
import { useVegaWallet } from '../use-vega-wallet';

export const InjectedConnectorForm = ({
  status,
  onConnect,
  riskMessage,
}: {
  // connector: JsonRpcConnector;
  appChainId: string;
  status: Status;
  error: Error | null;
  onConnect: () => void;
  reset: () => void;
  riskMessage?: React.ReactNode;
}) => {
  const { disconnect } = useVegaWallet();

  if (status === Status.Idle) {
    return null;
  }

  if (status === Status.Error) {
    return <div>Injected connection failed</div>;
  }

  if (status === Status.GettingChainId) {
    return (
      <>
        <ConnectDialogTitle>{t('Verifying chain')}</ConnectDialogTitle>
        <Center>
          <Loader />
        </Center>
      </>
    );
  }

  if (status === Status.Connected) {
    return (
      <>
        <ConnectDialogTitle>{t('Successfully connected')}</ConnectDialogTitle>
        <Center>
          <Tick />
        </Center>
      </>
    );
  }

  if (status === Status.Connecting) {
    return (
      <>
        <ConnectDialogTitle>{t('Connecting...')}</ConnectDialogTitle>
        <Center>
          <Diamond />
        </Center>
        <p className="text-center">
          {t(
            "Approve the connection from your Vega wallet app. If you have multiple wallets you'll need to choose which to connect with."
          )}
        </p>
      </>
    );
  }

  if (status === Status.AcknowledgeNeeded) {
    const setConnection = () => {
      setAcknowledged();
      onConnect();
    };
    const handleDisagree = () => {
      disconnect();
      onConnect(); // this is dialog closing
    };
    return (
      <>
        <ConnectDialogTitle>{t('Understand the risk')}</ConnectDialogTitle>
        {riskMessage}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <Button onClick={handleDisagree} fill>
              {t('Cancel')}
            </Button>
          </div>
          <div>
            <Button onClick={setConnection} variant="primary" fill>
              {t('I agree')}
            </Button>
          </div>
        </div>
      </>
    );
  }
  return null;
};

const Center = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex justify-center items-center my-6">{children}</div>
  );
};
