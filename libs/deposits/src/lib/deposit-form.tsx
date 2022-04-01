import { addDecimal, removeDecimal, t } from '@vegaprotocol/react-helpers';
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
import { ethers } from 'ethers';
import type { ReactNode } from 'react';
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
  available: BigNumber | null;
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
  allowance: BigNumber | null;
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

  useEffect(() => {
    onSelectAsset(assetId);
  }, [assetId, onSelectAsset]);

  return (
    <form onSubmit={handleSubmit(onDeposit)} noValidate={true}>
      <FormGroup
        label={t('From (Ethereum address)')}
        labelFor="ethereum-address"
      >
        <Input
          {...register('from', {
            required: t('Required'),
            validate: {
              validEthereumAddress: (value) => {
                if (!ethers.utils.isAddress(value)) {
                  return t('Invalid Ethereum address');
                }

                return true;
              },
            },
          })}
          id="ethereum-address"
        />
        {errors.from?.message && (
          <InputError intent="danger" className="mt-4">
            {errors.from.message}
          </InputError>
        )}
      </FormGroup>
      <FormGroup label={t('Asset')} labelFor="asset" className="relative">
        <Select {...register('asset', { required: t('Required') })} id="asset">
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
          {...register('to', {
            required: t('Required'),
            validate: {
              validVegaAddress: (value) => {
                if (value.length !== 64 || !/^[A-Za-z0-9]*$/i.test(value)) {
                  return t('Invalid Vega key');
                }

                return true;
              },
            },
          })}
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
              minSafe: (value) => {
                // Min viable amount given asset decimals EG for WEI 0.000000000000000001
                const minViableAmount = selectedAsset
                  ? new BigNumber(addDecimal('1', selectedAsset.decimals))
                  : new BigNumber(0);

                const min = limits
                  ? BigNumber.maximum(minViableAmount, limits.min)
                  : minViableAmount;

                if (new BigNumber(value).isLessThan(min)) {
                  return t('Amount is below permitted minimum');
                }

                return true;
              },
              maxSafe: (v) => {
                const value = new BigNumber(v);

                const maxLimit = limits ? limits.max : new BigNumber(Infinity);
                if (value.isGreaterThan(maxLimit)) {
                  return t('Amount is above permitted maximum');
                }

                const maxApproved = allowance ? allowance : new BigNumber(0);
                if (value.isGreaterThan(maxApproved)) {
                  return t('Amount is above approved amount');
                }

                if (available && value.isGreaterThan(available)) {
                  return t('Insufficient amount in Ethereum wallet');
                }

                return true;
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
              const amount = BigNumber.minimum(
                available,
                limits?.max || Infinity
              );
              setValue('amount', amount.toFixed(selectedAsset.decimals));
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
  allowance: BigNumber | null;
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
