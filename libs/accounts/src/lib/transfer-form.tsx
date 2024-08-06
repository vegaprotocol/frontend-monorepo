import sortBy from 'lodash/sortBy';
import {
  useMaxSafe,
  useRequired,
  useVegaPublicKey,
  addDecimal,
  toBigNum,
  removeDecimal,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { useT } from './use-t';
import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  TradingRichSelect,
  TradingRichSelectOption,
  TradingSelect,
  Tooltip,
  TradingButton,
  truncateMiddle,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import type { Key, Transfer } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { AccountType, AccountTypeMapping } from '@vegaprotocol/types';
import { useTransferFeeQuery } from './__generated__/TransferFee';
import { normalizeTransfer } from './utils';
import { useWallet } from '@vegaprotocol/wallet-react';
import { EmblemByAsset } from '@vegaprotocol/emblem';

interface FormFields {
  toVegaKey: string;
  asset: string; // This is used to simply filter the from account list, the fromAccount type should be used in the tx
  amount: string;
  fromAccount: string; // AccountType-AssetId
}

export interface TransferFormProps {
  pubKey: string | undefined;
  pubKeys: Key[];
  isReadOnly?: boolean;
  accounts: Array<{
    type: AccountType;
    balance: string;
    asset: AssetFieldsFragment;
  }>;
  assetId?: string;
  minQuantumMultiple: string | null;
  submitTransfer: (transfer: Transfer) => void;
}

export const TransferForm = ({
  pubKey,
  pubKeys,
  isReadOnly,
  assetId: initialAssetId,
  submitTransfer,
  accounts,
  minQuantumMultiple,
}: TransferFormProps) => {
  const t = useT();
  const maxSafe = useMaxSafe();
  const required = useRequired();
  const vegaPublicKey = useVegaPublicKey();
  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      asset: initialAssetId,
      toVegaKey: pubKey || '',
    },
  });

  const [toVegaKeyMode, setToVegaKeyMode] = useState<ToVegaKeyMode>('select');

  const assets = sortBy(
    accounts
      .filter(
        (a) =>
          a.type === AccountType.ACCOUNT_TYPE_GENERAL ||
          a.type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS
      )
      // Sum the general and vested account balances so the value shown in the asset
      // dropdown is correct for all transferable accounts
      .reduce((merged, account) => {
        const existing = merged.findIndex(
          (m) => m.asset.id === account.asset.id
        );
        if (existing > -1) {
          const balance = new BigNumber(merged[existing].balance)
            .plus(new BigNumber(account.balance))
            .toString();
          merged[existing] = { ...merged[existing], balance };
          return merged;
        }
        return [...merged, account];
      }, [] as typeof accounts)
      .map((account) => ({
        key: account.asset.id,
        ...account.asset,
        balance: addDecimal(account.balance, account.asset.decimals),
      })),
    (a) => a.symbol.toLowerCase()
  );

  const selectedPubKey = watch('toVegaKey');
  const amount = watch('amount');
  const fromAccount = watch('fromAccount');
  const selectedAssetId = watch('asset');

  // Convert the account type (Type-AssetId) into separate values
  const [accountType, accountAssetId] = fromAccount
    ? parseFromAccount(fromAccount)
    : [undefined, undefined];
  const fromVested = accountType === AccountType.ACCOUNT_TYPE_VESTED_REWARDS;
  const asset = assets.find((a) => a.id === accountAssetId);

  const account = accounts.find(
    (a) => a.asset.id === accountAssetId && a.type === accountType
  );
  const accountBalance =
    account && addDecimal(account.balance, account.asset.decimals);

  // Max amount given selected asset and from account
  const max = accountBalance ? new BigNumber(accountBalance) : new BigNumber(0);
  const normalizedAmount =
    (amount && asset && removeDecimal(amount, asset.decimals)) || '0';

  const transferFeeQuery = useTransferFeeQuery({
    variables: {
      fromAccount: pubKey || '',
      fromAccountType: accountType || AccountType.ACCOUNT_TYPE_GENERAL,
      amount: normalizedAmount,
      assetId: asset?.id || '',
      toAccount: selectedPubKey,
    },
    skip: !pubKey || !amount || !asset || !selectedPubKey || fromVested,
  });
  const transferFee = transferFeeQuery.loading
    ? transferFeeQuery.data || transferFeeQuery.previousData
    : transferFeeQuery.data;

  const onSubmit = useCallback(
    (fields: FormFields) => {
      if (!amount) {
        throw new Error('Submitted transfer with no amount selected');
      }

      const [type, assetId] = parseFromAccount(fields.fromAccount);
      const asset = assets.find((a) => a.id === assetId);

      if (!asset) {
        throw new Error('Submitted transfer with no asset selected');
      }

      const transfer = normalizeTransfer(
        fields.toVegaKey,
        amount,
        type,
        AccountType.ACCOUNT_TYPE_GENERAL, // field is readonly in the form
        {
          id: asset.id,
          decimals: asset.decimals,
        }
      );
      submitTransfer(transfer);
    },
    [submitTransfer, amount, assets]
  );

  // reset for placeholder workaround https://github.com/radix-ui/primitives/issues/1569
  useEffect(() => {
    if (!pubKey) {
      setValue('asset', '');
    }
  }, [setValue, pubKey]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="text-sm"
      data-testid="transfer-form"
    >
      <TradingFormGroup label={t('Asset')} labelFor="asset">
        <Controller
          control={control}
          name="asset"
          render={({ field }) => {
            if (assets.length <= 0) {
              return (
                <span
                  data-testid="no-assets-available"
                  className="text-xs text-vega-clight-100 dark:text-vega-cdark-100"
                >
                  {t('No assets available')}
                </span>
              );
            }

            return (
              <TradingRichSelect
                data-testid="select-asset"
                id={field.name}
                name={field.name}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('fromAccount', '');
                }}
                placeholder={t('Please select an asset')}
                value={field.value}
              >
                {assets.map((a) => (
                  <TradingRichSelectOption key={a.key} value={a.id}>
                    <AssetOption asset={a} />
                  </TradingRichSelectOption>
                ))}
              </TradingRichSelect>
            );
          }}
        />
        {errors.asset?.message && (
          <TradingInputError forInput="asset">
            {errors.asset.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('From account')} labelFor="fromAccount">
        <Controller
          control={control}
          name="fromAccount"
          rules={{
            validate: {
              required,
              sameAccount: (value) => {
                if (
                  pubKey === selectedPubKey &&
                  value === AccountType.ACCOUNT_TYPE_GENERAL
                ) {
                  return t(
                    'Cannot transfer to the same account type for the connected key'
                  );
                }
                return true;
              },
            },
          }}
          render={({ field }) =>
            accounts.length > 0 ? (
              <TradingSelect
                id="fromAccount"
                defaultValue=""
                {...field}
                onChange={(e) => {
                  field.onChange(e);

                  const [type] = parseFromAccount(e.target.value);

                  // Enforce that if transferring from a vested rewards account it must go to
                  // the current connected general account
                  if (
                    type === AccountType.ACCOUNT_TYPE_VESTED_REWARDS &&
                    pubKey
                  ) {
                    setValue('toVegaKey', pubKey);
                    setToVegaKeyMode('select');
                  }
                }}
              >
                <option value="" disabled={true}>
                  {t('Please select')}
                </option>
                {accounts
                  .filter((a) => {
                    if (!selectedAssetId) return true;
                    return selectedAssetId === a.asset.id;
                  })
                  .map((a) => {
                    const id = `${a.type}-${a.asset.id}`;
                    return (
                      <option value={id} key={id}>
                        {AccountTypeMapping[a.type]} (
                        {addDecimal(a.balance, a.asset.decimals)}{' '}
                        {a.asset.symbol})
                      </option>
                    );
                  })}
              </TradingSelect>
            ) : (
              <span
                data-testid="no-accounts-available"
                className="text-xs text-vega-clight-100 dark:text-vega-cdark-100"
              >
                {t('No accounts available')}
              </span>
            )
          }
        />
        {errors.fromAccount?.message && (
          <TradingInputError forInput="fromAccount">
            {errors.fromAccount.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('To Vega key')} labelFor="toVegaKey">
        <AddressField
          onChange={() => {
            setValue('toVegaKey', '');
            setToVegaKeyMode((curr) => (curr === 'input' ? 'select' : 'input'));
          }}
          mode={toVegaKeyMode}
          select={
            <TradingSelect
              {...register('toVegaKey')}
              disabled={fromVested}
              id="toVegaKey"
            >
              <option value="" disabled={true}>
                {t('Please select')}
              </option>
              {pubKeys?.map(({ publicKey: pk, name }) => {
                const alias = name || '';
                const text =
                  pk === pubKey
                    ? t('Current key: {{pubKey}}', { pubKey: pk })
                    : pk;

                return (
                  <option key={pk} value={pk}>
                    {alias ? `${alias}: ${text}` : text}
                  </option>
                );
              })}
            </TradingSelect>
          }
          input={
            fromVested ? null : (
              <TradingInput
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true} // focus input immediately after is shown
                id="toVegaKey"
                type="text"
                disabled={fromVested}
                {...register('toVegaKey', {
                  validate: {
                    required,
                    vegaPublicKey,
                  },
                })}
              />
            )
          }
        />
        {errors.toVegaKey?.message && (
          <TradingInputError forInput="toVegaKey">
            {errors.toVegaKey.message}
          </TradingInputError>
        )}
        {toVegaKeyMode === 'input' &&
          selectedPubKey &&
          !pubKeys?.map((p) => p.publicKey).includes(selectedPubKey) && (
            <TradingInputError forInput="toVegaKey" intent="warning">
              {t('You do not own this Vega public key')}
            </TradingInputError>
          )}
      </TradingFormGroup>
      <TradingFormGroup label={t('Amount')} labelFor="amount">
        <TradingInput
          id="amount"
          autoComplete="off"
          appendElement={
            asset && <span className="text-xs">{asset.symbol}</span>
          }
          {...register('amount', {
            validate: {
              required,
              minSafe: (v) => {
                if (!asset || !minQuantumMultiple) return true;

                const value = new BigNumber(v);

                if (value.isZero()) {
                  return t('Amount cannot be 0');
                }

                const minByQuantumMultiple = toBigNum(
                  minQuantumMultiple,
                  asset.decimals
                );

                if (fromVested) {
                  // special conditions which let you bypass min transfer rules set by quantum multiple
                  if (value.isGreaterThanOrEqualTo(max)) {
                    return true;
                  }

                  if (value.isLessThan(minByQuantumMultiple)) {
                    return t(
                      'Amount below minimum requirements for partial transfer. Use max to bypass'
                    );
                  }

                  return true;
                } else {
                  if (value.isLessThan(minByQuantumMultiple)) {
                    return t(
                      'Amount below minimum requirement set by transfer.minTransferQuantumMultiple'
                    );
                  }
                }

                return true;
              },
              maxSafe: (v) => {
                const value = new BigNumber(v);
                if (value.isGreaterThan(max)) {
                  return t('You cannot transfer more than available');
                }
                return maxSafe(max)(v);
              },
            },
          })}
        />
        {accountBalance && (
          <button
            type="button"
            className="absolute right-0 top-0 ml-auto text-xs underline"
            onClick={() =>
              setValue('amount', accountBalance, {
                shouldValidate: true,
              })
            }
            data-testid="use-max-button"
          >
            {t('Use max')}
          </button>
        )}
        {errors.amount?.message && (
          <TradingInputError forInput="amount">
            {errors.amount.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      {(transferFee?.estimateTransferFee || fromVested) && amount && asset && (
        <TransferFee
          amount={normalizedAmount}
          fee={fromVested ? '0' : transferFee?.estimateTransferFee?.fee}
          discount={
            fromVested ? '0' : transferFee?.estimateTransferFee?.discount
          }
          decimals={asset.decimals}
        />
      )}
      <TradingButton
        type="submit"
        fill={true}
        disabled={isReadOnly}
        intent={Intent.Secondary}
        size="large"
      >
        {t('Transfer')}
      </TradingButton>
    </form>
  );
};

export const TransferFee = ({
  amount,
  fee,
  discount,
  decimals,
}: {
  amount: string;
  fee?: string;
  discount?: string;
  decimals: number;
}) => {
  const t = useT();
  if (!amount || !fee) return null;
  if (isNaN(Number(amount)) || isNaN(Number(fee))) {
    return null;
  }

  const totalValue = (
    BigInt(amount) +
    BigInt(fee) -
    BigInt(discount || '0')
  ).toString();

  return (
    <div className="mb-4 flex flex-col gap-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div>{t('Transfer fee')}</div>
        <div data-testid="transfer-fee" className="text-muted">
          {addDecimalsFormatNumber(fee, decimals)}
        </div>
      </div>
      {discount && discount !== '0' && (
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div>{t('Discount')}</div>
          <div data-testid="discount" className="text-muted">
            {addDecimalsFormatNumber(discount, decimals)}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-1">
        <Tooltip
          description={t(
            `The total amount to be transferred (without the fee)`
          )}
        >
          <div>{t('Amount to be transferred')}</div>
        </Tooltip>

        <div data-testid="transfer-amount" className="text-muted">
          {addDecimalsFormatNumber(amount, decimals)}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <Tooltip
          description={t(
            `The total amount taken from your account. The amount to be transferred plus the fee.`
          )}
        >
          <div>{t('Total amount (with fee)')}</div>
        </Tooltip>

        <div data-testid="total-transfer-fee" className="text-muted">
          {addDecimalsFormatNumber(totalValue, decimals)}
        </div>
      </div>
    </div>
  );
};

type ToVegaKeyMode = 'input' | 'select';

interface AddressInputProps {
  select: ReactNode;
  input: ReactNode;
  mode: ToVegaKeyMode;
  onChange: () => void;
}

export const AddressField = ({
  select,
  input,
  mode,
  onChange,
}: AddressInputProps) => {
  const t = useT();
  const isInput = mode === 'input';
  return (
    <>
      {isInput ? input : select}
      {select && input && (
        <button
          type="button"
          onClick={onChange}
          className="absolute right-0 top-0 ml-auto text-xs underline"
        >
          {isInput ? t('Select from wallet') : t('Enter manually')}
        </button>
      )}
    </>
  );
};

const parseFromAccount = (fromAccountStr: string) => {
  return fromAccountStr.split('-') as [AccountType, string];
};

const AssetOption = ({
  asset,
}: {
  asset: AssetFieldsFragment & { balance: string };
}) => {
  const vegaChainId = useWallet((store) => store.chainId);

  return (
    <div className="w-full flex items-center gap-2 h-10">
      <EmblemByAsset asset={asset.id} vegaChain={vegaChainId} />
      <div className="text-sm text-left leading-4">
        <div>
          {asset.name} | {asset.symbol}
        </div>
        <div className="text-secondary text-xs">
          {asset.source.__typename === 'ERC20'
            ? truncateMiddle(asset.source.contractAddress)
            : asset.source.__typename}
        </div>
      </div>
      <div className="ml-auto text-sm">{asset.balance}</div>
    </div>
  );
};
