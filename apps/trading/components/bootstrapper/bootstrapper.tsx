import { ApolloProvider } from '@apollo/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { useEffect, type ReactNode, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { WagmiProvider } from 'wagmi';

import {
  useEnvironment,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { WalletProvider } from '@vegaprotocol/wallet-react';
import { Button, Loader, Splash, VLogo } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../lib/use-t';
import { getApolloClient } from '../../lib/apollo-client';
import { wagmiConfig } from '../../lib/wagmi-config';
import { queryClient } from '../../lib/query-client';
import { useVegaWalletConfig } from '../../lib/hooks/use-vega-wallet-config';
import { DataLoader } from './data-loader';

const Failure = ({ reason }: { reason?: ReactNode }) => {
  const t = useT();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  return (
    <Splash>
      <div className="border border-vega-red m-10 mx-auto w-4/5 max-w-3xl rounded-lg overflow-hidden animate-shake">
        <div className="bg-vega-red text-white px-2 py-2 flex gap-1 items-center font-alt calt uppercase">
          <VLogo className="h-4" />
          <span className="text-lg">{t('Failed to initialize the app')}</span>
        </div>
        <div className="p-4 text-left text-sm">
          <p className="mb-4">{reason}</p>
          <div className="text-center">
            <Button onClick={() => setNodeSwitcher(true)}>
              {t('Change node')}
            </Button>
          </div>
        </div>
      </div>
    </Splash>
  );
};

const Loading = () => {
  const [showSlowNotification, setShowSlowNotification] = useState(false);
  const t = useT();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  useEffect(() => {
    const to = setTimeout(() => {
      if (!showSlowNotification) setShowSlowNotification(true);
    }, 5000);
    return () => {
      clearTimeout(to);
    };
  }, [showSlowNotification]);
  return (
    <Splash>
      <div className="border border-transparent m-10 mx-auto w-4/5 max-w-3xl rounded-lg overflow-hidden">
        <div className="mt-11 p-4 text-left text-sm">
          <Loader />
          {showSlowNotification && (
            <>
              <p className="mt-4 text-center">
                {t(
                  "It looks like you're connection is slow, try switching to another node."
                )}
              </p>
              <div className="mt-4 text-center">
                <Button
                  className="border-2"
                  onClick={() => setNodeSwitcher(true)}
                >
                  {t('Change node')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Splash>
  );
};

export const Bootstrapper = ({ children }: { children: ReactNode }) => {
  const t = useT();

  const { error, VEGA_URL } = useEnvironment((state) => ({
    error: state.error,
    VEGA_URL: state.VEGA_URL,
  }));

  const config = useVegaWalletConfig();

  const ERR_DATA_LOADER = (
    <Trans
      i18nKey="It appears that the connection to the node <0>{{VEGA_URL}}</0> does not return necessary data, try switching to another node."
      components={[
        <span key="vega" className="text-muted">
          {VEGA_URL}
        </span>,
      ]}
      values={{
        VEGA_URL,
      }}
    />
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <GraphQLProvider
            skeleton={<Loading />}
            failure={<Failure reason={error} />}
          >
            <DataLoader
              skeleton={<Loading />}
              failure={<Failure reason={ERR_DATA_LOADER} />}
            >
              {config ? (
                <WalletProvider config={config}>{children}</WalletProvider>
              ) : (
                <Failure
                  reason={t('Could not configure the wallet provider')}
                />
              )}
            </DataLoader>
          </GraphQLProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

type ClientProviderProps = {
  children?: ReactNode;
  skeleton?: ReactNode;
  failure?: ReactNode;
};

function GraphQLProvider({ skeleton, failure, children }: ClientProviderProps) {
  const { status, VEGA_URL } = useEnvironment((store) => ({
    status: store.status,
    VEGA_URL: store.VEGA_URL,
  }));

  const client = useMemo(() => {
    if (status === 'success' && VEGA_URL) {
      return getApolloClient(VEGA_URL);
    }
    return undefined;
  }, [VEGA_URL, status]);

  if (status === 'failed') {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{failure}</>;
  }

  if (status === 'default' || status === 'pending' || !client) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{skeleton}</>;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
