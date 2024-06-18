import { type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { type QueryKey } from '@tanstack/react-query';
import { z } from 'zod';
import BigNumber from 'bignumber.js';

import {
  useSwitchChain,
  useChainId,
  useAccount,
  useReadContracts,
  useDisconnect,
  useAccountEffect,
  useStorageAt,
} from 'wagmi';

import { ConnectKitButton } from 'connectkit';
import { encodeAbiParameters, erc20Abi, keccak256 } from 'viem';
import {
  useEnabledAssets,
  useAssetDetailsDialogStore,
  type AssetERC20,
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
  TradingRichSelect,
  TradingOption,
  Notification,
} from '@vegaprotocol/ui-toolkit';
import {
  BRIDGE_ABI,
  ERC20_ABI,
  prepend0x,
} from '@vegaprotocol/smart-contracts';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  addDecimalsFormatNumber,
  formatNumber,
  formatNumberRounded,
  removeDecimal,
  toBigNum,
} from '@vegaprotocol/utils';
import {
  useEVMBridgeConfigs,
  useEthereumConfig,
  type EVMBridgeConfig,
  type EthereumConfig,
} from '@vegaprotocol/web3';

import { VegaKeySelect } from './vega-key-select';
import { AssetOption } from './asset-option';
import { useEvmTx } from '../../lib/hooks/use-evm-tx';
import { queryClient } from '../../lib/query-client';
import { useT } from '../../lib/use-t';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;

export const DepositContainer = ({
  initialAssetId,
}: {
  initialAssetId?: string;
}) => {
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { data: assets } = useEnabledAssets();

  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  const asset = assets?.find((a) => a.id === initialAssetId);

  return (
    <DepositForm
      assets={
        (assets || []).filter(
          (a) => a.source.__typename === 'ERC20'
        ) as AssetERC20[]
      }
      initialAssetId={asset?.id || ''}
      configs={allConfigs}
    />
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
  assets: Array<AssetERC20>;
  initialAssetId: string;
  configs: Configs;
}) => {
  const { writeContract: writeFaucet } = useEvmTx();
  const { writeContract: writeDeposit } = useEvmTx();

  const { pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

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

  const amount = useWatch({ name: 'amount', control: form.control });
  const assetId = useWatch({ name: 'assetId', control: form.control });
  const asset = assets?.find((a) => a.id === assetId);

  // Data releating to the select asset, like balance on address, allowance
  const { data, queryKey } = useAssetReadContracts({ asset, configs });

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

    await writeDeposit(
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'deposit_asset',
        args: [
          assetAddress,
          removeDecimal(fields.amount, asset.decimals),
          prepend0x(fields.toPubKey),
        ],
        chainId: Number(asset.source.chainId),
      },
      {
        functionName: 'deposit_asset',
        asset,
        amount: fields.amount,
        requiredConfirmations: config?.confirmations || 1,
      }
    );

    queryClient.invalidateQueries({ queryKey });
  };

  const submitFaucet = async () => {
    if (!asset) {
      throw new Error('no asset selected');
    }

    if (asset.source.__typename !== 'ERC20') {
      throw new Error('asset not erc20');
    }

    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    await writeFaucet({
      abi: ERC20_ABI, // has the faucet method
      address: asset.source.contractAddress as `0x${string}`,
      functionName: 'faucet',
      chainId: Number(asset.source.chainId),
    });

    queryClient.invalidateQueries({ queryKey });
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
                    className="appearance-none bg-transparent text-sm text-muted w-full focus:outline-none"
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
          <SecondaryActionContainer>
            <SecondaryAction onClick={() => openAssetDialog(asset.id)}>
              View asset details
            </SecondaryAction>
            <SecondaryAction onClick={() => submitFaucet()}>
              Get {asset.symbol}
            </SecondaryAction>
          </SecondaryActionContainer>
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
            <KeyValueTableRow>
              <div>Deposited</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.deposited || '0', asset.decimals)
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
          <SecondaryActionContainer>
            <SecondaryAction
              onClick={() => {
                const amount = toBigNum(
                  data.balanceOf || '0',
                  asset.decimals
                ).toFixed(asset.decimals);
                form.setValue('amount', amount, { shouldValidate: true });
              }}
            >
              Use maximum
            </SecondaryAction>
          </SecondaryActionContainer>
        )}
      </FormGroup>
      {asset && data && (
        <Approval
          asset={asset}
          amount={amount}
          data={data}
          configs={configs}
          queryKey={queryKey}
        />
      )}
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

