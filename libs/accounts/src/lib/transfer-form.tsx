import sortBy from 'lodash/sortBy';
import {
  minSafe,
  maxSafe,
  required,
  vegaPublicKey,
  addDecimal,
  formatNumber,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  TradingRichSelect,
  TradingSelect,
  Tooltip,
  TradingCheckbox,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';
import type { Transfer } from '@vegaprotocol/wallet';
import { normalizeTransfer } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AssetOption, Balance } from '@vegaprotocol/assets';
import { AccountType, AccountTypeMapping } from '@vegaprotocol/types';

interface FormFields {
  toVegaKey: string;
  asset: string;
  amount: string;
  fromAccount: AccountType;
}

interface TransferFormProps {
  pubKey: string | null;
  pubKeys: string[] | null;
  accounts: Array<{
    type: AccountType;
    balance: string;
    asset: { id: string; symbol: string; name: string; decimals: number };
  }>;
  assetId?: string;
  feeFactor: string | null;
  submitTransfer: (transfer: Transfer) => void;
}

export const TransferForm = ({
  pubKey,
  pubKeys,
  assetId: initialAssetId,
  feeFactor,
  submitTransfer,
  accounts,
}: TransferFormProps) => {
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

  const assets = sortBy(
    accounts
      .filter((a) => a.type === AccountType.ACCOUNT_TYPE_GENERAL)
      .map((account) => ({
        ...account.asset,
        balance: addDecimal(account.balance, account.asset.decimals),
      })),
    'name'
  );

  const selectedPubKey = watch('toVegaKey');
  const amount = watch('amount');
  const fromAccount = watch('fromAccount');
  const assetId = watch('asset');

  const asset = assets.find((a) => a.id === assetId);

  const account = accounts.find(
    (a) => a.asset.id === assetId && a.type === fromAccount
  );
  const accountBalance =
    account && addDecimal(account.balance, account.asset.decimals);

  // General account for the selected asset
  const generalAccount = accounts.find((a) => {
    return (
      a.asset.id === assetId && a.type === AccountType.ACCOUNT_TYPE_GENERAL
    );
  });

  const [includeFee, setIncludeFee] = useState(false);

  // Min viable amount given asset decimals EG for WEI 0.000000000000000001
  const min = asset
    ? new BigNumber(addDecimal('1', asset.decimals))
    : new BigNumber(0);

  // Max amount given selected asset and from account
  const max = accountBalance ? new BigNumber(accountBalance) : new BigNumber(0);

  const transferAmount = useMemo(() => {
    if (!amount) return undefined;
    if (includeFee && feeFactor) {
      return new BigNumber(1).minus(feeFactor).times(amount).toString();
    }
    return amount;
  }, [amount, includeFee, feeFactor]);

  const fee = useMemo(() => {
    if (!transferAmount) return undefined;
    if (includeFee) {
      return new BigNumber(amount).minus(transferAmount).toString();
    }
    return (
      feeFactor && new BigNumber(feeFactor).times(transferAmount).toString()
    );
  }, [amount, includeFee, transferAmount, feeFactor]);

  const onSubmit = useCallback(
    (fields: FormFields) => {
      if (!asset) {
        throw new Error('Submitted transfer with no asset selected');
      }
      if (!transferAmount) {
        throw new Error('Submitted transfer with no amount selected');
      }
      const transfer = normalizeTransfer(
        fields.toVegaKey,
        transferAmount,
        fields.fromAccount,
        AccountType.ACCOUNT_TYPE_GENERAL, // field is readonly in the form
        {
          id: asset.id,
          decimals: asset.decimals,
        }
      );
      submitTransfer(transfer);
    },
    [asset, submitTransfer, transferAmount]
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
      <TradingFormGroup label="To Vega key" labelFor="toVegaKey">
        <AddressField
          onChange={() => setValue('toVegaKey', '')}
          select={
            <TradingSelect {...register('toVegaKey')} id="toVegaKey">
              <option value="" disabled={true}>
                {t('Please select')}
              </option>
              {pubKeys?.map((pk) => {
                const text = pk === pubKey ? t('Current key: ') + pk : pk;

                return (
                  <option key={pk} value={pk}>
                    {text}
                  </option>
                );
              })}
            </TradingSelect>
          }
          input={
            <TradingInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true} // focus input immediately after is shown
              id="toVegaKey"
              type="text"
              {...register('toVegaKey', {
                validate: {
                  required,
                  vegaPublicKey,
                },
              })}
            />
          }
        />
        {errors.toVegaKey?.message && (
          <TradingInputError forInput="toVegaKey">
            {errors.toVegaKey.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('Asset')} labelFor="asset">
        <Controller
          control={control}
          name="asset"
          rules={{
            validate: {
              required,
            },
          }}
          render={({ field }) => (
            <TradingRichSelect
              data-testid="select-asset"
              id={field.name}
              name={field.name}
              onValueChange={(value) => {
                field.onChange(value);
              }}
              placeholder={t('Please select an asset')}
              value={field.value}
            >
              {assets.map((a) => (
                <AssetOption
                  key={a.id}
                  asset={a}
                  balance={
                    <Balance
                      balance={formatNumber(a.balance, a.decimals)}
                      symbol={a.symbol}
                    />
                  }
                />
              ))}
            </TradingRichSelect>
          )}
        />
        {errors.asset?.message && (
          <TradingInputError forInput="asset">
            {errors.asset.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('From account')} labelFor="fromAccount">
        <TradingSelect
          id="fromAccount"
          defaultValue=""
          {...register('fromAccount', {
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
          })}
        >
          <option value="" disabled={true}>
            {t('Please select')}
          </option>
          {accounts
            .filter((a) => {
              if (!assetId) return true;
              return assetId === a.asset.id;
            })
            .map((a) => {
              return (
                <option value={a.type} key={`${a.type}-${a.asset.id}`}>
                  {AccountTypeMapping[a.type]} (
                  {addDecimalsFormatNumber(a.balance, a.asset.decimals)}{' '}
                  {a.asset.symbol})
                </option>
              );
            })}
        </TradingSelect>
        {errors.fromAccount?.message && (
          <TradingInputError forInput="fromAccount">
            {errors.fromAccount.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('To account')} labelFor="toAccount">
        <TradingSelect
          id="toAccount"
          defaultValue={AccountType.ACCOUNT_TYPE_GENERAL}
        >
          <option value={AccountType.ACCOUNT_TYPE_GENERAL}>
            {generalAccount
              ? `${
                  AccountTypeMapping[AccountType.ACCOUNT_TYPE_GENERAL]
                } (${addDecimalsFormatNumber(
                  generalAccount.balance,
                  generalAccount.asset.decimals
                )} ${generalAccount.asset.symbol})`
              : AccountTypeMapping[AccountType.ACCOUNT_TYPE_GENERAL]}
          </option>
        </TradingSelect>
      </TradingFormGroup>
      <TradingFormGroup label="Amount" labelFor="amount">
        <TradingInput
          id="amount"
          autoComplete="off"
          appendElement={
            asset && <span className="text-xs">{asset.symbol}</span>
          }
          {...register('amount', {
            validate: {
              required,
              minSafe: (value) => minSafe(new BigNumber(min))(value),
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
            className="absolute top-0 right-0 ml-auto text-xs underline"
            onClick={() =>
              setValue('amount', parseFloat(accountBalance).toString())
            }
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
      <div className="mb-4">
        <Tooltip
          description={t(
            `The fee will be taken from the amount you are transferring.`
          )}
        >
          <div>
            <TradingCheckbox
              name="include-transfer-fee"
              disabled={!transferAmount}
              label={t('Include transfer fee')}
              checked={includeFee}
              onCheckedChange={() => setIncludeFee(!includeFee)}
            />
          </div>
        </Tooltip>
      </div>
      {transferAmount && fee && (
        <TransferFee
          amount={transferAmount}
          transferAmount={transferAmount}
          feeFactor={feeFactor}
          fee={fee}
          decimals={asset?.decimals}
        />
      )}
      <TradingButton type="submit" fill={true}>
        {t('Confirm transfer')}
      </TradingButton>
    </form>
  );
};

export const TransferFee = ({
  amount,
  transferAmount,
  feeFactor,
  fee,
  decimals,
}: {
  amount: string;
  transferAmount: string;
  feeFactor: string | null;
  fee?: string;
  decimals?: number;
}) => {
  if (!feeFactor || !amount || !transferAmount || !fee) return null;
  if (
    isNaN(Number(feeFactor)) ||
    isNaN(Number(amount)) ||
    isNaN(Number(transferAmount)) ||
    isNaN(Number(fee))
  ) {
    return null;
  }

  const totalValue = new BigNumber(transferAmount).plus(fee).toString();

  return (
    <div className="flex flex-col mb-4 text-xs gap-2">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <Tooltip
          description={t(
            `The transfer fee is set by the network parameter transfer.fee.factor, currently set to %s`,
            [feeFactor]
          )}
        >
          <div>{t('Transfer fee')}</div>
        </Tooltip>

        <div data-testid="transfer-fee" className="text-muted">
          {formatNumber(fee, decimals)}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <Tooltip
          description={t(
            `The total amount to be transferred (without the fee)`
          )}
        >
          <div>{t('Amount to be transferred')}</div>
        </Tooltip>

        <div data-testid="transfer-amount" className="text-muted">
          {formatNumber(amount, decimals)}
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
          {formatNumber(totalValue, decimals)}
        </div>
      </div>
    </div>
  );
};

interface AddressInputProps {
  select: ReactNode;
  input: ReactNode;
  onChange: () => void;
}

export const AddressField = ({
  select,
  input,
  onChange,
}: AddressInputProps) => {
  const [isInput, setIsInput] = useState(false);

  return (
    <>
      {isInput ? input : select}
      <button
        type="button"
        onClick={() => {
          setIsInput((curr) => !curr);
          onChange();
        }}
        className="absolute top-0 right-0 ml-auto text-xs underline"
      >
        {isInput ? t('Select from wallet') : t('Enter manually')}
      </button>
    </>
  );
};
