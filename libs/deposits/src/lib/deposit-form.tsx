import type { Asset } from '@vegaprotocol/assets';
import { isAssetTypeERC20 } from '@vegaprotocol/assets';
import {
  ethereumAddress,
  t,
  required,
  vegaPublicKey,
  minSafe,
  maxSafe,
  addDecimal,
} from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Icon,
  Input,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import { Web3WalletInput } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { DepositLimits } from './deposit-limits';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

interface FormFields {
  asset: string;
  from: string;
  to: string;
  amount: string;
}

export interface DepositFormProps {
  assets: Asset[];
  selectedAsset?: Asset;
  onSelectAsset: (assetId: string) => void;
  balance: BigNumber | undefined;
  submitApprove: () => void;
  submitDeposit: (args: {
    assetSource: string;
    amount: string;
    vegaPublicKey: string;
  }) => void;
  requestFaucet: () => void;
  max: BigNumber | undefined;
  deposited: BigNumber | undefined;
  allowance: BigNumber | undefined;
  isFaucetable?: boolean;
}

export const DepositForm = ({
  assets,
  selectedAsset,
  onSelectAsset,
  balance,
  max,
  deposited,
  submitApprove,
  submitDeposit,
  requestFaucet,
  allowance,
  isFaucetable,
}: DepositFormProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const { account } = useWeb3React();
  const { pubKey } = useVegaWallet();
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      from: account,
      to: pubKey ? pubKey : undefined,
      asset: selectedAsset?.id || '',
    },
  });

  const onDeposit = async (fields: FormFields) => {
    if (!selectedAsset || selectedAsset.source.__typename !== 'ERC20') {
      throw new Error('Invalid asset');
    }

    submitDeposit({
      assetSource: selectedAsset.source.contractAddress,
      amount: fields.amount,
      vegaPublicKey: fields.to,
    });
  };

  const amount = useWatch({ name: 'amount', control });

  const maxAmount = useMemo(() => {
    const maxApproved = allowance ? allowance : new BigNumber(0);
    const maxAvailable = balance ? balance : new BigNumber(0);

    // limits.max is a lifetime deposit limit, so the actual max value for form
    // input is the max minus whats already been deposited
    let maxLimit = new BigNumber(Infinity);

    // A max limit of zero indicates that there is no limit
    if (max && deposited && max.isGreaterThan(0)) {
      maxLimit = max.minus(deposited);
    }

    return {
      approved: maxApproved,
      available: maxAvailable,
      limit: maxLimit,
      amount: BigNumber.minimum(maxLimit, maxApproved, maxAvailable),
    };
  }, [max, deposited, allowance, balance]);

  const min = useMemo(() => {
    // Min viable amount given asset decimals EG for WEI 0.000000000000000001
    const minViableAmount = selectedAsset
      ? new BigNumber(addDecimal('1', selectedAsset.decimals))
      : new BigNumber(0);

    return minViableAmount;
  }, [selectedAsset]);

  return (
    <form
      onSubmit={handleSubmit(onDeposit)}
      noValidate={true}
      data-testid="deposit-form"
    >
      <FormGroup
        label={t('From (Ethereum address)')}
        labelFor="ethereum-address"
      >
        <Web3WalletInput
          inputProps={{
            id: 'ethereum-address',
            ...register('from', { validate: { required, ethereumAddress } }),
          }}
        />
        {errors.from?.message && (
          <InputError intent="danger">{errors.from.message}</InputError>
        )}
      </FormGroup>
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
              id="asset"
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onSelectAsset(e.target.value);
              }}
              value={selectedAsset?.id || ''}
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
          <InputError intent="danger" forInput="asset">
            {errors.asset.message}
          </InputError>
        )}
        {isFaucetable && selectedAsset && (
          <UseButton onClick={requestFaucet}>
            {t(`Get ${selectedAsset.symbol}`)}
          </UseButton>
        )}
        {!errors.asset?.message && selectedAsset && (
          <button
            data-testid="view-asset-details"
            className="text-sm underline"
            onClick={(e) => {
              openAssetDetailsDialog(selectedAsset, e.target as HTMLElement);
            }}
          >
            {t('View asset details')}
          </button>
        )}
      </FormGroup>
      <FormGroup label={t('To (Vega key)')} labelFor="to">
        <Input
          {...register('to', { validate: { required, vegaPublicKey } })}
          id="to"
        />
        {errors.to?.message && (
          <InputError intent="danger" forInput="to">
            {errors.to.message}
          </InputError>
        )}
        {pubKey && (
          <UseButton
            onClick={() => {
              setValue('to', pubKey);
              clearErrors('to');
            }}
          >
            {t('Use connected')}
          </UseButton>
        )}
      </FormGroup>
      {selectedAsset && max && deposited && (
        <div className="mb-6">
          <DepositLimits max={max} deposited={deposited} balance={balance} />
        </div>
      )}
      <FormGroup label={t('Amount')} labelFor="amount">
        <Input
          type="number"
          autoComplete="off"
          id="amount"
          {...register('amount', {
            validate: {
              required,
              minSafe: (value) => minSafe(new BigNumber(min))(value),
              maxSafe: (v) => {
                const value = new BigNumber(v);
                if (value.isGreaterThan(maxAmount.available)) {
                  return t('Insufficient amount in Ethereum wallet');
                } else if (value.isGreaterThan(maxAmount.limit)) {
                  return t('Amount is above temporary deposit limit');
                } else if (value.isGreaterThan(maxAmount.approved)) {
                  return t('Amount is above approved amount');
                }
                return maxSafe(maxAmount.amount)(v);
              },
            },
          })}
        />
        {errors.amount?.message && (
          <InputError intent="danger" forInput="amount">
            {errors.amount.message}
          </InputError>
        )}
        {selectedAsset && balance && (
          <UseButton
            onClick={() => {
              setValue('amount', balance.toFixed(selectedAsset.decimals));
              clearErrors('amount');
            }}
          >
            {t('Use maximum')}
          </UseButton>
        )}
      </FormGroup>
      <FormButton
        selectedAsset={selectedAsset}
        amount={new BigNumber(amount || 0)}
        allowance={allowance}
        onApproveClick={submitApprove}
      />
    </form>
  );
};

