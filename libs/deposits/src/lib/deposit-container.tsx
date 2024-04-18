import { useMemo } from 'react';
import compact from 'lodash/compact';
import { ethers } from 'ethers';
import { ERC20_ABI, BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { SquidStakingWidget } from '@0xsquid/staking-widget';
import { type AppConfig } from '@0xsquid/staking-widget/widget/core/types/config';
import { useWeb3React } from '@web3-react/core';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEthereumConfig, useWeb3ConnectStore } from '@vegaprotocol/web3';
import {
  type AssetFieldsFragment,
  useAssetsDataProvider,
} from '@vegaprotocol/assets';
import { AssetStatus } from '@vegaprotocol/types';

export const DepositContainer = () => {
  const { provider } = useWeb3React();
  const { pubKey } = useVegaWallet();
  const { config } = useEthereumConfig();
  const { data } = useAssetsDataProvider();
  const connect = useWeb3ConnectStore((store) => store.open);

  const assets = compact(data).filter(
    (a) => a.status === AssetStatus.STATUS_ENABLED
  );

  if (!config) return null;

  return (
    <div className="w-[500px]">
      {provider && pubKey ? (
        <DepositContainerInner
          pubKey={pubKey}
          provider={provider}
          assets={assets}
          bridgeAddress={config.collateral_bridge_contract.address}
        />
      ) : (
        <div>
          <button onClick={connect}>Connect</button>
        </div>
      )}
    </div>
  );
};

export const DepositContainerInner = ({
  pubKey,
  provider,
  assets,
  bridgeAddress,
}: {
  pubKey: string;
  provider: ethers.providers.Web3Provider;
  assets: AssetFieldsFragment[];
  bridgeAddress: string;
}) => {
  const config = useMemo(() => {
    // Create a token config for each available asset on the network
    const tokensConfig = assets.map((asset) => {
      // TODO: we'll need to handle assets that are not normal erc20 (eg arbitram)
      if (asset.source.__typename !== 'ERC20') return null;

      return {
        // This should just be the end token being deposited
        stakedToken: {
          // TODO: assets now have a chainId property under the source field, need to use it here
          chainId: 1,
          address: asset.source.contractAddress,
          name: asset.name,
          symbol: asset.symbol,
          decimals: asset.decimals,
          // TODO: use emblem
          logoURI: 'https://etherscan.io/token/images/centre-usdc_28.png',

          // TODO: we'll need to map assets to coingecko IDs
          coingeckoId: 'usdc',
        },
        stakedTokenExchangeRateGetter: () => Promise.resolve(1),

        // this is the token that will be swapped TO
        tokenToStake: {
          chainId: 1, // TODO: use chainId
          address: asset.source.contractAddress,
        },
        logoUrl:
          'https://icon.vega.xyz/vega/vega-stagnet1-202307191148/asset/fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55/logo.svg',
        customContractCalls: [
          // approve deposits
          {
            callType: 1,
            target: asset.source.contractAddress,
            value: '0', // native value to be sent with call
            callData: () => {
              if (asset.source.__typename !== 'ERC20') {
                throw new Error('not erc20');
              }

              const contract = new ethers.Contract(
                asset.source.contractAddress,
                ERC20_ABI,
                provider.getSigner()
              );

              // call data for approval
              const approveEncodeData = contract.interface.encodeFunctionData(
                'approve',
                [bridgeAddress, 0]
              );

              return approveEncodeData;
            },
            payload: {
              tokenAddress: asset.source.contractAddress,
              inputPos: 1,
            },
            estimatedGas: '50000',
          },

          // call deposit_asset on vega collateral beridge
          {
            callType: 1,
            target: bridgeAddress,
            value: '0',
            callData: () => {
              if (asset.source.__typename !== 'ERC20') {
                throw new Error('erc20');
              }

              const bridgeContract = new ethers.Contract(
                bridgeAddress,
                BRIDGE_ABI,
                provider.getSigner()
              );

              // call data for deposit
              const depositEncodedData =
                bridgeContract.interface.encodeFunctionData('deposit_asset', [
                  asset.source.contractAddress,
                  0,
                  '0x' + pubKey,
                ]);

              return depositEncodedData;
            },
            payload: {
              tokenAddress: asset.source.contractAddress,
              inputPos: 1,
            },
            estimatedGas: '50000',
          },
        ],
      };
    });

    const config: AppConfig = {
      companyName: 'Vega',
      integratorId: 'vega-swap-widget',
      slippage: 1,
      infiniteApproval: false,
      apiUrl: 'https://api.squidrouter.com',
      stakeConfig: {
        tokensConfig: compact(tokensConfig),
      },
    };

    return config;
  }, [provider, pubKey, assets, bridgeAddress]);

  return <SquidStakingWidget config={config} />;
};
