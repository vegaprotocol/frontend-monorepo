import {
  t,
  minSafe,
  maxSafe,
  required,
  vegaPublicKey,
  addDecimal,
  formatNumber,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Option,
  RichSelect,
  Select,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface FormFields {
  toAddress: string;
  asset: string;
  amount: string;
}

interface TransferFormProps {
  pubKey: string | null;
  pubKeys: string[] | null;
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
  }>;
  feeFactor: string | null;
}

export const TransferForm = ({
  pubKey,
  pubKeys,
  assets,
  feeFactor,
}: TransferFormProps) => {
  const [manualAddressEntry, setManualAddressEntry] = useState(false);
  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormFields>();

  const onSubmit = (fields: FormFields) => {
    console.log(fields);
  };

  const amount = watch('amount');
  const assetId = watch('asset');

  const asset = useMemo(() => {
    return assets.find((a) => a.id === assetId);
  }, [assets, assetId]);

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

  console.log(asset, max.toString());

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup label="From address" labelFor="from-address">
        <Input
          value={pubKey || ''}
          id="from-address"
          name="from-address"
          readOnly={true}
          disabled={true}
        />
      </FormGroup>
      <FormGroup label="To address" labelFor="to-address">
        {!manualAddressEntry && pubKeys?.length ? (
          <Select {...register('toAddress')}>
            {pubKeys
              .filter((pk) => pk !== pubKey)
              .map((pk) => (
                <option value={pk}>{pk}</option>
              ))}
          </Select>
        ) : (
          <Input
            {...register('toAddress', {
              validate: {
                required,
                vegaPublicKey,
              },
            })}
          />
        )}
        <button
          onClick={() => {
            setManualAddressEntry((curr) => !curr);
            if (!manualAddressEntry) {
              setValue('toAddress', '');
            }
          }}
          className="text-xs underline"
        >
          {manualAddressEntry ? t('Select from wallet') : t('Enter manually')}
        </button>
        {errors.toAddress?.message && (
          <InputError forInput="to-address">
            {errors.toAddress.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup label="Asset" labelFor="asset">
        <Controller
          control={control}
          name="asset"
          rules={{
            validate: {
              required,
            },
          }}
          render={({ field }) => (
            <RichSelect
              data-testid="select-asset"
              id={field.name}
              name={field.name}
              onValueChange={(value) => {
                field.onChange(value);
              }}
              placeholder={t('Please select')}
              value={field.value}
            >
              {assets.map((a) => (
                <Option key={a.id} value={a.id}>
                  <div className="text-left">
                    <div>{a.name}</div>
                    <div className="text-xs">
                      <span className="font-mono">
                        {formatNumber(a.balance, a.decimals)}
                      </span>{' '}
                      <span>{a.symbol}</span>
                    </div>
                  </div>
                </Option>
              ))}
            </RichSelect>
          )}
        />
        {errors.asset?.message && (
          <InputError forInput="asset">{errors.asset.message}</InputError>
        )}
      </FormGroup>
      <FormGroup label="Account type" labelFor="account-type">
        <Input
          id="account-type"
          name="account-type"
          readOnly={true}
          disabled={true}
          value={Schema.AccountType.ACCOUNT_TYPE_GENERAL}
        />
      </FormGroup>
      <FormGroup label="Amount" labelFor="amount">
        <Input
          type="number"
          {...register('amount', {
            validate: {
              required,
              minSafe: (value) => minSafe(new BigNumber(min))(value),
              maxSafe: (v) => {
                const value = new BigNumber(v);
                console.log(value.toString(), max.toString());
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
          <InputError forInput="amount">{errors.amount.message}</InputError>
        )}
      </FormGroup>
      <TransferFee amount={amount} feeFactor={feeFactor} />
      <Button type="submit" variant="primary" fill={true}>
        Confirm transfer
      </Button>
    </form>
  );
};

const TransferFee = ({
  amount,
  feeFactor,
}: {
  amount: string;
  feeFactor: string | null;
}) => {
  if (!feeFactor || !amount) return null;
  const value = new BigNumber(amount).times(feeFactor).toString();

  return <div>Transfer fee: {value.toString()}</div>;
};
