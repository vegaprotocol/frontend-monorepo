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
import { createWalletClient } from './wallet-client';
import { createEthereumWallet } from './ethereum-wallet';
import { ASSET_ID_FOR_MARKET } from './contants';

const log = createLog('create-market');

export async function createMarket(cfg: {
  vegaPubKey: string;
  token: string;
  ethWalletMnemonic: string;
  ethereumProviderUrl: string;
  vegaWalletUrl: string;
  vegaUrl: string;
  faucetUrl: string;
}) {
  // setup wallet client and graphql clients
  setGraphQLEndpoint(cfg.vegaUrl);
  createWalletClient(cfg.vegaWalletUrl, cfg.token);
  createEthereumWallet(cfg.ethWalletMnemonic, cfg.ethereumProviderUrl);

  const markets = await getMarkets();

  if (markets.length) {
    log(
      `${markets.length} market${
        markets.length > 1 ? 's' : ''
      } found, skipping market creation`
    );
    return markets;
  }

  // To participate in governance (in this case proposing and voting in a market)
  // you need to have staked (associated) some Vega with a Vega public key
  await stakeForVegaPublicKey(cfg.vegaPubKey, '10000');

  // Send some of the asset for the market to be proposed to the test pubkey
  const result = await faucetAsset(
    cfg.faucetUrl,
    ASSET_ID_FOR_MARKET,
    cfg.vegaPubKey
  );
  if (!result.success) {
    throw new Error('faucet failed');
  }

  // Propose a new market
  const proposalTxResult = await proposeMarket(cfg.vegaPubKey);
  const proposalId = determineId(proposalTxResult.transaction.signature.value);
  log(`proposal created (id: ${proposalId})`);
  const proposal = await waitForProposal(proposalId);

  // Vote on new market proposal
  await vote(proposal.id, 2, cfg.vegaPubKey);

  // Wait for the market to be enacted and go into opening auction
  await waitForEnactment();

  // Fetch the newly created market
  const newMarkets = await getMarkets();
  return newMarkets;
}
