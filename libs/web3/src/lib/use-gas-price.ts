import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { useCollateralBridge } from './use-bridge-contract';

const DEFAULT_INTERVAL = 15000; // 15 seconds

/**
 * These are the hex values of the collateral bridge contract methods.
 *
 * Supported contracts:
 * Ethereum: https://etherscan.io/address/0x23872549cE10B40e31D6577e0A920088B0E0666a#writeContract
 * Arbitrum: https://arbiscan.io/address/0x475B597652bCb2769949FD6787b1DC6916518407#writeContract
 */
export enum ContractMethod {
  DEPOSIT_ASSET = '0xf7683932',
  EXEMPT_DEPOSITOR = '0xb76fbb75',
  GLOBAL_RESUME = '0xd72ed529',
  GLOBAL_STOP = '0x9dfd3c88',
  LIST_ASSET = '0x0ff3562c',
  REMOVE_ASSET = '0xc76de358',
  REVOKE_EXEMPT_DEPOSITOR = '0x6a1c6fa4',
  SET_ASSET_LIMITS = '0x41fb776d',
  SET_WITHDRAW_DELAY = '0x5a246728',
  WITHDRAW_ASSET = '0x3ad90635',
}

export type GasData = {
  /** The base (minimum) price of 1 unit of gas */
  basePrice: BigNumber;
  /** The maximum price of 1 unit of gas */
  maxPrice: BigNumber;
  /** The amount of gas (units) needed to process a transaction */
  gas: BigNumber;
};

type Provider = NonNullable<ReturnType<typeof useWeb3React>['provider']>;

const retrieveGasData = async (
  provider: Provider,
  account: string,
  contractAddress: string,
  contractMethod: ContractMethod
) => {
  try {
    const data = await provider.getFeeData();
    const estGasAmount = await provider.estimateGas({
      to: account,
      from: contractAddress,
      data: contractMethod,
    });

    if (data.lastBaseFeePerGas && data.maxFeePerGas) {
      return {
        // converts also form ethers BigNumber to "normal" BigNumber
        basePrice: BigNumber(data.lastBaseFeePerGas.toString()),
        maxPrice: BigNumber(data.maxFeePerGas.toString()),
        gas: BigNumber(estGasAmount.toString()),
      };
    }
  } catch (err) {
    // NOOP - could not get the estimated gas or the fee data from
    // the network. This could happen if there's an issue with transaction
    // request parameters (e.g. to/from mismatch)
  }

  return undefined;
};

/**
 * Gets the "current" gas price from the ethereum network.
 */
export const useGasPrice = (
  method: ContractMethod,
  chainId?: number
): GasData | undefined => {
  const [gas, setGas] = useState<GasData | undefined>(undefined);

  const { config } = useCollateralBridge(chainId);
  const { account, provider, chainId: activeChainId } = useWeb3React();

  useEffect(() => {
    let ignore = false;

    if (!provider || !config || !account || chainId !== activeChainId) {
      return;
    }

    const retrieve = async () => {
      retrieveGasData(provider, account, config.address, method).then(
        (gasData) => {
          if (ignore) return;
          if (gasData) {
            setGas(gasData);
          }
        }
      );
    };

    retrieve();

    // Retrieves another estimation and prices in [interval] ms.
    const interval = setInterval(() => {
      retrieve();
    }, DEFAULT_INTERVAL);

    return () => {
      clearInterval(interval);
      ignore = true;
    };
  }, [account, activeChainId, chainId, config, method, provider]);

  if (!provider || !config || !account || chainId !== activeChainId) {
    return;
  }

  return gas;
};
