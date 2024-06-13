import { type PropsWithChildren, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  http,
  createConfig,
  WagmiProvider,
  useReadContract,
  useSwitchChain,
  useChainId,
  useAccount,
  useReadContracts,
} from 'wagmi';
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains';

import {
  ConnectKitButton,
  ConnectKitProvider,
  getDefaultConfig,
} from 'connectkit';
import { erc20Abi } from 'viem';
import {
  type AssetFieldsFragment,
  useEnabledAssets,
} from '@vegaprotocol/assets';
import { Select } from '@vegaprotocol/ui-toolkit';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';

const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia, arbitrum, arbitrumSepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [arbitrum.id]: http(),
      [arbitrumSepolia.id]: http(),
    },
    walletConnectProjectId: process.env.NX_WALLETCONNECT_PROJECT_ID as string,
    appName: 'Vega',
    appDescription: 'Vega deposits and withdrawals',
  })
);

const queryClient = new QueryClient();

export const Deposit = () => {
  // const [searchParams] = useSearchParams();
  // const assetId = searchParams.get('assetId') || undefined;

  return (
    <Providers>
      <div className="flex flex-col gap-6">
        <h1>Deposit</h1>
        <DepositContainer />
      </div>
    </Providers>
  );
};

const bridges: { [id: number]: string } = {
  11155111: '0xcC68d87cAEF9580E3F383d6438F7B3F2C71E3fe5',
  421614: '0xf7989D2902376cad63D0e5B7015efD0CFAd48eB5',
};

const DepositContainer = () => {
  const { data: assets } = useEnabledAssets();

  const [asset, setAsset] = useState<AssetFieldsFragment>();
  const assetAddress = (
    asset?.source.__typename === 'ERC20' ? asset.source.contractAddress : ''
  ) as `0x${string}`;

  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const bridgeAddress = bridges[chainId];

  const { data } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'allowance',
        args: [address, bridgeAddress],
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'get_asset_deposit_lifetime_limit',
        args: [assetAddress],
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'is_exempte_depositor',
        args: [address],
      },
    ],
  });

  if (!assets) return null;

  return (
    <div>
      <div>
        <ConnectKitButton />
      </div>
      <Select
        value={asset?.id}
        onChange={(e) => {
          const asset = assets.find((a) => a.id === e.target.value);

          if (
            asset?.source.__typename === 'ERC20' &&
            Number(asset.source.chainId) !== chainId
          ) {
            switchChain({ chainId: Number(asset.source.chainId) });
          }

          setAsset(asset);
        }}
      >
        {assets.map((a) => {
          return (
            <option key={a.id} value={a.id}>
              {a.symbol} {a.source.__typename === 'ERC20' && a.source.chainId}
            </option>
          );
        })}
      </Select>
      {data && (
        <div>
          <div>balanceOf: {data[0].result?.toString()}</div>
          <div>allowance: {data[1].result?.toString()}</div>
          <div>lifetime limit: {data[2].result?.toString()}</div>
          <div>is exempt: {data[3].result?.toString()}</div>
        </div>
      )}
    </div>
  );
};

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
