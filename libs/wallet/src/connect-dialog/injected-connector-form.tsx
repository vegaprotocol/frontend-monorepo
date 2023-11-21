import { Status } from '../use-injected-connector';
import { ConnectDialogTitle } from './connect-dialog-elements';
import type { ReactNode } from 'react';
import {
  Button,
  ButtonLink,
  Diamond,
  Loader,
  Tick,
} from '@vegaprotocol/ui-toolkit';
import { setAcknowledged } from '../storage';
import { useVegaWallet } from '../use-vega-wallet';
import { InjectedConnectorErrors, SnapConnectorErrors } from '../connectors';
import { useT } from '../use-t';

export const InjectedConnectorForm = ({
  status,
  onConnect,
  riskMessage,
  appChainId,
  reset,
  error,
}: {
  appChainId: string;
  status: Status;
  error: Error | null;
  onConnect: () => void;
  reset: () => void;
  riskMessage?: React.ReactNode;
}) => {
  const t = useT();
  const { disconnect } = useVegaWallet();

  if (status === Status.Idle) {
    return null;
  }

  if (status === Status.Error) {
    return <Error error={error} appChainId={appChainId} onTryAgain={reset} />;
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
    <div className="my-6 flex items-center justify-center">{children}</div>
  );
};

const Error = ({
  error,
  appChainId,
  onTryAgain,
}: {
  error: Error | null;
  appChainId: string;
  onTryAgain: () => void;
}) => {
  const t = useT();
  let title = t('Something went wrong');
  let text: ReactNode | undefined = t('An unknown error occurred');
  const tryAgain: ReactNode | null = (
    <p className="text-center">
      <ButtonLink onClick={onTryAgain}>{t('Try again')}</ButtonLink>
    </p>
  );

  if (error) {
    if (error.message === InjectedConnectorErrors.USER_REJECTED.message) {
      title = t('User rejected');
      text = t('The user rejected the wallet connection');
    } else if (
      error.message === InjectedConnectorErrors.INVALID_CHAIN.message
    ) {
      title = t('Wrong network');
      text = t(
        'To complete your wallet connection, set your wallet network in your app to "{{appChainId}}".',
        { appChainId }
      );
    } else if (
      error.message === InjectedConnectorErrors.VEGA_UNDEFINED.message
    ) {
      title = t('No wallet detected');
      text = t('Vega browser extension not installed');
    } else if (
      error.message === SnapConnectorErrors.ETHEREUM_UNDEFINED.message ||
      error.message === SnapConnectorErrors.NODE_ADDRESS_NOT_SET.message
    ) {
      title = t('Snap failed');
      text = t('Could not connect to Vega MetaMask Snap');
    }
  }

  return (
    <>
      <ConnectDialogTitle>{title}</ConnectDialogTitle>
      <p className="mb-2 text-center first-letter:uppercase">{text}</p>
      {tryAgain}
    </>
  );
};
