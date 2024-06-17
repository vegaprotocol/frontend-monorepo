import uniqueId from 'lodash/uniqueId';
import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { create } from 'zustand';

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
import {
  getTransactionConfirmations,
  writeContract,
  waitForTransactionReceipt,
} from '@wagmi/core';
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
  useToasts,
  TradingRichSelect,
  TradingOption,
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
import {
  DepositBusEventDocument,
  type DepositBusEventSubscription,
  type DepositBusEventSubscriptionVariables,
  useEVMBridgeConfigs,
  useEthereumConfig,
  type EVMBridgeConfig,
  type EthereumConfig,
} from '@vegaprotocol/web3';
import { getApolloClient } from '../../lib/apollo-client';
import { DepositStatus } from '@vegaprotocol/types';
import { VegaKeySelect } from './vega-key-select';
import { AssetOption } from './asset-option';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;

const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia, arbitrum, arbitrumSepolia],
    transports: {
      // TODO: add mainnet
      [sepolia.id]: http(process.env.NX_ETHEREUM_PROVIDER_URL),
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

  const allConfigs = [config, ...configs];

  const asset = assets?.find((a) => a.id === assetId);

  return (
    <Providers>
      <DepositForm
        assets={assets || []}
        initialAssetId={asset?.id || ''}
        configs={allConfigs}
      />
    </Providers>
  );
};

const depositSchema = z.object({
  fromAddress: z.string().min(1, 'Connect wallet'),
  assetId: z.string().min(1, 'Required'),
  toPubKey: z.string().regex(/^[A-Fa-f0-9]{64}$/i, 'Invalid key'),
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
  configs,
}: {
  assets: AssetFieldsFragment[];
  initialAssetId: string;
  configs: Configs;
}) => {
  const writeContract = useTx((store) => store.writeContract);

  const { pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  // const { writeContract, data: hash } = useWriteContract();

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

  // Data releating to the select asset, like balance on address, allowance
  const { data } = useAssetReadContracts({ asset, configs });

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('fromAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('fromAddress', ''),
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
    const config = configs.find((c) => c.chain_id === assetChainId);
    const bridgeAddress = config?.collateral_bridge_contract
      .address as `0x${string}`;

    if (!bridgeAddress) {
      throw new Error(`no bridge found for asset ${asset.id}`);
    }

    writeContract(
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'deposit_asset',
        args: [
          assetAddress,
          removeDecimal(fields.amount, asset.decimals),
          prepend0x(fields.toPubKey),
        ],
      },
      64
    );
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
                    className="appearance-none text-sm text-muted w-full focus:outline-none"
                    tabIndex={-1}
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
        <Controller
          name="assetId"
          control={form.control}
          render={({ field }) => {
            return (
              <TradingRichSelect
                placeholder="Select asset"
                value={field.value}
                onValueChange={field.onChange}
              >
                {assets.map((a) => {
                  return (
                    <TradingOption value={a.id} key={a.id}>
                      <AssetOption asset={a} />
                    </TradingOption>
                  );
                })}
              </TradingRichSelect>
            );
          }}
        />
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
      <FormGroup label="To (Vega key)" labelFor="toPubKey">
        <VegaKeySelect
          input={<Input {...form.register('toPubKey')} />}
          select={
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
          }
        />
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
      <TradingButton
        type="submit"
        size="large"
        fill={true}
        intent={Intent.Secondary}
      >
        Submit
      </TradingButton>
    </form>
  );
};

