import { ERC20_ABI, ERC20_TEHTER_ABI } from '@vegaprotocol/smart-contracts';
import { type Address } from 'viem';

const TETHER_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// This is a mainnet mirror usdt: https://sepolia.etherscan.io/address/0xeE8FC112037aEF651168665B03b316bFeFA9b39e
const TETHER_TEST_ADDRESS = '0xeE8FC112037aEF651168665B03b316bFeFA9b39e';

/**
 * Returns a modified erc20 abi that is suitable for conforming erc20
 * tokens and USDT which doesn't follow the correct interface
 */
export const getErc20Abi = ({ address }: { address: Address }) => {
  return address === TETHER_ADDRESS || address === TETHER_TEST_ADDRESS
    ? ERC20_TEHTER_ABI
    : ERC20_ABI;
};
