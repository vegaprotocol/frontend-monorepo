import {
  type EVMBridgeConfig,
  type EthereumConfig,
  useEVMBridgeConfigs,
  useEthereumConfig,
  useVegaTransactionStore,
} from '@vegaprotocol/web3';
import {
  useAssetDetailsDialogStore,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import { z } from 'zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  useDialogStore,
  useVegaWallet,
  useWallet,
  useDisconnect as useVegaDisconnect,
} from '@vegaprotocol/wallet-react';
import {
  useAccount,
  useAccountEffect,
  useDisconnect as useEvmDisconnect,
  useReadContracts,
} from 'wagmi';
import {
  FormGroup,
  TradingInput as Input,
  TradingButton,
  truncateMiddle,
  TradingInputError,
  Intent,
  TradingRichSelect,
  TradingOption,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import { ConnectKitButton } from 'connectkit';
import { useEffect } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberRounded,
  removeDecimal,
  toBigNum,
} from '@vegaprotocol/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Account, useAccounts } from '@vegaprotocol/accounts';
import { AccountType } from '@vegaprotocol/types';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';

import { useT } from '../../lib/use-t';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../form-secondary-action';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;

export const WithdrawContainer = ({
  initialAssetId,
}: {
  initialAssetId?: string;
}) => {
  const { pubKey } = useVegaWallet();
  const { data } = useAccounts(pubKey);

  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();

  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  const accounts = data?.filter(
    (a) => a.type === AccountType.ACCOUNT_TYPE_GENERAL
  );
  const account = accounts?.find((a) => a.asset.id === initialAssetId);
  const asset = account?.asset;

  return (
    <WithdrawForm
      accounts={accounts || []}
      initialAssetId={asset?.id || ''}
      configs={allConfigs}
    />
  );
};

const withdrawSchema = z.object({
  assetId: z.string().min(1, 'Required'),
  fromPubKey: z.string().regex(/^[A-Fa-f0-9]{64}$/i, 'Connect Vega wallet'),
  toAddress: z.string().min(1, 'Enter address or connect wallet'),
  // Use a string but parse it as a number for validation
  amount: z.string().refine(
    (v) => {
      const n = Number(v);

      if (v?.length <= 0) return false;
      if (isNaN(n)) return false;
      if (n <= 0) return false;

      return true;
    },
    { message: 'Invalid number' }
  ),
});

type FormFields = z.infer<typeof withdrawSchema>;

