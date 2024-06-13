import { type PropsWithChildren } from 'react';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  http,
  createConfig,
  WagmiProvider,
  useSwitchChain,
  useChainId,
  useAccount,
  useReadContracts,
  useDisconnect,
  useAccountEffect,
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
import {
  FormGroup,
  TradingSelect as Select,
  TradingInput as Input,
  TradingButton,
  truncateMiddle,
  TradingInputError,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

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
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || '';

  const { data: assets } = useEnabledAssets();
  const asset = assets?.find((a) => a.id === assetId);

  return (
    <Providers>
      <DepositForm assets={assets || []} initialAssetId={asset?.id || ''} />
    </Providers>
  );
};

const bridges: { [id: number]: string } = {
  11155111: '0xcC68d87cAEF9580E3F383d6438F7B3F2C71E3fe5',
  421614: '0xf7989D2902376cad63D0e5B7015efD0CFAd48eB5',
};

const depositSchema = z.object({
  fromAddress: z.string().min(1, 'Connect wallet'),
  assetId: z.string().min(1, 'Required'),
  toPubKey: z.string().min(1, 'Required'),
  // Use a string but parse it as a number for validation
  amount: z.string().refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && n >= 0 && v?.length > 0;
    },
    { message: 'Invalid number' }
  ),
});

const DepositForm = ({
  assets,
  initialAssetId,
}: {
  assets: AssetFieldsFragment[];
  initialAssetId: string;
}) => {
  const { pubKeys } = useVegaWallet();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      fromAddress: address,
      assetId: initialAssetId,
      toPubKey: '',
      amount: '',
    },
  });

  const assetId = useWatch({ name: 'assetId', control: form.control });
  const asset = assets?.find((a) => a.id === assetId);

  const { data } = useAssetChainData({ asset });

  useAccountEffect({
    onConnect: ({ address }) =>
      form.setValue('fromAddress', address, { shouldValidate: true }),
    onDisconnect: () => form.setValue('fromAddress', ''),
  });

  if (!assets) return null;

  return (
    <form
      onSubmit={form.handleSubmit(async (fields) => {
        console.log(fields);

        const asset = assets?.find((a) => a.id === assetId);

        if (!asset || asset.source.__typename !== 'ERC20') {
          throw new Error('no asset');
        }

        if (Number(asset.source.chainId) !== chainId) {
          await switchChainAsync({ chainId: Number(asset.source.chainId) });
        }
      })}
    >
      <FormGroup label="From address" labelFor="fromAddress">
        <Controller
          name="fromAddress"
          control={form.control}
          render={() => {
            if (isConnected) {
              return (
                <div className="flex flex-col items-start">
                  <input
                    value={address}
                    readOnly
                    className="appearance-none text-sm text-muted"
                  />
                  <button
                    type="button"
                    className="underline underline-offset-4 text-xs"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </button>
                </div>
              );
            }

            return (
              <ConnectKitButton.Custom>
                {({ show }) => {
                  return (
                    <TradingButton
                      type="button"
                      onClick={() => {
                        if (show) show();
                      }}
                      intent={Intent.Info}
                      size="small"
                    >
                      Connect
                    </TradingButton>
                  );
                }}
              </ConnectKitButton.Custom>
            );
          }}
        />
        {form.formState.errors.fromAddress?.message && (
          <TradingInputError>
            {form.formState.errors.fromAddress.message}
          </TradingInputError>
        )}
      </FormGroup>
      <FormGroup label="Asset" labelFor="asset">
        <Select
          {...form.register('assetId', {
            onChange: async (e) => {
              const asset = assets.find((a) => a.id === e.target.value);

              if (
                asset?.source.__typename === 'ERC20' &&
                Number(asset.source.chainId) !== chainId
              ) {
                await switchChainAsync({
                  chainId: Number(asset.source.chainId),
                });
              }
            },
          })}
        >
          <option value="" disabled>
            Please select
          </option>
          {assets.map((a) => {
            return (
              <option key={a.id} value={a.id}>
                {a.symbol} {a.source.__typename === 'ERC20' && a.source.chainId}
              </option>
            );
          })}
        </Select>
        {form.formState.errors.assetId?.message && (
          <TradingInputError>
            {form.formState.errors.assetId.message}
          </TradingInputError>
        )}
      </FormGroup>
      <FormGroup label="To Vega key" labelFor="toPubKey">
        <Select {...form.register('toPubKey')}>
          <option value="" disabled>
            Please select
          </option>
          {pubKeys.map((k) => {
            return (
              <option key={k.publicKey} value={k.publicKey}>
                {k.name} {truncateMiddle(k.publicKey)}
              </option>
            );
          })}
        </Select>
        {form.formState.errors.toPubKey?.message && (
          <TradingInputError>
            {form.formState.errors.toPubKey.message}
          </TradingInputError>
        )}
      </FormGroup>
      <FormGroup label="Amount" labelFor="amount">
        <Input {...form.register('amount')} />
        {form.formState.errors.amount?.message && (
          <TradingInputError>
            {form.formState.errors.amount.message}
          </TradingInputError>
        )}
      </FormGroup>
      <TradingButton type="submit" size="large" fill={true}>
        Submit
      </TradingButton>
      <div>
        <div>balanceOf: {data.balanceOf}</div>
        <div>allowance: {data.allowance}</div>
        <div>lifetime limit: {data.lifetimeLimit}</div>
        <div>is exempt: {data.isExempt}</div>
      </div>
    </form>
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

const useAssetChainData = ({ asset }: { asset?: AssetFieldsFragment }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const bridgeAddress = bridges[chainId] as `0x${string}`;

  const assetAddress = (
    asset?.source.__typename === 'ERC20' ? asset.source.contractAddress : ''
  ) as `0x${string}`;

  const { data, ...queryResult } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'balanceOf',
        args: address && [address],
      },
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'allowance',
        args: address && [address, bridgeAddress],
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

  return {
    ...queryResult,
    data: {
      balanceOf: data && data[0].result?.toString(),
      allowance: data && data[1].result?.toString(),
      lifetimeLimit: data && data[2].result?.toString(),
      isExempt: data && data[3].result?.toString(),
    },
  };
};
