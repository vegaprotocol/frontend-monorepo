import { SquidStakingWidget } from '@0xsquid/staking-widget';
import type {
  AppConfig,
  DestinationTokenConfig,
} from '@0xsquid/staking-widget/widget/core/types/config';
import compact from 'lodash/compact';
import { ERC20_ABI, BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import {
  type AssetFieldsFragment,
  useAssetsDataProvider,
} from '@vegaprotocol/assets';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { AssetStatus } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEnvironment } from '@vegaprotocol/environment';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { theme } from '@vegaprotocol/tailwindcss-config';

export const SquidContainer = () => {
  const { SQUID_INTEGRATOR_ID, SQUID_API_URL } = useEnvironment();
  const { pubKey, chainId } = useVegaWallet();
  const { data } = useAssetsDataProvider();
  const { config } = useEthereumConfig();
  const assets = compact(data).filter(
    (a) => a.status === AssetStatus.STATUS_ENABLED
  );

  if (!SQUID_INTEGRATOR_ID || !SQUID_API_URL) return <p>No integrator ID</p>;

  if (!config) return <p>No config</p>;

  if (!pubKey) return <p>No pubkey</p>;

  if (!assets.length) return <p>No assets</p>;

  return (
    <SquidWidget
      apiUrl={SQUID_API_URL}
      integratorId={SQUID_INTEGRATOR_ID}
      chainId={chainId}
      pubKey={pubKey}
      assets={assets}
      bridgeAddress={config.collateral_bridge_contract.address}
    />
  );
};

/**
 * Sets up a config object for the squid staking widget. Its a little
 * confusing becuase we aren't staking here, but just depositing to one
 * of the Vega bridges
 */
