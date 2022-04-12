import * as Sentry from '@sentry/react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React from 'react';

import { APP_ENV, Networks } from '../config';

export const useAddAssetSupported = () => {
  const { connector } = useWeb3React();

  return React.useMemo(() => {
    return (
      connector &&
      connector instanceof InjectedConnector &&
      window.ethereum.isMetaMask
    );
  }, [connector]);
};

export const useAddAssetToWallet = (
  address: string,
  symbol: string,
  decimals: number,
  image: string
) => {
  const { provider } = useWeb3React();
  const addSupported = useAddAssetSupported();
  const add = React.useCallback(async () => {
    if (!provider) {
      return;
    }
    try {
      // @ts-ignore TFE import
      provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: `${symbol}${
              // Add the environment if not mainnet
              APP_ENV === Networks.MAINNET
                ? ''
                : // Remove NET as VEGA(TESTNET) is too long
                  ` ${APP_ENV.replace('NET', '')}`
            }`,
            decimals,
            image,
          },
        },
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [address, decimals, image, provider, symbol]);

  return React.useMemo(() => {
    return {
      add,
      addSupported,
    };
  }, [add, addSupported]);
};
