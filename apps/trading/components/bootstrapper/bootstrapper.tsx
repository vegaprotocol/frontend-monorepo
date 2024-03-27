import type { InMemoryCacheConfig } from '@apollo/client';
import {
  DocsLinks,
  NetworkLoader,
  useEnvironment,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { useEffect, type ReactNode, useState } from 'react';
import { Web3Provider } from './web3-provider';
import { useT } from '../../lib/use-t';
import { DataLoader } from './data-loader';
import { Trans } from 'react-i18next';
import { Button, Loader, Splash, VLogo } from '@vegaprotocol/ui-toolkit';
import { VegaWalletProvider, useChainId } from '@vegaprotocol/wallet';

const Failure = ({ reason }: { reason?: ReactNode }) => {
  const t = useT();
  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  return (
    <Splash>
      <div className="border border-vega-red m-10 mx-auto w-4/5 max-w-3xl rounded-lg overflow-hidden animate-shake">
        <div className="bg-vega-red text-white px-2 py-2 flex gap-1 items-center font-alpha calt uppercase">
          <VLogo className="h-4" />
          <span className="text-lg">{t('Failed to initialize the app')}</span>
        </div>
        <div className="p-4 text-left text-sm">
          <p className="mb-4">{reason}</p>
          <div className="text-center">
            <Button className="border-2" onClick={() => setNodeSwitcher(true)}>
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

  const {
    error,
    VEGA_URL,
    VEGA_ENV,
    VEGA_WALLET_URL,
    VEGA_EXPLORER_URL,
    MOZILLA_EXTENSION_URL,
    CHROME_EXTENSION_URL,
  } = useEnvironment();

  const chainId = useChainId(VEGA_URL);

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
    <NetworkLoader
      cache={cacheConfig}
      skeleton={<Loading />}
      failure={<Failure reason={error} />}
    >
      <DataLoader
        skeleton={<Loading />}
        failure={<Failure reason={ERR_DATA_LOADER} />}
      >
        <Web3Provider
          skeleton={<Loading />}
          failure={<Failure reason={t('Could not configure web3 provider')} />}
        >
          {VEGA_URL &&
          VEGA_WALLET_URL &&
          VEGA_EXPLORER_URL &&
          CHROME_EXTENSION_URL &&
          MOZILLA_EXTENSION_URL &&
          DocsLinks &&
          chainId ? (
            <VegaWalletProvider
              config={{
                network: VEGA_ENV,
                vegaUrl: VEGA_URL,
                chainId,
                vegaWalletServiceUrl: VEGA_WALLET_URL,
                links: {
                  explorer: VEGA_EXPLORER_URL,
                  concepts: DocsLinks.VEGA_WALLET_CONCEPTS_URL,
                  chromeExtensionUrl: CHROME_EXTENSION_URL,
                  mozillaExtensionUrl: MOZILLA_EXTENSION_URL,
                },
              }}
            >
              {children}
            </VegaWalletProvider>
          ) : (
            <Failure reason={t('No suitable node found')} />
          )}
        </Web3Provider>
      </DataLoader>
    </NetworkLoader>
  );
};

const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Statistics: {
      merge: true,
    },
    Account: {
      keyFields: false,
      fields: {
        balanceFormatted: {},
      },
    },
    Instrument: {
      keyFields: false,
    },
    TradableInstrument: {
      keyFields: false,
    },
    Product: {
      keyFields: ['settlementAsset', ['id']],
    },
    MarketData: {
      keyFields: ['market', ['id']],
    },
    Node: {
      keyFields: false,
    },
    Withdrawal: {
      fields: {
        pendingOnForeignChain: {
          read: (isPending = false) => isPending,
        },
      },
    },
    ERC20: {
      keyFields: ['contractAddress'],
    },
    Party: {
      keyFields: false,
    },
    Position: {
      keyFields: ['market', ['id'], 'party', ['id']],
    },
    Fees: {
      keyFields: false,
    },
    // The folling types are cached by the data provider and not by apollo
    PositionUpdate: {
      keyFields: false,
    },
    TradeUpdate: {
      keyFields: false,
    },
    AccountUpdate: {
      keyFields: false,
    },
    OrderUpdate: {
      keyFields: false,
    },
    Game: {
      keyFields: false,
    },
  },
};