const useAssetReadContracts = ({
  asset,
  configs,
}: {
  asset?: AssetFieldsFragment;
  configs: Configs;
}) => {
  const { address } = useAccount();

  let assetAddress: `0x${string}`;
  let assetChainId: string;
  let bridgeAddress: `0x${string}` | undefined;

  if (asset?.source.__typename === 'ERC20') {
    assetAddress = asset.source.contractAddress as `0x${string}`;
    assetChainId = asset.source.chainId;
    const config = configs.find((c) => c.chain_id === assetChainId);
    bridgeAddress = config?.collateral_bridge_contract.address as `0x${string}`;
  }

  const { data, ...queryResult } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        // @ts-ignore TODO: figure out types
        address: assetAddress,
        functionName: 'balanceOf',
        args: address && [address],
      },
      {
        abi: erc20Abi,
        // @ts-ignore TODO: figure out types
        address: assetAddress,
        functionName: 'allowance',
        args: address && bridgeAddress && [address, bridgeAddress],
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'get_asset_deposit_lifetime_limit',
        // @ts-ignore TODO: figure out types
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
      className="absolute right-0 top-0 pt-0.5 ml-auto text-xs underline underline-offset-4"
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

type Tx = {
  hash: string;
  confirmations: number;
};

const useTx = create<{
  txs: Map<string, Tx>;
  updateTx: (id: string, data: Partial<Tx>) => void;
  writeContract: (
    config: Parameters<typeof writeContract>[1],
    requiredConfirmations?: number
  ) => void;
}>()((set, get) => ({
  txs: new Map(),
  updateTx: (id, data) => {
    set((prev) => {
      const curr = prev.txs.get(id);

      if (curr) {
        return {
          txs: new Map(prev.txs).set(id, {
            ...curr,
            ...data,
          }),
        };
      }

      return {
        txs: new Map(prev.txs).set(id, {
          hash: '',
          confirmations: 0,
          ...data,
        }),
      };
    });
  },
  writeContract: async (config, requiredConfirmations = 1) => {
    const id = uniqueId();
    const txStore = get();
    const toastStore = useToasts.getState();

    toastStore.setToast({
      id,
      intent: Intent.Warning,
      content: <p>Confirm in wallet</p>,
    });

    let hash: `0x${string}`;

    try {
      hash = await writeContract(wagmiConfig, config);

      txStore.updateTx(id, { hash });

      toastStore.update(id, {
        content: <div>Hash: {truncateMiddle(hash)}</div>,
      });
    } catch (err) {
      // TODO: create a type guard for this
      if (
        err !== null &&
        typeof err === 'object' &&
        'shortMessage' in err &&
        typeof err.shortMessage === 'string'
      ) {
        toastStore.update(id, {
          content: <p>{err.shortMessage}</p>,
          intent: Intent.Danger,
        });
      } else {
        toastStore.update(id, {
          content: <p>Something went wrong</p>,
          intent: Intent.Danger,
        });
      }

      return;
    }

    if (!hash) {
      return;
    }

    await waitForTransactionReceipt(wagmiConfig, { hash });

    if (requiredConfirmations > 1) {
      await waitForConfirmations(id, hash, requiredConfirmations);
    }

    // TODO: ensure toast re-pops if its been closed, but only on confirmation
    if (config.functionName === 'deposit_asset') {
      const client = getApolloClient();
      // poll or subscribe to depoist events
      const sub = client
        .subscribe<
          DepositBusEventSubscription,
          DepositBusEventSubscriptionVariables
        >({
          query: DepositBusEventDocument,
        })
        .subscribe(({ data }) => {
          if (!data?.busEvents?.length) return;

          const event = data.busEvents.find((e) => {
            if (e.event.__typename === 'Deposit' && e.event.txHash === hash) {
              return true;
            }
            return false;
          });

          if (event && event.event.__typename === 'Deposit') {
            if (event.event.status === DepositStatus.STATUS_FINALIZED) {
              toastStore.update(id, {
                intent: Intent.Success,
                content: <p>Deposit confirmed</p>,
              });
              sub.unsubscribe();
            }
          }
        });
    }
  },
}));

const waitForConfirmations = (
  id: string,
  hash: `0x${string}`,
  requiredConfirmations: number
): Promise<bigint> => {
  return new Promise((resolve, reject) => {
    const txStore = useTx.getState();
    const toastStore = useToasts.getState();
    // Start checking confirmations
    const interval = setInterval(async () => {
      try {
        const confirmations = await getTransactionConfirmations(wagmiConfig, {
          hash,
        });

        txStore.updateTx(id, {
          confirmations: Number(confirmations),
        });

        toastStore.update(id, {
          content: (
            <p>
              {Number(confirmations)}/{requiredConfirmations}
            </p>
          ),
        });

        if (confirmations >= BigInt(requiredConfirmations)) {
          clearInterval(interval);
          resolve(confirmations);
        }
      } catch {
        clearInterval(interval);
        reject();
      }
    }, 1000 * 12);
  });
};
