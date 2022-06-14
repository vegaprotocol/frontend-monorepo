import { useState, useEffect, useMemo } from 'react';
import type { ReactNode, FC } from 'react';
import type { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import {
  Callout,
  Intent,
  Button,
  Icon,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '../../hooks';
import type { ConfigStatus } from '../../types';

type MessageComponentProps = {
  children: ReactNode;
};

const StatusMessage = ({ children }: MessageComponentProps) => (
  <div className="flex items-center fixed bottom-0 right-0 px-16 bg-intent-highlight text-black">
    {children}
  </div>
);

type ErrorComponentProps = MessageComponentProps & {
  showTryAgain?: boolean;
};

const Error: FC<ErrorComponentProps> = ({
  children,
  showTryAgain,
}: ErrorComponentProps) => (
  <div>
    <div className="mb-16">{children}</div>
    {showTryAgain && (
      <Button
        className="mt-8"
        variant="secondary"
        onClick={() => window.location.reload()}
      >
        {t('Try again')}
      </Button>
    )}
  </div>
);

type StatusComponentProps = {
  status: ConfigStatus;
  children?: ReactNode;
};

const StatusComponent = ({ status, children }: StatusComponentProps) => {
  switch (status) {
    case 'error-loading-config':
      return (
        <Callout
          title={t('Error')}
          intent={Intent.Danger}
          iconName="error"
          iconDescription={t('Error')}
          children={
            <Error>
              {t('There was an error fetching the network configuration.')}
            </Error>
          }
        />
      );
    case 'error-validating-config':
      return (
        <Callout
          title={t('Error')}
          intent={Intent.Danger}
          iconName="error"
          iconDescription={t('Error')}
          children={
            <Error>
              {t('The network configuration for the app is invalid.')}
            </Error>
          }
        />
      );
    case 'error-loading-node':
      return (
        <Callout
          title={t('Error')}
          intent={Intent.Danger}
          iconName="error"
          iconDescription={t('Error')}
          children={
            <Error showTryAgain>{t('Failed to connect to a data node.')}</Error>
          }
        />
      );
    case 'idle':
    case 'loading-config':
      return (
        <>
          {children}
          <StatusMessage>
            <Loader size="small" forceTheme="light" />
            <span className="ml-8">{t('Loading configuration...')}</span>
          </StatusMessage>
        </>
      );
    case 'loading-node':
      return (
        <>
          {children}
          <StatusMessage>
            <Loader size="small" forceTheme="light" />
            <span className="ml-8">{t('Finding a node...')}</span>
          </StatusMessage>
        </>
      );
    case 'success':
      return (
        <>
          {children}
          <StatusMessage>
            <Icon name="antenna" />
            <span className="ml-8">{t("You're connected!")}</span>
          </StatusMessage>
        </>
      );
  }
};

type NetworkLoaderProps<T> = {
  children?: ReactNode;
  skeleton?: ReactNode;
  createClient: (url: string) => ApolloClient<T>;
};

export function NetworkLoader<T>({
  skeleton,
  children,
  createClient,
}: NetworkLoaderProps<T>) {
  const [canShowCallout, setShowCallout] = useState(false);
  const { configStatus, VEGA_URL } = useEnvironment();

  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient(VEGA_URL);
    }
    return undefined;
  }, [VEGA_URL, createClient]);

  useEffect(() => {
    setShowCallout(true);
  }, []);

  return !client ? (
    canShowCallout ? (
      <div className="h-full min-h-screen flex items-center justify-center">
        <StatusComponent status={configStatus}>{skeleton}</StatusComponent>
      </div>
    ) : null
  ) : (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
}