const SquidWidget = ({
  apiUrl,
  integratorId,
  chainId,
  pubKey,
  assets,
  bridgeAddress,
}: {
  apiUrl: string;
  integratorId: string;
  chainId: string;
  pubKey: string;
  assets: AssetFieldsFragment[];
  bridgeAddress: string;
}) => {
  const { theme } = useThemeSwitcher();

  const config = useMemo(() => {
    const arbitrumBridgeAddress = '0xd459fac6647059100ebe45543e1da73b3b70ffba';

    // Create a token config for assets on arbitrum, hardcoded for now
    // TODO: get these tokens from the API
    const arbitrumTokensConfig = [
      {
        id: 'arbitrum-tehter',
        name: 'Tether',
        symbol: 'aUSDT',
        decimals: 6,
        quantum: '1000000',
        source: {
          contractAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        },
        status: AssetStatus.STATUS_ENABLED,
      },
      {
        id: 'arbitrum-chainlink',
        name: 'Link',
        symbol: 'aLINK',
        decimals: 6,
        quantum: '1000000',
        source: {
          contractAddress: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
        },
        status: AssetStatus.STATUS_ENABLED,
      },
    ].map((asset) => {
      const logoURI = `https://icon.vega.xyz/vega/${chainId}/asset/${asset.id}/logo.svg`;

      const cfg: DestinationTokenConfig = {
        // This should just be the end token being deposited
        stakedToken: {
          // TODO: assets now have a chainId property under the source field, need to use it here
          chainId: 42161,
          address: asset.source.contractAddress,
          name: asset.name,
          symbol: asset.symbol,
          decimals: asset.decimals,
          logoURI,
          // It appears fine for the coingeckoId to be omitted
          coingeckoId: '',
        },
        stakedTokenExchangeRateGetter: () => Promise.resolve(1),

        // this is the token that will be swapped TO
        tokenToStake: {
          chainId: 42161, // TODO: use chainId of appropriate asset
          address: asset.source.contractAddress,
        },
        logoUrl: logoURI,

        // TODO: these might need to change depending on what chain the asset is. The below will
        // work for the ethereum bridge, will need to check this with the arbitrum bridge.
        customContractCalls: [
          // approve deposits
          {
            callType: 1,
            target: asset.source.contractAddress,
            value: '0', // native value to be sent with call
            callData: () => {
              const contract = new ethers.Contract(
                asset.source.contractAddress,
                ERC20_ABI
              );

              // call data for approval
              const approveEncodedData = contract.interface.encodeFunctionData(
                'approve',
                [arbitrumBridgeAddress, 0]
              );

              return approveEncodedData;
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
            target: arbitrumBridgeAddress,
            value: '0',
            callData: (...args) => {
              console.log(args);
              const bridgeContract = new ethers.Contract(
                arbitrumBridgeAddress,
                ARBITRUM_BRIDGE_ABI
              );

              // call data for deposit
              const depositEncodedData =
                bridgeContract.interface.encodeFunctionData('deposit', [
                  // note different function name from normal bridge
                  asset.source.contractAddress,
                  0, // deposit amount of 0 will get replaced given the payload obj below
                  '0x' + pubKey,
                  // TODO: recovery address: set this from wallet
                  // TODO: unhardcode and need to grab this from callData args
                  '0x72c22822A19D20DE7e426fB84aa047399Ddd8853',
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

      return cfg;
    });

    // Create a token config for each available asset on the network
    const erc20TokensConfig = assets.map((asset) => {
      if (asset.source.__typename !== 'ERC20') return null;

      // TODO: handle different chainIDs for each asset

      const logoURI = `https://icon.vega.xyz/vega/${chainId}/asset/${asset.id}/logo.svg`;

      const cfg: DestinationTokenConfig = {
        // This should just be the end token being deposited
        stakedToken: {
          // TODO: assets now have a chainId property under the source field, need to use it here
          chainId: 1, // asset.source.chainID
          address: asset.source.contractAddress,
          name: asset.name,
          symbol: asset.symbol,
          decimals: asset.decimals,
          logoURI,
          // It appears fine for the coingeckoId to be omitted
          coingeckoId: '',
        },
        stakedTokenExchangeRateGetter: () => Promise.resolve(1),

        // this is the token that will be swapped TO
        tokenToStake: {
          chainId: 1, // TODO: use chainId of appropriate asset
          address: asset.source.contractAddress,
        },
        logoUrl: logoURI,

        // TODO: these might need to change depending on what chain the asset is. The below will
        // work for the ethereum bridge, will need to check this with the arbitrum bridge.
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
                ERC20_ABI
              );

              // call data for approval
              const approveEncodedData = contract.interface.encodeFunctionData(
                'approve',
                [bridgeAddress, 0]
              );

              return approveEncodedData;
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
                BRIDGE_ABI
              );

              // call data for deposit
              const depositEncodedData =
                bridgeContract.interface.encodeFunctionData('deposit_asset', [
                  asset.source.contractAddress,
                  0, // deposit amount of 0 will get replaced given the payload obj below
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

      return cfg;
    });

    const config: AppConfig = {
      companyName: 'Vega',
      integratorId,
      slippage: 1,
      infiniteApproval: false,
      apiUrl,
      availableChains: {
        // Bridges available on ethereum mainnet and arbitrum
        destination: [1, 42161], // TODO: get all chainIDs from assets in API
      },
      stakeConfig: {
        // tokensConfig: compact(erc20TokensConfig),
        tokensConfig: arbitrumTokensConfig,
      },
      titles: {
        swap: 'Deposit',
      },
      // @ts-expect-error theme declarations don't appease
      // `#${string}${string}${string}${string}${string}${string}` type
      style: theme === 'light' ? lightStyle : darkStyle,
    };

    return config;
  }, [apiUrl, integratorId, chainId, pubKey, assets, bridgeAddress, theme]);

  return <SquidStakingWidget config={config} />;
};

const common = {
  error: theme.colors.danger,
  warning: theme.colors.warning,
  success: theme.colors.success,
  primary: theme.colors.vega.blue.DEFAULT, // main button color
  roundedBtn: '0.25rem',
  roundedBox: '0px',
  roundedDropDown: '5px',
  displayDivider: false,
  advanced: {
    transparentWidget: true,
  },
} as const;

const lightStyle = {
  neutralContent: theme.colors.vega.clight['100'], // deemphasied text, like balances below asset
  baseContent: theme.colors.vega.clight['50'],
  base100: theme.colors.vega.clight['500'], // wallet address bg
  base200: theme.colors.vega.clight['700'], // bg of asset on vega chain
  base300: theme.colors.vega.clight['600'], // border color around asset
  secondary: theme.colors.vega.clight['400'], // spinner
  secondaryContent: theme.colors.vega.clight['100'],
  neutral: theme.colors.vega.clight['900'],
  ...common,
} as const;

const darkStyle = {
  ...common,
  neutralContent: theme.colors.vega.cdark['100'], // deemphasied text, like balances below asset
  baseContent: theme.colors.vega.cdark['50'],
  base100: theme.colors.vega.cdark['500'], // wallet address bg
  base200: theme.colors.vega.cdark['700'], // bg of asset on vega chain
  base300: theme.colors.vega.cdark['600'], // border color around asset
  secondary: theme.colors.vega.cdark['400'], // spinner
  secondaryContent: theme.colors.vega.cdark['100'],
  neutral: theme.colors.vega.cdark['900'],
} as const;

const ARBITRUM_BRIDGE_ABI = [
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'asset',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'vegaPubkey',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'recovery',
        type: 'address',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
