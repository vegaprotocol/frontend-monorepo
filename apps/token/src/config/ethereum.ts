import {
  EnvironmentConfig,
  EthereumChainId,
  EthereumChainIds,
  RewardsAddresses,
  RewardsPoolAddresses,
} from "@vegaprotocol/smart-contracts-sdk";

import { Networks } from "./vega";

const appChainId = process.env.REACT_APP_CHAIN as EthereumChainId;
const infuraId = process.env.REACT_APP_INFURA_ID;

export const APP_ENV = process.env.REACT_APP_ENV as Networks;

const Addresses = {
  [EthereumChainIds.Mainnet]: EnvironmentConfig.MAINNET,
  [EthereumChainIds.Ropsten]: EnvironmentConfig[APP_ENV],
};

export type { EthereumChainId };
export { EthereumChainIds };

export const InfuraUrls = {
  [EthereumChainIds.Mainnet]: `https://mainnet.infura.io/v3/${infuraId}`,
  [EthereumChainIds.Ropsten]: `https://ropsten.infura.io/v3/${infuraId}`,
};

/** Contract addresses for the different contracts in the VEGA ecosystem */
export const ADDRESSES = Addresses[appChainId];

/** Contract addresses for liquidity rewards for different markets */
export const REWARDS_ADDRESSES = RewardsAddresses[appChainId];
export const REWARDS_POOL_ADDRESSES = RewardsPoolAddresses[appChainId];

/** Infura endpoints */
export const INFURA_URL = InfuraUrls[appChainId];

/**
 * The Chain ID the environment is configured for.
 * Normally this is 0x3 (Ropsten) for dev and 0x1 (Mainnet) for prod
 */
export const APP_CHAIN_ID = appChainId;
