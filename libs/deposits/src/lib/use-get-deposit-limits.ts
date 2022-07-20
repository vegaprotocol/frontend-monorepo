import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import type { Asset } from './deposit-manager';
import {
  useBridgeContract,
  useEthereumConfig,
  useEthereumReadContract,
} from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { useWeb3React } from '@web3-react/core';

export const useGetDepositLimits = (asset?: Asset) => {
  const { account, provider } = useWeb3React();
  const { config } = useEthereumConfig();
  const contract = useBridgeContract(true);
  const [userTotal, setUserTotal] = useState<BigNumber | null>(null);
  const getLimits = useCallback(async () => {
    if (!contract || !asset || asset.source.__typename !== 'ERC20') {
      return;
    }

    return contract.getDepositMaximum(asset.source.contractAddress);
  }, [asset, contract]);

  useEffect(() => {
    if (
      !provider ||
      !config ||
      !account ||
      !asset ||
      asset.source.__typename !== 'ERC20'
    ) {
      return;
    }

    const abicoder = new ethers.utils.AbiCoder();
    const innerHash = ethers.utils.keccak256(
      abicoder.encode(['address', 'uint256'], [account, 4])
    );
    const storageLocation = ethers.utils.keccak256(
      abicoder.encode(
        ['address', 'bytes32'],
        [asset.source.contractAddress, innerHash]
      )
    );
    (async () => {
      const res = await provider.getStorageAt(
        config.collateral_bridge_contract.address,
        storageLocation
      );
      const value = new BigNumber(res, 16).toString();
      setUserTotal(new BigNumber(addDecimal(value, asset.decimals)));
    })();
  }, [provider, config, account, asset]);

  const {
    state: { data },
  } = useEthereumReadContract(getLimits);

  if (!data || !userTotal || !asset) return null;

  const max = new BigNumber(addDecimal(data.toString(), asset.decimals));

  return {
    max: max.isEqualTo(0) ? new BigNumber(Infinity) : max,
    deposited: userTotal,
  };
};
