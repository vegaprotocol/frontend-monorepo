import { setGraphQLEndpoint } from './request';
import { stakeForVegaPublicKey } from './ethereum-setup';
import { createWalletClient, sendVegaTx } from './wallet-client';
import { createEthereumWallet } from './ethereum-wallet';

export async function selfDelegate(
  cfg: {
    ethWalletMnemonic: string;
    ethereumProviderUrl: string;
    vegaWalletUrl: string;
    vegaUrl: string;
    faucetUrl: string;
  },
  vegaWalletPubKey: string,
  apiToken: string,
  nodeId: string
) {
  // setup wallet client and graphql clients
  setGraphQLEndpoint(cfg.vegaUrl);
  createWalletClient(cfg.vegaWalletUrl, apiToken);
  createEthereumWallet(cfg.ethWalletMnemonic, cfg.ethereumProviderUrl);

  // Associate tokens to validator wallet
  await stakeForVegaPublicKey(vegaWalletPubKey, '3000');

  // Stake on validator
  // By default 3000 vega is minimum amount of stake required for self-delegation
  const stakeTx = {
    delegateSubmission: {
      nodeId: nodeId,
      amount: '3000' + '0'.repeat(18),
    },
  };

  const result = await sendVegaTx(vegaWalletPubKey, stakeTx);
  return result;
}
