import {
  addDecimal,
  removeDecimal,
  t,
  ethereumAddress,
  required,
  vegaPublicKey,
  minSafe,
  maxSafe,
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
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DepositLimits } from './deposit-limits';
import { FAUCETABLE } from '../config';
import type { Asset } from './deposit-manager';

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
  available: BigNumber | undefined;
  submitApprove: () => Promise<void>;
  submitDeposit: (args: {
    assetSource: string;
    amount: string;
    vegaPublicKey: string;
  }) => Promise<void>;
  requestFaucet: () => Promise<void>;
  limits: {
    min: BigNumber;
    max: BigNumber;
  } | null;
  allowance: BigNumber | undefined;
}

export const DepositForm = ({
  assets,
  selectedAsset,
  onSelectAsset,
  available,
  submitApprove,
  submitDeposit,
  requestFaucet,
  limits,
  allowance,
}: DepositFormProps) => {
  const { account } = useWeb3React();
  const { keypair } = useVegaWallet();
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      asset: selectedAsset?.id,
      from: account,
      to: keypair?.pub,
    },
  });

  const onDeposit = async (fields: FormFields) => {
    if (!selectedAsset) {
      throw new Error('Asset not selected');
    }

    submitDeposit({
      assetSource: selectedAsset.source.contractAddress,
      amount: removeDecimal(fields.amount, selectedAsset.decimals),
      vegaPublicKey: `0x${fields.to}`,
    });
  };

  const assetId = useWatch({ name: 'asset', control });
  const amount = useWatch({ name: 'amount', control });

  const min = useMemo(() => {
    // Min viable amount given asset decimals EG for WEI 0.000000000000000001
    const minViableAmount = selectedAsset
      ? new BigNumber(addDecimal('1', selectedAsset.decimals))
      : new BigNumber(0);

    const min = limits
      ? BigNumber.maximum(minViableAmount, limits.min)
      : minViableAmount;

    return min;
  }, [limits, selectedAsset]);

  const max = useMemo(() => {
    const maxApproved = allowance ? allowance : new BigNumber(Infinity);
    const maxAvailable = available ? available : new BigNumber(Infinity);
    // A max limit of zero indicates that there is no limit
    let maxLimit = new BigNumber(Infinity);
    if (limits && limits.max.isGreaterThan(0)) {
      maxLimit = limits.max;
    }

    return {
      approved: maxApproved,
      available: maxAvailable,
      limit: maxLimit,
      amount: BigNumber.minimum(maxLimit, maxApproved, maxAvailable),
    };
  }, [limits, allowance, available]);

  useEffect(() => {
    onSelectAsset(assetId);
  }, [assetId, onSelectAsset]);

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
        <Input
          {...register('from', { validate: { required, ethereumAddress } })}
          id="ethereum-address"
        />
        {errors.from?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.from.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup label={t('Asset')} labelFor="asset" className="relative">
        <Select {...register('asset', { validate: { required } })} id="asset">
          <option value="">{t('Please select')}</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        {errors.asset?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.asset.message}
          </InputError>
        )}
        {FAUCETABLE && selectedAsset && (
          <UseButton onClick={requestFaucet}>
            {t(`Get ${selectedAsset.symbol}`)}
          </UseButton>
        )}
      </FormGroup>
      <FormGroup
        label={t('To (Vega key)')}
        labelFor="vega-key"
        className="relative"
      >
        <Input
          {...register('to', { validate: { required, vegaPublicKey } })}
          id="vega-key"
        />
        {errors.to?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.to.message}
          </InputError>
        )}
        {keypair?.pub && (
          <UseButton
            onClick={() => {
              setValue('to', keypair.pub);
              clearErrors('to');
            }}
          >
            {t('Use connected')}
          </UseButton>
        )}
      </FormGroup>
      {selectedAsset && limits && (
        <FormGroup>
          <DepositLimits limits={limits} />
        </FormGroup>
      )}
      <FormGroup label={t('Amount')} labelFor="amount" className="relative">
        <Input
          type="number"
          autoComplete="off"
          id="amount"
          {...register('amount', {
            required: t('Required'),
            validate: {
              minSafe: (value) => minSafe(min)(value),
              maxSafe: (v) => {
                const value = new BigNumber(v);
                if (value.isGreaterThan(max.approved)) {
                  return t('Amount is above approved amount');
                } else if (value.isGreaterThan(max.limit)) {
                  return t('Amount is above permitted maximum');
                } else if (value.isGreaterThan(max.available)) {
                  return t('Insufficient amount in Ethereum wallet');
                }
                return maxSafe(max.amount)(v);
              },
            },
          })}
        />
        {errors.amount?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.amount.message}
          </InputError>
        )}
        {account && selectedAsset && available && (
          <UseButton
            onClick={() => {
              setValue('amount', max.amount.toFixed(selectedAsset.decimals));
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
      <Button type="submit" className="w-full">
        {t('Deposit')}
      </Button>
    );
  } else if (approved) {
    message = (
      <>
        <Icon name="tick" /> <span>{t('Approved')}</span>
      </>
    );
    button = (
      <Button type="submit" className="w-full">
        {t('Deposit')}
      </Button>
    );
  } else {
    message = t(`Deposits of ${selectedAsset.symbol} not approved`);
    button = (
      <Button onClick={onApproveClick} className="w-full">
        {t(`Approve ${selectedAsset.symbol}`)}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && <p className="text-ui text-center mb-4">{message}</p>}
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
      className="ml-auto text-ui absolute top-0 right-0 underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