interface FormButtonProps {
  selectedAsset?: Asset;
  amount: BigNumber;
  allowance: BigNumber | undefined;
  onApproveClick: () => void;
}

const FormButton = ({
  selectedAsset,
  amount,
  allowance,
  onApproveClick,
}: FormButtonProps) => {
  const approved =
    allowance && allowance.isGreaterThan(0) && amount.isLessThan(allowance);
  let button = null;
  let message: ReactNode = '';

  if (!selectedAsset) {
    button = (
      <Button
        type="submit"
        data-testid="deposit-submit"
        variant="primary"
        fill={true}
      >
        {t('Deposit')}
      </Button>
    );
  } else if (approved) {
    message = (
      <>
        <Icon name="tick" className="mr-2" />
        <span>{t('Approved')}</span>
      </>
    );
    button = (
      <Button
        type="submit"
        data-testid="deposit-submit"
        variant="primary"
        fill={true}
      >
        {t('Deposit')}
      </Button>
    );
  } else {
    message = t(`Deposits of ${selectedAsset.symbol} not approved`);
    button = (
      <Button
        onClick={onApproveClick}
        data-testid="deposit-approve-submit"
        variant="primary"
        fill={true}
      >
        {t(`Approve ${selectedAsset.symbol}`)}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && <p className="text-center">{message}</p>}
      {button}
    </div>
  );
};

interface UseButtonProps {
  children: ReactNode;
  onClick: () => void;
}

const UseButton = ({ children, onClick }: UseButtonProps) => {
  return (
    <button
      type="button"
      className="ml-auto text-sm absolute top-0 right-0 underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