const WithdrawForm = ({
  accounts,
  initialAssetId,
  configs,
}: {
  accounts: Account[];
  initialAssetId: string;
  configs: Configs;
}) => {
  const t = useT();

  const vegaChainId = useWallet((store) => store.chainId);
  const { pubKey, pubKeys } = useVegaWallet();
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect: evmDisconnect } = useEvmDisconnect();

  const { disconnect: vegaDisconnect } = useVegaDisconnect();

  const createTransaction = useVegaTransactionStore((state) => state.create);

  const form = useForm<FormFields>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      fromPubKey: pubKey,
      assetId: initialAssetId,
      toAddress: address,
    },
  });

  const assetId = useWatch({ name: 'assetId', control: form.control });
  const account = accounts?.find((a) => a.asset.id === assetId);

  const { data } = useReadWithdrawalData({ asset: account?.asset, configs });

  const submitDeposit = (fields: FormFields) => {
    if (!account) {
      throw new Error('no account for withdraw');
    }

    createTransaction({
      withdrawSubmission: {
        amount: removeDecimal(fields.amount, account.asset.decimals),
        asset: fields.assetId,
        ext: {
          erc20: {
            receiverAddress: fields.toAddress,
          },
        },
      },
    });
  };

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('toAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('toAddress', ''),
  });

  // Update the form field when pubKeys change
  useEffect(() => {
    if (pubKeys.length) {
      form.setValue('fromPubKey', pubKeys[0].publicKey, {
        shouldValidate: true,
      });
    } else {
      form.setValue('fromPubKey', '');
    }
  }, [pubKeys, form]);

  return (
    <form onSubmit={form.handleSubmit(submitDeposit)}>
      <FormGroup label={t('From (Vega key)')} labelFor="fromPubKey">
        <Controller
          name="fromPubKey"
          control={form.control}
          render={() => {
            if (!pubKeys.length) {
              return (
                <TradingButton
                  intent={Intent.Info}
                  size="small"
                  onClick={() => openVegaWalletDialog()}
                >
                  {t('Connect')}
                </TradingButton>
              );
            }

            return (
              <div className="flex flex-col items-start">
                <input
                  value={pubKey}
                  readOnly
                  className="appearance-none bg-transparent text-sm text-muted w-full focus:outline-none"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  className="underline underline-offset-4 text-xs"
                  onClick={() => vegaDisconnect()}
                >
                  {t('Disconnect')}
                </button>
              </div>
            );
          }}
        />
        {form.formState.errors.fromPubKey?.message && (
          <TradingInputError>
            {form.formState.errors.fromPubKey.message}
          </TradingInputError>
        )}
      </FormGroup>
      <FormGroup label={t('Asset')} labelFor="asset">
        <Controller
          name="assetId"
          control={form.control}
          render={({ field }) => {
            return (
              <TradingRichSelect
                placeholder={t('Select asset')}
                value={field.value}
                onValueChange={field.onChange}
              >
                {accounts.map((a) => {
                  return (
                    <TradingOption value={a.asset.id} key={a.asset.id}>
                      <div className="w-full flex items-start gap-2">
                        <EmblemByAsset
                          asset={a.asset.id}
                          vegaChain={vegaChainId}
                        />
                        <div className="text-xs text-left">
                          <div>{a.asset.name}</div>
                          <div>
                            {a.asset.symbol}{' '}
                            {a.asset.source.__typename === 'ERC20'
                              ? truncateMiddle(a.asset.source.contractAddress)
                              : a.asset.source.__typename}
                          </div>
                        </div>
                        <div className="ml-auto self-end text-xs">
                          {addDecimalsFormatNumber(a.balance, a.asset.decimals)}
                        </div>
                      </div>
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
        {account && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => openAssetDialog(account.asset.id)}
            >
              View asset details
            </FormSecondaryActionButton>
          </FormSecondaryActionWrapper>
        )}
      </FormGroup>
      <FormGroup label={t('To address')} labelFor="toAddress">
        <Controller
          name="toAddress"
          control={form.control}
          render={({ field }) => {
            return (
              <>
                <Input value={field.value} onChange={field.onChange} />
                <FormSecondaryActionWrapper>
                  {isConnected ? (
                    <FormSecondaryActionButton onClick={() => evmDisconnect()}>
                      {t('Disconnect')}
                    </FormSecondaryActionButton>
                  ) : (
                    <ConnectKitButton.Custom>
                      {({ show }) => {
                        return (
                          <FormSecondaryActionButton
                            type="button"
                            onClick={() => {
                              if (show) show();
                            }}
                          >
                            {t('Connect')}
                          </FormSecondaryActionButton>
                        );
                      }}
                    </ConnectKitButton.Custom>
                  )}
                </FormSecondaryActionWrapper>
              </>
            );
          }}
        />
        {form.formState.errors.toAddress?.message && (
          <TradingInputError>
            {form.formState.errors.toAddress.message}
          </TradingInputError>
        )}
      </FormGroup>
      {data && account && (
        <div className="pb-4">
          <KeyValueTable>
            <KeyValueTableRow>
              <div>{t('Balance available')}</div>
              <div>
                {addDecimalsFormatNumber(
                  account.balance || '0',
                  account.asset.decimals
                )}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>{t('Delay threshold')}</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.threshold || '0', account.asset.decimals)
                )}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>{t('Delay time')}</div>
              <div>{data.delay}s</div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>Gas</div>
              <div>{/* TODO: get gas */}</div>
            </KeyValueTableRow>
          </KeyValueTable>
        </div>
      )}
      <FormGroup label={t('Amount')} labelFor="amount">
        <Input {...form.register('amount')} />
        {form.formState.errors.amount?.message && (
          <TradingInputError>
            {form.formState.errors.amount.message}
          </TradingInputError>
        )}
        {account && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => {
                const amount = toBigNum(
                  account.balance,
                  account.asset.decimals
                ).toFixed(account.asset.decimals);
                form.setValue('amount', amount, { shouldValidate: true });
              }}
            >
              {t('Use maximum')}
            </FormSecondaryActionButton>
          </FormSecondaryActionWrapper>
        )}
      </FormGroup>
      <TradingButton
        type="submit"
        size="large"
        fill={true}
        intent={Intent.Secondary}
      >
        {t('Submit')}
      </TradingButton>
    </form>
  );
};

const useReadWithdrawalData = ({
  asset,
  configs,
}: {
  asset?: AssetFieldsFragment;
  configs: Configs;
}) => {
  const config = configs.find((c) => {
    if (
      asset?.source.__typename === 'ERC20' &&
      asset.source.chainId === c.chain_id
    ) {
      return true;
    }
    return false;
  });

  const assetChainId =
    asset?.source.__typename === 'ERC20' && asset.source.chainId;
  const assetAddress =
    asset?.source.__typename === 'ERC20' &&
    (asset.source.contractAddress as `0x${string}`);
  const bridgeAddress = config?.collateral_bridge_contract
    .address as `0x${string}`;

  const enabled = Boolean(assetAddress && bridgeAddress);

  const { data, ...queryResult } = useReadContracts({
    contracts: [
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'default_withdraw_delay',
        chainId: Number(assetChainId),
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'get_withdraw_threshold',
        args: [assetAddress],
        chainId: Number(assetChainId),
      },
    ],
    query: {
      enabled,
    },
  });

  return {
    ...queryResult,
    data: {
      delay: data && data[0].result?.toString(),
      threshold: data && data[1].result?.toString(),
    },
  };
};
