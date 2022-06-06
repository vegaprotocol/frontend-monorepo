import { useMemo } from 'react';
import type { ReactNode, ComponentProps } from 'react';
import type { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '../../hooks';
import type { ConfigStatus } from '../../types';

type NetworkLoaderProps<T> = {
  children?: ReactNode;
  createClient: (url: string) => ApolloClient<T>;
};

type Translate = typeof t;

type StatusComponentProps = Pick<
  ComponentProps<typeof Dialog>,
  'intent' | 'title' | 'children'
>;

const getStatusDialogProps = (
  t: Translate,
  status: ConfigStatus
): StatusComponentProps => {
  switch (status) {
    case 'error-loading-config':
      return {
        title: t('Error'),
        intent: Intent.Danger,
        children: <>{t('There was an error ')}</>,
      };
    case 'error-loading-node':
      return {
        title: t('Error'),
        intent: Intent.Danger,
        children: <>{t('There was an error ')}</>,
      };
    case 'loading-config':
      return {
        title: t('Error'),
        intent: Intent.Progress,
        children: <>{t('Loading configuration...')}</>,
      };
    case 'loading-node':
      return {
        title: t('Error'),
        intent: Intent.Progress,
        children: <>{t('Finding a node...')}</>,
      };
    case 'success':
      return {
        title: t('Error'),
        intent: Intent.Success,
        children: <>{t("You're connected!")}</>,
      };
  }
};

export function NetworkLoader<T>({
  children,
  createClient,
}: NetworkLoaderProps<T>) {
  const { configStatus, VEGA_URL } = useEnvironment();

  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient(VEGA_URL);
    }
    return undefined;
  }, [VEGA_URL, createClient]);

  return !client ? (
    <Dialog {...getStatusDialogProps(t, configStatus)} open />
  ) : (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
}
