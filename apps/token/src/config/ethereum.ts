import type { EthereumChainId } from '@vegaprotocol/smart-contracts-sdk';
import {
  EnvironmentConfig,
  EthereumChainIds,
  RewardsAddresses,
  RewardsPoolAddresses,
} from '@vegaprotocol/smart-contracts-sdk';

import type { Networks } from './vega';

const appChainId = Number(process.env['NX_ETHEREUM_CHAIN_ID']);
const infuraId = process.env['NX_INFURA_ID'];

export const APP_ENV = process.env['NX_VEGA_ENV'] as Networks;

const Addresses = {
  1: EnvironmentConfig.MAINNET,
  3: EnvironmentConfig[APP_ENV],
};

export type { EthereumChainId };
export { EthereumChainIds };

export const InfuraUrls = {
  [EthereumChainIds.Mainnet]: `https://mainnet.infura.io/v3/${infuraId}`,
  [EthereumChainIds.Ropsten]: `https://ropsten.infura.io/v3/${infuraId}`,
};

/** Contract addresses for the different contracts in the VEGA ecosystem */
// @ts-ignore TFE import
export const ADDRESSES = Addresses[appChainId];

/** Contract addresses for liquidity rewards for different markets */
export const REWARDS_ADDRESSES = RewardsAddresses[`0x${appChainId}`];
export const REWARDS_POOL_ADDRESSES = RewardsPoolAddresses[`0x${appChainId}`];

/** Infura endpoints */
export const INFURA_URL = InfuraUrls[appChainId];

/**
 * The Chain ID the environment is configured for.
 * Normally this is 0x3 (Ropsten) for dev and 0x1 (Mainnet) for prod
 */
export const APP_CHAIN_ID = appChainId;
