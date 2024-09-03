import { useEnvironment, useFeatureFlags } from '@vegaprotocol/environment';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useMemo } from 'react';
import {
  ARBITRUM_CHAIN_ID,
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  ETHEREUM_SEPOLIA_CHAIN_ID,
  type EVMBridgeConfig,
  getTokenContract,
  useEVMBridgeConfigs,
  useEthereumConfig,
  SQUID_RECEIVER_CONTRACT_ADDRESS,
  type ChainId,
} from '@vegaprotocol/web3';
import { theme } from '@vegaprotocol/tailwindcss-config';
import {
  type AssetFieldsFragment,
  useEnabledAssets,
} from '@vegaprotocol/assets';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import {
  ArbitrumSquidReceiver,
  CollateralBridge,
  prepend0x,
} from '@vegaprotocol/smart-contracts';
import { AssetStatus } from '@vegaprotocol/types';
import { getVegaAssetLogoUrl } from '@vegaprotocol/emblem';
import { isAssetUSDTArb } from '../utils/is-asset-usdt-arb';

/**
 * A flag determining whether the final deposit via SquidRouter should be done
 * via the SquidReceiver bridge or not.
 *
 * If set to `true` then the asset will be deposited to via the receiver,
 * otherwise it will be deposited via the collateral bridge (not recommended).
 */
const USE_SQUID_RECEIVER_BRIDGE = true;

type SquidFriendlyAsset = Omit<AssetFieldsFragment, 'source'> & {
  source: {
    __typename: 'ERC20';
    contractAddress: string;
    lifetimeLimit: string;
    withdrawThreshold: string;
    chainId: string;
  };
};

type ChainInfo = {
  chainId: string;
  bridgeAddress: string;
  contract: CollateralBridge | ArbitrumSquidReceiver;
};

type EnrichedSquidFriendlyAsset = SquidFriendlyAsset & ChainInfo;

const isSquidFriendlyAsset = (
  asset: AssetFieldsFragment
): asset is SquidFriendlyAsset =>
  Boolean(
    asset.source.__typename === 'ERC20' &&
      asset.source.chainId &&
      Number(asset.source.chainId) === ARBITRUM_CHAIN_ID &&
      asset.source.contractAddress
  );

const HARDCODED_EVM_CONFIGS: EVMBridgeConfig[] = [
  {
    chain_id: String(ARBITRUM_CHAIN_ID),
    network_id: String(ARBITRUM_CHAIN_ID),
    collateral_bridge_contract: {
      address: '0x475B597652bCb2769949FD6787b1DC6916518407',
      deployment_block_height: 0,
    },
    confirmations: 0,
    multisig_control_contract: {
      address: '',
      deployment_block_height: 0,
    },
    block_time: '250',
    name: 'Arbitrum',
  },
];

const HARDCODED_TEST_ASSETS: SquidFriendlyAsset[] = [
  {
    id: 'a4a16e250a09a86061ec83c2f9466fc9dc33d332f86876ee74b6f128a5cd6710',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    quantum: '1000000',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      lifetimeLimit: '10000000000',
      withdrawThreshold: '1',
      chainId: String(ETHEREUM_CHAIN_ID),
    },
  },
  {
    id: 'bf1e88d19db4b3ca0d1d5bdb73718a01686b18cf731ca26adedf3c8b83802bba',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    quantum: '1000000',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      lifetimeLimit: '10000000000',
      withdrawThreshold: '1',
      chainId: String(ETHEREUM_CHAIN_ID),
    },
  },
  {
    id: 'arbitrum-tether',
    name: 'Tether USD (Arbitrum)',
    symbol: 'USDT',
    decimals: 6,
    quantum: '1000000',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      lifetimeLimit: '10000000000',
      withdrawThreshold: '1',
      chainId: String(ARBITRUM_CHAIN_ID),
    },
  },
  {
    id: 'arbitrum-chainlink',
    name: 'Chainlink (Arbitrum)',
    symbol: 'LINK',
    decimals: 6,
    quantum: '1000000',
    status: AssetStatus.STATUS_ENABLED,
    source: {
      __typename: 'ERC20',
      contractAddress: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      lifetimeLimit: '10000000000',
      withdrawThreshold: '1',
      chainId: String(ARBITRUM_CHAIN_ID),
    },
  },
];

