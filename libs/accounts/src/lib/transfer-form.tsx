import {
  minSafe,
  maxSafe,
  required,
  vegaPublicKey,
  addDecimal,
  formatNumber,
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
  toAddress: string;
  asset: string;
  amount: string;
  fromAccount: AccountType;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
}

interface TransferFormProps {
  pubKey: string | null;
  pubKeys: string[] | null;
  assets: Array<Asset>;
  accounts: Array<{
    type: AccountType;
    asset: { id: string; symbol: string };
  }>;
  assetId?: string;
  feeFactor: string | null;
  submitTransfer: (transfer: Transfer) => void;
}

export const TransferForm = ({
  pubKey,
  pubKeys,
  assets,
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
    },
  });

  const selectedPubKey = watch('toAddress');
  const amount = watch('amount');
  const assetId = watch('asset');

  const [includeFee, setIncludeFee] = useState(false);

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

  const asset = useMemo(() => {
    return assets.find((a) => a.id === assetId);
  }, [assets, assetId]);

  const onSubmit = useCallback(
    (fields: FormFields) => {
      if (!asset) {
        throw new Error('Submitted transfer with no asset selected');
      }
      if (!transferAmount) {
        throw new Error('Submitted transfer with no amount selected');
      }
      const transfer = normalizeTransfer(
        fields.toAddress,
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

  const min = useMemo(() => {
    // Min viable amount given asset decimals EG for WEI 0.000000000000000001
    const minViableAmount = asset
      ? new BigNumber(addDecimal('1', asset.decimals))
      : new BigNumber(0);
    return minViableAmount;
  }, [asset]);

  const max = useMemo(() => {
    const maxAmount = asset ? new BigNumber(asset.balance) : new BigNumber(0);
    return maxAmount;
  }, [asset]);

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
      <TradingFormGroup label="Vega key" labelFor="toAddress">
        <AddressField
          pubKeys={pubKeys}
          onChange={() => setValue('toAddress', '')}
          select={
            <TradingSelect
              {...register('toAddress')}
              id="toAddress"
              defaultValue=""
            >
              <option value="" disabled={true}>
                {t('Please select')}
              </option>
              {pubKeys?.length &&
                pubKeys.map((pk) => {
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
              id="toAddress"
              type="text"
              {...register('toAddress', {
                validate: {
                  required,
                  vegaPublicKey,
                },
              })}
            />
          }
        />
        {errors.toAddress?.message && (
          <TradingInputError forInput="toAddress">
            {errors.toAddress.message}
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
                  return t('Cannot transfer to the same account');
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
                  {AccountTypeMapping[a.type]} ({a.asset.symbol})
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
            {asset
              ? `${AccountTypeMapping[AccountType.ACCOUNT_TYPE_GENERAL]} (${
                  asset.symbol
                })`
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
                  return t(
                    'You cannot transfer more than your available collateral'
                  );
                }
                return maxSafe(max)(v);
              },
            },
          })}
        />
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
  pubKeys: string[] | null;
  select: ReactNode;
  input: ReactNode;
  onChange: () => void;
}

export const AddressField = ({
  pubKeys,
  select,
  input,
  onChange,
}: AddressInputProps) => {
  const [isInput, setIsInput] = useState(() => {
    if (pubKeys && pubKeys.length <= 1) {
      return true;
    }
    return false;
  });

  return (
    <>
      {isInput ? input : select}
      {pubKeys && pubKeys.length > 1 && (
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
      )}
    </>
  );
};
