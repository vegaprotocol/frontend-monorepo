import React from 'react';
import { Networks } from '@vegaprotocol/environment';
import { useWeb3React } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { useEnvironment } from '@vegaprotocol/environment';

export const useAddAssetSupported = () => {
  const { connector } = useWeb3React();

  return React.useMemo(() => {
    return connector && connector instanceof MetaMask;
  }, [connector]);
};

export const useAddAssetToWallet = (
  address: string,
  symbol: string,
  decimals: number,
  image: string
) => {
  const { VEGA_ENV } = useEnvironment();
  const { provider } = useWeb3React();
  const addSupported = useAddAssetSupported();
  const add = React.useCallback(async () => {
    if (!provider?.provider.request) {
      return;
    }
    try {
      provider.provider.request({
        method: 'wallet_watchAsset',
        params: {
          // @ts-ignore string type not accepted, but this is working
          type: 'ERC20',
          options: {
            address,
            symbol: `${symbol}${
              // Add the environment if not mainnet
              VEGA_ENV === Networks.MAINNET
                ? ''
                : // Remove NET as VEGA(TESTNET) is too long
                  ` ${VEGA_ENV.replace('NET', '')}`
            }`,
            decimals,
            image,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }, [address, decimals, image, provider, symbol, VEGA_ENV]);

  return React.useMemo(() => {
    return {
      add,
      addSupported,
    };
  }, [add, addSupported]);
};