const Approval = ({
  asset,
  amount: _amount,
  data,
  configs,
  queryKey,
}: {
  asset: AssetERC20;
  amount: string;
  data: {
    balanceOf: string;
    allowance: string;
    lifetimeLimit: string;
    isExempt: string;
  };
  configs: Configs;
  queryKey: QueryKey;
}) => {
  const t = useT();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const allowance = toBigNum(data.allowance, asset.decimals);
  const amount = toBigNum(_amount, 0); // amount is raw user input so no need for decimals

  const { writeContract: writeApprove, data: dataApprove } = useEvmTx();

  const submitApprove = async () => {
    if (!asset) {
      throw new Error('no asset selected');
    }

    if (asset.source.__typename !== 'ERC20') {
      throw new Error('asset not erc20');
    }

    const assetAddress = asset.source.contractAddress as `0x${string}`;
    const assetChainId = asset.source.chainId;
    const config = configs.find((c) => c.chain_id === assetChainId);
    const bridgeAddress = config?.collateral_bridge_contract
      .address as `0x${string}`;

    if (!bridgeAddress) {
      throw new Error(`no bridge found for asset ${asset.id}`);
    }

    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }
    const maxUint256 =
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    await writeApprove({
      abi: erc20Abi,
      address: assetAddress,
      functionName: 'approve',
      args: [bridgeAddress, maxUint256],
      chainId: Number(asset.source.chainId),
    });

    queryClient.invalidateQueries({ queryKey });
  };

  if (allowance.isZero()) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="approve-default"
          message={t(
            'Before you can make a deposit of your chosen asset, {{assetSymbol}}, you need to approve its use in your Ethereum wallet',
            { assetSymbol: asset.symbol }
          )}
          buttonProps={{
            size: 'small',
            text: dataApprove?.isPending
              ? 'Approval pending'
              : t('Approve {{assetSymbol}}', {
                  assetSymbol: asset.symbol,
                }),
            action: () => submitApprove(),
            dataTestId: 'approve-submit',
            disabled: dataApprove?.isPending,
          }}
        />
      </div>
    );
  }

  if (amount.isGreaterThan(allowance)) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="approve-default"
          message={t('Approve again to deposit more than {{allowance}}', {
            allowance: formatNumber(allowance),
          })}
          buttonProps={{
            size: 'small',
            text: dataApprove?.isPending
              ? 'Approval pending'
              : t('Approve {{assetSymbol}}', {
                  assetSymbol: asset.symbol,
                }),
            action: () => submitApprove(),
            dataTestId: 'approve-submit',
            disabled: dataApprove?.isPending,
          }}
        />
      </div>
    );
  }

  return null;
};

const useAssetReadContracts = ({
  asset,
  configs,
}: {
  asset?: AssetERC20;
  configs: Configs;
}) => {
  const { address } = useAccount();

  const assetAddress = asset?.source.contractAddress as `0x${string}`;
  const assetChainId = asset?.source.chainId;

  const config = configs.find((c) => c.chain_id === assetChainId);

  const bridgeAddress = config?.collateral_bridge_contract
    .address as `0x${string}`;

  const enabled = Boolean(assetAddress && bridgeAddress && address);

  const slot =
    address && assetAddress
      ? depositedAmountStorageLocation(address, assetAddress)
      : undefined;

  const { data: depositedData } = useStorageAt({
    address: bridgeAddress as `0x${string}`,
    slot,
    query: { enabled },
  });

  const { data, ...queryResult } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'balanceOf',
        args: address && [address],
        chainId: Number(assetChainId),
      },
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'allowance',
        args: address ? [address, bridgeAddress] : undefined,
        chainId: Number(assetChainId),
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'get_asset_deposit_lifetime_limit',
        args: [assetAddress],
        chainId: Number(assetChainId),
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'is_exempt_depositor',
        args: [address],
        chainId: Number(assetChainId),
      },
    ],
    query: {
      enabled,
    },
  });

  return {
    ...queryResult,
    data: data
      ? {
          balanceOf: data[0].result ? data[0].result.toString() : '0',
          allowance: data[1].result ? data[1].result?.toString() : '0',
          lifetimeLimit: data[2].result ? data[2].result?.toString() : '0',
          isExempt: data[3].result ? data[3].result?.toString() : '0',
          deposited: depositedData
            ? new BigNumber(depositedData, 16).toString()
            : '0',
        }
      : undefined,
  };
};

const SecondaryActionContainer = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} className="absolute right-0 top-0 pt-0.5 flex gap-2" />
  );
};

const SecondaryAction = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      type="button"
      className="text-xs underline underline-offset-4"
    />
  );
};

const depositedAmountStorageLocation = (
  account: `0x${string}`,
  assetSource: `0x${string}`
) => {
  const innerHash = keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [account, BigInt(4)]
    )
  );

  const storageLocation = keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'bytes32' }],
      [assetSource, innerHash]
    )
  );

  return storageLocation;
};
