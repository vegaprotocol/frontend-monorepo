import type { Asset } from '@vegaprotocol/assets';
import {
  ethereumAddress,
  minSafe,
  t,
  removeDecimal,
  required,
} from '@vegaprotocol/react-helpers';
import { isAssetTypeERC20 } from '@vegaprotocol/assets';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawLimits } from './withdraw-limits';
import { useWeb3ConnectDialog } from '@vegaprotocol/web3';

interface FormFields {
  asset: string;
  to: string;
  amount: string;
}

export interface WithdrawFormProps {
  assets: Asset[];
  min: BigNumber;
  balance: BigNumber;
  selectedAsset?: Asset;
  threshold: BigNumber;
  delay: number | undefined;
  onSelectAsset: (assetId: string) => void;
  submitWithdraw: (withdrawal: WithdrawalArgs) => void;
}

export const WithdrawForm = ({
  assets,
  balance,
  min,
  selectedAsset,
  threshold,
  delay,
  onSelectAsset,
  submitWithdraw,
}: WithdrawFormProps) => {
  const { account: address } = useWeb3React();
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      asset: selectedAsset?.id || '',
      to: address,
    },
  });

  const amount = useWatch({ name: 'amount', control });

  const onSubmit = async (fields: FormFields) => {
    if (!selectedAsset) {
      throw new Error('Asset not selected');
    }
    submitWithdraw({
      asset: selectedAsset.id,
      amount: removeDecimal(fields.amount, selectedAsset.decimals),
      receiverAddress: fields.to,
      availableTimestamp:
        new BigNumber(fields.amount).isGreaterThan(threshold) && delay
          ? Date.now() + delay * 1000
          : null,
    });
  };

  return (
    <>
      <div className="mb-4 text-sm">
        <p>{t('There are two steps required to make a withdrawal')}</p>
        <ol className="list-disc pl-4">
          <li>{t('Step 1 - Release funds from Vega')}</li>
          <li>{t('Step 2 - Transfer funds to your Ethereum wallet')}</li>
        </ol>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate={true}
        data-testid="withdraw-form"
      >
        <FormGroup label={t('Asset')} labelFor="asset">
          <Controller
            control={control}
            name="asset"
            rules={{
              validate: {
                required: (value) => !!selectedAsset || required(value),
              },
            }}
            render={({ field }) => (
              <Select
                {...field}
                onChange={(e) => {
                  onSelectAsset(e.target.value);
                  field.onChange(e.target.value);
                }}
                value={selectedAsset?.id || ''}
                id="asset"
                name="asset"
                required
                data-testid="select-asset"
              >
                <option value="">{t('Please select')}</option>
                {assets.filter(isAssetTypeERC20).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.asset?.message && (
            <InputError intent="danger">{errors.asset.message}</InputError>
          )}
        </FormGroup>
        <FormGroup
          label={t('To (Ethereum address)')}
          labelFor="ethereum-address"
        >
          <EthereumButton
            clearAddress={() => {
              setValue('to', '');
              clearErrors('to');
            }}
          />
          <Input
            id="ethereum-address"
            data-testid="eth-address-input"
            {...register('to', { validate: { required, ethereumAddress } })}
          />
          {errors.to?.message && (
            <InputError intent="danger">{errors.to.message}</InputError>
          )}
        </FormGroup>
        {selectedAsset && threshold && (
          <div className="mb-4">
            <WithdrawLimits
              amount={amount}
              threshold={threshold}
              delay={delay}
              balance={balance}
              asset={selectedAsset}
            />
          </div>
        )}
        <FormGroup label={t('Amount')} labelFor="amount">
          <Input
            data-testid="amount-input"
            type="number"
            autoComplete="off"
            id="amount"
            {...register('amount', {
              validate: {
                required,
                maxSafe: (v) => {
                  const value = new BigNumber(v);
                  if (value.isGreaterThan(balance)) {
                    return t('Insufficient amount in account');
                  }
                  return true;
                },
                minSafe: (value) => minSafe(min)(value),
              },
            })}
          />
          {errors.amount?.message && (
            <InputError intent="danger">{errors.amount.message}</InputError>
          )}
          {selectedAsset && (
            <UseButton
              data-testid="use-maximum"
              onClick={() => {
                setValue('amount', balance.toFixed(selectedAsset.decimals));
                clearErrors('amount');
              }}
            >
              {t('Use maximum')}
            </UseButton>
          )}
        </FormGroup>
        <Button data-testid="submit-withdrawal" type="submit" variant="primary">
          Release funds
        </Button>
      </form>
    </>
  );
};

interface UseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const UseButton = ({ children, ...rest }: UseButtonProps) => {
  return (
    <button
      {...rest}
      type="button"
      className="ml-auto text-sm absolute top-0 right-0 underline"
    >
      {children}
    </button>
  );
};

const EthereumButton = ({ clearAddress }: { clearAddress: () => void }) => {
  const openDialog = useWeb3ConnectDialog((state) => state.open);
  const { isActive, connector } = useWeb3React();

  if (!isActive) {
    return <UseButton onClick={openDialog}>{t('Connect')}</UseButton>;
  }

  return (
    <UseButton
      onClick={() => {
        connector.deactivate();
        clearAddress();
      }}
      data-testid="disconnect-ethereum-wallet"
    >
      {t('Disconnect')}
    </UseButton>
  );
};
