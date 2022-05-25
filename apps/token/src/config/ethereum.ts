import type { EthereumChainId } from '@vegaprotocol/smart-contracts';
import {
  EnvironmentConfig,
  EthereumChainIds,
} from '@vegaprotocol/smart-contracts';

import type { Networks } from './vega';

type VegaContracts = typeof EnvironmentConfig[Networks];

const appChainId = Number(process.env['NX_ETHEREUM_CHAIN_ID'] || 3);

export const APP_ENV = process.env['NX_VEGA_ENV'] as Networks;

const Addresses: Record<number, VegaContracts> = {
  1: EnvironmentConfig.MAINNET,
  3: EnvironmentConfig[APP_ENV],
};

export type { EthereumChainId };
export { EthereumChainIds };

/** Contract addresses for the different contracts in the VEGA ecosystem */
export const ADDRESSES = Addresses[appChainId];

/**
 * The Chain ID the environment is configured for.
 * Normally this is 0x3 (Ropsten) for dev and 0x1 (Mainnet) for prod
 */
export const APP_CHAIN_ID = appChainId;