export const useEnrichedSquidFriendlyAssets = () => {
  const flags = useFeatureFlags((state) => state.flags);
  const isArbitrumTestBridgeEnabled = flags.CROSS_CHAIN_DEPOSITS_TEST;

  const { config, loading: ethLoading, error: ethError } = useEthereumConfig();
  const {
    configs,
    loading: evmLoading,
    error: evmError,
  } = useEVMBridgeConfigs();

  const evmConfigs = isArbitrumTestBridgeEnabled
    ? HARDCODED_EVM_CONFIGS
    : configs;

  const {
    data: enabledAssets,
    loading: enablesAssetsLoading,
    error: enabledAssetsError,
  } = useEnabledAssets();

  const assets = isArbitrumTestBridgeEnabled
    ? HARDCODED_TEST_ASSETS
    : compact(enabledAssets).filter(isSquidFriendlyAsset);

  const chains: ChainInfo[] = useMemo(
    () =>
      compact(
        uniq(
          compact(
            assets?.map((a) =>
              a.source.__typename === 'ERC20' ? a.source.chainId : null
            )
          )
        ).map((chainId) => {
          if (
            (chainId === String(ETHEREUM_CHAIN_ID) ||
              chainId === String(ETHEREUM_SEPOLIA_CHAIN_ID)) &&
            config
          ) {
            return {
              chainId,
              bridgeAddress: config.collateral_bridge_contract.address,
              contract: new CollateralBridge(
                config.collateral_bridge_contract.address
              ),
            };
          }

          if (
            chainId === String(ARBITRUM_CHAIN_ID) ||
            chainId === String(ARBITRUM_SEPOLIA_CHAIN_ID)
          ) {
            const arbitrumConfig = evmConfigs?.find(
              (c) => c.chain_id === chainId
            );
            const squidReceiverAddress =
              SQUID_RECEIVER_CONTRACT_ADDRESS[Number(chainId) as ChainId];

            if (USE_SQUID_RECEIVER_BRIDGE && squidReceiverAddress) {
              return {
                chainId,
                bridgeAddress: squidReceiverAddress,
                contract: new ArbitrumSquidReceiver(squidReceiverAddress),
              };
            } else if (arbitrumConfig) {
              return {
                chainId,
                bridgeAddress:
                  arbitrumConfig.collateral_bridge_contract.address,
                contract: new CollateralBridge(
                  arbitrumConfig.collateral_bridge_contract.address
                ),
              };
            }
          }
          return null;
        })
      ),
    [assets, config, evmConfigs]
  );

  const enriched: EnrichedSquidFriendlyAsset[] = compact(
    assets.map((a) => {
      const chainId = a.source.__typename === 'ERC20' && a.source.chainId;
      const chainInfo = chains.find((ch) => ch.chainId === chainId);
      if (chainInfo) return { ...a, ...chainInfo };
    })
  );

  const allowedAssets = enriched.filter((e) => isAssetUSDTArb(e));

  return {
    assets: allowedAssets,
    loading: ethLoading || evmLoading || enablesAssetsLoading,
    error: ethError || evmError || enabledAssetsError,
  };
};

export enum SquidRouterConfigError {
  NO_VEGA_PUBKEY = 'NO_VEGA_PUBKEY',
  NO_SQUID_API_CONFIGURATION = 'NO_SQUID_API_CONFIGURATION',
  NO_SUPPORTED_ASSETS = 'NO_SUPPORTED_ASSETS',
  INTERNAL = 'INTERNAL',
}

export const useSquidRouterConfig = (): {
  // eslint-disable-next-line
  config: any | undefined;
  loading: boolean;
  error: SquidRouterConfigError | undefined;
} => {
  const { SQUID_INTEGRATOR_ID, SQUID_API_URL } = useEnvironment();
  const { pubKey, chainId, status } = useVegaWallet();

  const {
    assets,
    loading,
    error: assetError,
  } = useEnrichedSquidFriendlyAssets();

  const [config, error] = useMemo(() => {
    const availableChains = uniq(assets.map((a) => Number(a.chainId))); // chain ids have to be a number here
    if (!pubKey || status !== 'connected') {
      return [undefined, SquidRouterConfigError.NO_VEGA_PUBKEY];
    }
    if (!SQUID_INTEGRATOR_ID || !SQUID_API_URL) {
      return [undefined, SquidRouterConfigError.NO_SQUID_API_CONFIGURATION];
    }
    if (availableChains.length === 0 || assets.length === 0) {
      return [undefined, SquidRouterConfigError.NO_SUPPORTED_ASSETS];
    }
    if (assetError) {
      return [undefined, SquidRouterConfigError.INTERNAL];
    }

    const tokens = assets.map((asset) =>
      mapAssetToDestinationTokenConfig(asset, pubKey, chainId)
    );
    const config = {
      integratorId: SQUID_INTEGRATOR_ID,
      companyName: 'Vega',
      slippage: 1,
      infiniteApproval: false,
      apiUrl: SQUID_API_URL,
      availableChains: {
        //   source: availableChains,
        destination: availableChains,
      },
      stakeConfig: {
        tokensConfig: tokens,
      },
      titles: {
        swap: 'Deposit',
        stakedTokens: 'Available tokens',
      },
      style,
    };

    return [config, undefined];
  }, [
    assets,
    pubKey,
    status,
    SQUID_INTEGRATOR_ID,
    SQUID_API_URL,
    assetError,
    chainId,
  ]);

  return { config, loading, error };
};

