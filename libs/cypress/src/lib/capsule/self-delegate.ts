import * as Schema from '@vegaprotocol/types';
import { determineId } from '../utils';
import { setGraphQLEndpoint } from './request';
import { vote } from './vote';
import { stakeForVegaPublicKey } from './ethereum-setup';
import { faucetAsset } from './faucet-asset';
import {
  proposeMarket,
  waitForEnactment,
  waitForProposal,
} from './propose-market';
import { createLog } from './logging';
import { getMarkets } from './get-markets';
import { createWalletClient, sendVegaTx } from './wallet-client';
import { createEthereumWallet } from './ethereum-wallet';
import { ASSET_ID_FOR_MARKET } from './contants';

export async function selfDelegate(
  cfg: {
    vegaPubKey: string;
    token: string;
    ethWalletMnemonic: string;
    ethereumProviderUrl: string;
    vegaWalletUrl: string;
    vegaUrl: string;
    faucetUrl: string;
    nodeId: string
  }) {
    // setup wallet client and graphql clients
  setGraphQLEndpoint(cfg.vegaUrl);
  createWalletClient(cfg.vegaWalletUrl, cfg.token);
  createEthereumWallet(cfg.ethWalletMnemonic, cfg.ethereumProviderUrl);

  // Associate tokens to validator wallet
  await stakeForVegaPublicKey(cfg.vegaPubKey);

  // Stake on validator
  // By default 3000 vega is minimum amount of stake required for self-delegation
  const stakeTx =
  {
    "delegateSubmission": {
        "nodeId": cfg.nodeId,
        "amount": "3000000000000000000000"
    }
  }

  const result = await sendVegaTx(cfg.vegaPubKey, stakeTx)
  console.log(result)
}
