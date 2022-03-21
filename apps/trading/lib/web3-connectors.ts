import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

const INFURA_ID = '4f846e79e13f44d1b51bbd7ed9edefb8';

export const metamask = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions)
);

export const walletconnect = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: {
        1: `https://mainnet.infura.io/v3/${INFURA_ID}`,
        3: `https://ropsten.infura.io/v3/${INFURA_ID}`,
      },
    }),
  [1, 3]
);
