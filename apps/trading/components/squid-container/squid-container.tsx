// import { SquidStakingWidget } from '@0xsquid/staking-widget';
// import type {
//   AppConfig,
//   DestinationTokenConfig,
// } from '@0xsquid/staking-widget/widget/core/types/config';
import { Squid } from '@0xsquid/sdk';
import {
  type ChainData,
  type Token,
  SquidCallType,
  TransactionResponse,
} from '@0xsquid/sdk/dist/types';
import compact from 'lodash/compact';
import { ERC20_ABI, BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { ethers } from 'ethers';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  type AssetFieldsFragment,
  useAssetsDataProvider,
} from '@vegaprotocol/assets';
import { useEthereumConfig, useWeb3ConnectStore } from '@vegaprotocol/web3';
import { AssetStatus } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEnvironment } from '@vegaprotocol/environment';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { useWeb3React } from '@web3-react/core';
import { TradingButton } from '@vegaprotocol/ui-toolkit';

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
    <SquidDeposit
      apiUrl={SQUID_API_URL}
      integratorId={SQUID_INTEGRATOR_ID}
      chainId={chainId}
      pubKey={pubKey}
      assets={assets}
      bridgeAddress={config.collateral_bridge_contract.address}
    />
  );
};

const SquidDeposit = ({
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
  const { account, provider } = useWeb3React();
  const openDialog = useWeb3ConnectStore((store) => store.open);

  const squid = useRef(
    new Squid({
      baseUrl: 'https://v2.api.squidrouter.com',
      integratorId: 'vega-swap-widget',
    })
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [ready, setready] = useState(false);
  const [chains, setChains] = useState<ChainData[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);

  const [fromChain, setFromChain] = useState<string>();

  useEffect(() => {
    const run = async () => {
      await squid.current.init();
      console.log('squid inited');
      setready(true);

      setChains(squid.current.chains);
      setTokens(squid.current.tokens);
    };

    run();
  }, []);

  if (!ready) {
    return <div>Loading</div>;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!provider) return;
    if (!account) return;

    if (!pubKey) return;

    if (!formRef.current) return;
    if (!squid.current) return;

    if (!account) {
      alert('Connect wallet');
      return;
    }

    const formData = new FormData(formRef.current);

    const fromChain = formData.get('chain')?.toString();
    const fromToken = formData.get('token')?.toString();
    const fromAmount = formData.get('amount')?.toString();

    if (!fromChain) return;
    if (!fromToken) return;
    if (!fromAmount) return;

    console.log(
      chains,
      tokens?.filter((t) => t.chainId.toString() === fromChain?.toString()),
      fromChain,
      fromToken
    );

    const bridgeAddress = '0x23872549cE10B40e31D6577e0A920088B0E0666a';
    const USDCMainnet = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    const usdcMainnetContract = new ethers.Contract(
      USDCMainnet,
      ERC20_ABI,
      provider.getSigner()
    );

    const bridgeContract = new ethers.Contract(
      bridgeAddress,
      BRIDGE_ABI,
      provider.getSigner()
    );

    const approveEncodeData = usdcMainnetContract.interface.encodeFunctionData(
      'approve',
      [bridgeAddress, 0]
    );

    const depositEncodedData = bridgeContract.interface.encodeFunctionData(
      'deposit_asset',
      [USDCMainnet, 0, '0x' + pubKey]
    );

    const { route, ...rest } = await squid.current.getRoute({
      fromChain,
      fromToken,
      fromAmount,
      toChain: '1',
      toToken: USDCMainnet,
      fromAddress: account,
      toAddress: account,
      slippage: 1,
      customContractCalls: [
        {
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          target: USDCMainnet,
          value: '0', // native value to be sent with call
          callData: approveEncodeData,
          payload: {
            tokenAddress: USDCMainnet, // balance of this token replaces 0 on line 13
            inputPos: 1,
          },
          estimatedGas: '50000',
        },
        {
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          target: bridgeAddress,
          value: '0',
          callData: depositEncodedData,
          payload: {
            tokenAddress: USDCMainnet,
            inputPos: 1,
          },
          estimatedGas: '50000',
        },
      ],
    });

    console.log('router', 'rest');
    console.log(route, rest);

    // Execute the swap transaction
    const tx = (await squid.current.executeRoute({
      signer: provider.getSigner(),
      route,
    })) as unknown as TransactionResponse;

    console.log('tx');
    console.log(tx);

    const txReceipt = await tx.wait();
    console.log('txReceipt');
    console.log(txReceipt);
  };

  return (
    <>
      {account && pubKey ? (
        <>
          <p>{account}</p>
          <p>{pubKey}</p>
        </>
      ) : (
        <div>
          <button onClick={openDialog}>Connect</button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="flex flex-col gap-4"
      >
        <div>
          <label>From chain</label>
          <select
            name="chain"
            className="p-1 border w-full"
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
          >
            {chains?.map((c) => (
              <option key={c.chainId} value={c.chainId}>
                {c.networkName} ({c.chainId})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>From token</label>
          <select name="token" className="p-1 border w-full">
            {tokens
              ?.filter((t) => t.chainId.toString() === fromChain?.toString())
              .map((t, i) => (
                <option key={t.address} value={t.address}>
                  {t.name} ({t.address})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label>Amount</label>
          <input
            name="amount"
            type="text"
            className="p-1 border w-full"
            defaultValue="1000000000000000000"
          />
        </div>
        <TradingButton type="submit">Submit</TradingButton>
      </form>
    </>
  );
};

/**
 * Sets up a config object for the squid staking widget. Its a little
 * confusing becuase we aren't staking here, but just depositing to one
 * of the Vega bridges
 */
/*
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
        id: 'arbitrum-tehter',
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

      const logoURI = `https://icon.vega.xyz/vega/${chainId}/asset/${asset.id}/logo.svg`;

      const cfg: DestinationTokenConfig = {
        // This should just be the end token being deposited
        stakedToken: {
          // TODO: assets now have a chainId property under the source field, need to use it here
          chainId: 1,
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
        destination: [1, 42161],
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
*/

// const common = {
//   error: theme.colors.danger,
//   warning: theme.colors.warning,
//   success: theme.colors.success,
//   primary: theme.colors.vega.blue.DEFAULT, // main button color
//   roundedBtn: '0.25rem',
//   roundedBox: '0px',
//   roundedDropDown: '5px',
//   displayDivider: false,
//   advanced: {
//     transparentWidget: true,
//   },
// } as const;
//
// const lightStyle = {
//   neutralContent: theme.colors.vega.clight['100'], // deemphasied text, like balances below asset
//   baseContent: theme.colors.vega.clight['50'],
//   base100: theme.colors.vega.clight['500'], // wallet address bg
//   base200: theme.colors.vega.clight['700'], // bg of asset on vega chain
//   base300: theme.colors.vega.clight['600'], // border color around asset
//   secondary: theme.colors.vega.clight['400'], // spinner
//   secondaryContent: theme.colors.vega.clight['100'],
//   neutral: theme.colors.vega.clight['900'],
//   ...common,
// } as const;
//
// const darkStyle = {
//   ...common,
//   neutralContent: theme.colors.vega.cdark['100'], // deemphasied text, like balances below asset
//   baseContent: theme.colors.vega.cdark['50'],
//   base100: theme.colors.vega.cdark['500'], // wallet address bg
//   base200: theme.colors.vega.cdark['700'], // bg of asset on vega chain
//   base300: theme.colors.vega.cdark['600'], // border color around asset
//   secondary: theme.colors.vega.cdark['400'], // spinner
//   secondaryContent: theme.colors.vega.cdark['100'],
//   neutral: theme.colors.vega.cdark['900'],
// } as const;

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