const style = {
  error: theme.colors.intent.danger,
  warning: theme.colors.intent.warning,
  success: theme.colors.intent.success,
  primary: theme.colors.blue, // main button color
  roundedBtn: '0.25rem',
  roundedBox: '0px',
  roundedDropDown: '5px',
  displayDivider: false,
  advanced: {
    transparentWidget: true,
  },
  neutralContent: theme.colors.gs['100'], // de-emphasized text, like balances below asset
  baseContent: theme.colors.gs['50'],
  base100: theme.colors.gs['500'], // wallet address bg
  base200: theme.colors.gs['700'], // bg of asset on vega chain
  base300: theme.colors.gs['600'], // border color around asset
  secondary: theme.colors.gs['400'], // spinner
  secondaryContent: theme.colors.gs['100'],
  neutral: theme.colors.gs['900'],
} as const;

const mapAssetToDestinationTokenConfig = (
  asset: EnrichedSquidFriendlyAsset,
  pubKey: string,
  vegaChainId: string
) => {
  const tokenContractAddress = asset.source.contractAddress;

  // FIXME: Could use some better icon getting
  const assetLogo = getVegaAssetLogoUrl(vegaChainId, asset.id);

  const route = [
    // 0: SWAP
    // 1: APPROVE ASSET
    {
      callType: 1,
      target: tokenContractAddress,
      value: '0',
      callData: () => {
        const spender = asset.bridgeAddress;
        const contract = getTokenContract(tokenContractAddress);
        const data = contract.encodeApproveData(spender, '0');
        return data;
      },
      payload: {
        tokenAddress: tokenContractAddress,
        inputPos: 1,
      },
      estimatedGas: '50000',
    },
    // 2: DEPOSIT ASSET
    {
      callType: 1,
      target: asset.bridgeAddress,
      value: '0',
      // eslint-disable-next-line
      callData: (args: any) => {
        if (asset.contract instanceof ArbitrumSquidReceiver) {
          // DEPOSIT ON ARBITRUM BRIDGE
          // NOTE: This should be calling the SquidReceiver contract `deposit`
          // method instead of the `depositAsset` on Arbitrum's collateral
          // bridge.
          const recovery = args.destinationAddress || '';
          const data = asset.contract.encodeDepositData(
            asset.source.contractAddress,
            '0',
            prepend0x(pubKey),
            recovery
          );
          return data;
        } else {
          // DEPOSIT ON ETHEREUM BRIDGE
          // NOTE: This is a direct call on to the ethereum collateral bridge.
          // This will call the `depositAsset` method.
          // Although it also should have it's own squid receiver on Ethereum.
          const data = asset.contract.encodeDepositData(
            asset.source.contractAddress,
            '0',
            prepend0x(pubKey)
          );
          return data;
        }
      },
      payload: {
        tokenAddress: asset.source.contractAddress,
        inputPos: 1,
      },
      estimatedGas: '50000',
    },
  ];

  const cfg = {
    stakedToken: {
      chainId: Number(asset.source.chainId),
      address: asset.source.contractAddress,
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals,
      logoURI: assetLogo,
      coingeckoId: '',
    },
    stakedTokenExchangeRateGetter: () => Promise.resolve(1),
    tokenToStake: {
      chainId: Number(asset.source.chainId),
      address: asset.source.contractAddress,
    },
    logoUrl: assetLogo,
    customContractCalls: route,
  };
  return cfg;
};
