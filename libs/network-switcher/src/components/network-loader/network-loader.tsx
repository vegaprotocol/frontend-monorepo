import { useState, useEffect, useMemo } from 'react';
import type { ReactNode, ComponentProps } from 'react';
import type { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { Callout, Intent, Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '../../hooks';
import type { ConfigStatus } from '../../types';

type NetworkLoaderProps<T> = {
  children?: ReactNode;
  createClient: (url: string) => ApolloClient<T>;
};

type Translate = typeof t;

type StatusComponentProps = ComponentProps<typeof Callout>;

const Error = ({ message }: { message: string }) => (
  <div>
    <div className="mb-16">{message}</div>
    <Button
      className="mt-8"
      variant="secondary"
      onClick={() => window.location.reload()}
    >
      Try again
    </Button>
  </div>
);

const getStatusCalloutProps = (
  t: Translate,
  status: ConfigStatus
): StatusComponentProps => {
  switch (status) {
    case 'error-loading-config':
      return {
        title: t('Error'),
        intent: Intent.Danger,
        children: (
          <Error
            message={t(
              'There was an error fetching the network configuration.'
            )}
          />
        ),
        iconName: 'error',
        iconDescription: t('Error'),
      };
    case 'error-validating-config':
      return {
        title: t('Error'),
        intent: Intent.Danger,
        children: (
          <Error
            message={t('The network configuration for the app is invalid.')}
          />
        ),
        iconName: 'error',
        iconDescription: t('Error'),
      };
    case 'error-loading-node':
      return {
        title: t('Error'),
        intent: Intent.Danger,
        children: <Error message={t('Failed connecting to a data node.')} />,
        iconName: 'error',
        iconDescription: t('Error'),
      };
    case 'idle':
    case 'loading-config':
      return {
        title: t('Loading'),
        intent: Intent.Progress,
        children: <>{t('Loading configuration...')}</>,
        isLoading: true,
      };
    case 'loading-node':
      return {
        title: t('Loading'),
        intent: Intent.Progress,
        children: <>{t('Finding a node...')}</>,
        isLoading: true,
      };
    case 'success':
      return {
        title: t('Success'),
        intent: Intent.Success,
        children: <>{t("You're connected!")}</>,
      };
  }
};

export function NetworkLoader<T>({
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
        <Callout {...getStatusCalloutProps(t, configStatus)} />
      </div>
    ) : null
  ) : (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
}
