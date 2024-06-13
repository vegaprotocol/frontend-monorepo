import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';
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
  useWriteContract,
  useWaitForTransactionReceipt,
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
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  FormGroup,
  TradingSelect as Select,
  TradingInput as Input,
  TradingButton,
  truncateMiddle,
  TradingInputError,
  Intent,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import { BRIDGE_ABI, prepend0x } from '@vegaprotocol/smart-contracts';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  addDecimalsFormatNumber,
  formatNumberRounded,
  removeDecimal,
  toBigNum,
} from '@vegaprotocol/utils';
import { useEVMBridgeConfigs, useEthereumConfig } from '@vegaprotocol/web3';

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

  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { data: assets } = useEnabledAssets();

  if (!config) return null;
  if (!configs?.length) return null;

  const bridgeAddresses = new Map<string, string>();
  bridgeAddresses.set(
    config.chain_id,
    config.collateral_bridge_contract.address
  );
  for (const c of configs) {
    bridgeAddresses.set(c.chain_id, c.collateral_bridge_contract.address);
  }
  const asset = assets?.find((a) => a.id === assetId);

  return (
    <Providers>
      <DepositForm
        assets={assets || []}
        initialAssetId={asset?.id || ''}
        bridgeAddresses={bridgeAddresses}
      />
    </Providers>
  );
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

type FormFields = z.infer<typeof depositSchema>;

const DepositForm = ({
  assets,
  initialAssetId,
  bridgeAddresses,
}: {
  assets: AssetFieldsFragment[];
  initialAssetId: string;
  bridgeAddresses: Map<string, string>;
}) => {
  const { pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  const { writeContract, data: hash } = useWriteContract();

  const form = useForm<FormFields>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      // fromAddress is just dervied from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      fromAddress: address,
      assetId: initialAssetId,
      toPubKey: '',
      amount: '',
    },
  });

  const assetId = useWatch({ name: 'assetId', control: form.control });
  const asset = assets?.find((a) => a.id === assetId);

  const { data } = useAssetReadContracts({ asset });

  useWriteContract();

  useAccountEffect({
    onConnect: ({ address }) =>
      form.setValue('fromAddress', address, { shouldValidate: true }),
    onDisconnect: () => form.setValue('fromAddress', ''),
  });

  const receipt = useWaitForTransactionReceipt({
    hash,
  });

  const submitDeposit = async (fields: FormFields) => {
    const asset = assets?.find((a) => a.id === fields.assetId);

    if (!asset || asset.source.__typename !== 'ERC20') {
      throw new Error('no asset');
    }

    // Make sure we are on the right chain. Changing asset will trigger a chain
    // change but its possible to end up on the wrong chain for the selected
    // asset if the user refreshes the page
    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    const assetAddress = asset.source.contractAddress as `0x${string}`;
    const assetChainId = asset.source.chainId;
    const bridgeAddress = bridgeAddresses.get(assetChainId) as `0x${string}`;

    if (!bridgeAddress) {
      throw new Error(`no bridge found for asset ${asset.id}`);
    }

    const config = {
      abi: BRIDGE_ABI,
      address: bridgeAddress,
      functionName: 'deposit_asset',
      args: [
        assetAddress,
        removeDecimal(fields.amount, asset.decimals),
        prepend0x(fields.toPubKey),
      ],
    };

    writeContract(config);
  };

  return (
    <form onSubmit={form.handleSubmit(submitDeposit)}>
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
        {asset && (
          <UseButton onClick={() => openAssetDialog(asset.id)}>
            View asset details
          </UseButton>
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

      {data && asset && (
        <div className="pb-4">
          <KeyValueTable>
            <KeyValueTableRow>
              <div>Balance available</div>
              <div>
                {addDecimalsFormatNumber(data.balanceOf || '0', asset.decimals)}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>Allowance</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.allowance || '0', asset.decimals)
                )}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>Deposit cap</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.lifetimeLimit || '0', asset.decimals)
                )}
              </div>
            </KeyValueTableRow>
          </KeyValueTable>
        </div>
      )}
      <FormGroup label="Amount" labelFor="amount">
        <Input {...form.register('amount')} />
        {form.formState.errors.amount?.message && (
          <TradingInputError>
            {form.formState.errors.amount.message}
          </TradingInputError>
        )}

        {asset && data && data.balanceOf && (
          <UseButton
            onClick={() => {
              const amount = toBigNum(
                data.balanceOf || '0',
                asset.decimals
              ).toFixed(asset.decimals);
              form.setValue('amount', amount, { shouldValidate: true });
            }}
          >
            Use maximum
          </UseButton>
        )}
      </FormGroup>
      <TradingButton type="submit" size="large" fill={true}>
        Submit
      </TradingButton>
      {receipt && (
        <pre className="text-xs">{JSON.stringify(receipt, null, 2)}</pre>
      )}
    </form>
  );
};

const useAssetReadContracts = ({ asset }: { asset?: AssetFieldsFragment }) => {
  const { address } = useAccount();

  let assetAddress;
  let assetChainId;
  let bridgeAddress;

  if (asset?.source.__typename === 'ERC20') {
    assetAddress = asset.source.contractAddress as `0x${string}`;
    assetChainId = Number(asset.source.chainId);
    bridgeAddress = bridges[assetChainId] as `0x${string}`;
  }

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
        args: address && bridgeAddress && [address, bridgeAddress],
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
        functionName: 'is_exempt_depositor',
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

const UseButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      type="button"
      className="absolute right-0 top-0 ml-auto text-sm underline"
    />
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
