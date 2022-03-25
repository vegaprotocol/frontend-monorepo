import { DepositPage_assets } from '@vegaprotocol/graphql';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useBridgeContract } from './use-bridge-contract';

export const useDepositLimits = (asset?: DepositPage_assets) => {
  const contract = useBridgeContract();
  const [limits, setLimits] = useState({
    min: new BigNumber(0),
    max: new BigNumber(0),
  });

  useEffect(() => {
    const run = async () => {
      if (!asset || asset.source.__typename !== 'ERC20') {
        return;
      }

      const [min, max] = await Promise.all([
        contract.getDepositMinimum(
          asset.source.contractAddress,
          asset.decimals
        ),
        contract.getDepositMaximum(
          asset.source.contractAddress,
          asset.decimals
        ),
      ]);

      setLimits({
        min,
        max: max.isZero() ? new BigNumber(Infinity) : max,
      });
    };

    run();
  }, [asset, contract]);

  return limits;
};
