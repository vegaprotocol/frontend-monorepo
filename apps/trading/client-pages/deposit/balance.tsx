import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { Token } from '@vegaprotocol/smart-contracts';
import { addDecimal, isAssetTypeERC20 } from '@vegaprotocol/utils';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

export const Balance = ({
  asset,
  balance,
}: {
  asset: AssetFieldsFragment;
  balance?: BigNumber;
}) => {
  const { provider, account } = useWeb3React();
  const [fallback, setBalance] = useState<BigNumber>(new BigNumber(0));

  useEffect(() => {
    const run = async () => {
      if (!isAssetTypeERC20(asset)) return;

      if (provider && account) {
        const signer = provider.getSigner();
        const tokenContract = new Token(
          asset.source.contractAddress,
          signer || provider
        );

        const balanceRes = await tokenContract.balanceOf(account);
        setBalance(
          new BigNumber(addDecimal(balanceRes.toString(), asset.decimals))
        );
      }
    };

    run();
  }, [asset, account, provider]);

  return (
    <p className="font-mono text-lg">
      {balance ? balance.toString() : fallback.toString()}
      <small className="ml-1 text-muted font-alpha">{asset.symbol}</small>
    </p>
  );
};
