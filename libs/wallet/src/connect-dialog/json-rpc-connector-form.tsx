import capitalize from 'lodash/capitalize';
import {
  Button,
  ButtonLink,
  Diamond,
  Link,
  Loader,
  Tick,
} from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import type { JsonRpcConnector } from '../connectors';
import { ClientErrors } from '../connectors';
import { ConnectDialogTitle } from './connect-dialog-elements';
import { Status } from '../use-json-rpc-connect';
import { useVegaWallet } from '../use-vega-wallet';
import { setAcknowledged } from '../storage';
import { useT } from '../use-t';

export const ServiceErrors = {
  NO_HEALTHY_NODE: 1000,
  REQUEST_PROCESSING: -32000,
};

export const JsonRpcConnectorForm = ({
  connector,
  appChainId,
  status,
  error,
  reset,
  onConnect,
  riskMessage,
}: {
  connector: JsonRpcConnector;
  appChainId: string;
  status: Status;
  error: WalletClientError | null;
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
    return (
      <Error
        error={error}
        connectorUrl={connector.url}
        appChainId={appChainId}
        onTryAgain={reset}
      />
    );
  }

  if (status === Status.CheckingVersion) {
    return (
      <>
        <ConnectDialogTitle>{t('Checking wallet version')}</ConnectDialogTitle>
        <Center>
          <Loader />
        </Center>
        <p className="text-center">
          {t('Checking your wallet is compatible with this app')}
        </p>
      </>
    );
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

  if (status === Status.Connecting || status === Status.GettingPerms) {
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
  connectorUrl,
  appChainId,
  onTryAgain,
}: {
  error: WalletClientError | null;
  connectorUrl: string | null;
  appChainId: string;
  onTryAgain: () => void;
}) => {
  const t = useT();
  const { links } = useVegaWallet();
  let title = t('Something went wrong');
  let text: ReactNode | undefined = t('An unknown error occurred');
  let tryAgain: ReactNode | null = (
    <p className="text-center">
      <ButtonLink onClick={onTryAgain}>{t('Try again')}</ButtonLink>
    </p>
  );

  if (error) {
    if (error.code === ClientErrors.NO_SERVICE.code) {
      title = t('No wallet detected');
      text = connectorUrl
        ? t('No wallet application running at {{connectorUrl}}', {
            connectorUrl,
          })
        : t('No Vega Wallet application running');
    } else if (error.code === ClientErrors.WRONG_NETWORK.code) {
      title = t('Wrong network');
      text = t(
        'To complete your wallet connection, set your wallet network in your app to "{{appChainId}}".',
        appChainId
      );
    } else if (error.code === ServiceErrors.NO_HEALTHY_NODE) {
      title = error.title;
      text = (
        <>
          {capitalize(error.message)}
          {'. '}
          <Link href={links.concepts}>
            {t('Read the docs to troubleshoot')}
          </Link>
        </>
      );
    } else if (error.code === ServiceErrors.REQUEST_PROCESSING) {
      title = t('Connection in progress');
      text = t('Approve the connection from your Vega wallet app.');
      tryAgain = null;
    } else if (error.code === 0) {
      title = t('Wrong network');
      text = (
        <>
          {t(
            `To complete your wallet connection, set your wallet network in your app to "{{appChainId}}".`,
            appChainId
          )}
        </>
      );
    } else if (error.code === ClientErrors.INVALID_WALLET.code) {
      title = error.title;
      const errorData = error.message?.split('\n ') || [];
      text = (
        <span className="flex flex-col">
          {errorData.map((str, i) => (
            <span key={i}>{str}</span>
          ))}
        </span>
      );
    } else {
      title = error.title;
      text = error.message;
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
