import type { Asset } from '@vegaprotocol/assets';
import { AssetOption } from '@vegaprotocol/assets';
import {
  ethereumAddress,
  minSafe,
  removeDecimal,
  required,
  isAssetTypeERC20,
  formatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  Notification,
  RichSelect,
  Icon,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { formatDistanceToNow } from 'date-fns';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawLimits } from './withdraw-limits';
import {
  ETHEREUM_EAGER_CONNECT,
  useWeb3ConnectStore,
} from '@vegaprotocol/web3';

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

const WithdrawDelayNotification = ({
  threshold,
  delay,
  symbol,
  decimals,
}: {
  threshold: BigNumber;
  delay: number | undefined;
  symbol: string;
  decimals: number;
}) => {
  const replacements = [
    symbol,
    delay ? formatDistanceToNow(Date.now() + delay * 1000) : ' ',
  ];
  return (
    <Notification
      intent={Intent.Warning}
      testId={
        threshold.isFinite()
          ? 'amount-withdrawal-delay-notification'
          : 'withdrawals-delay-notification'
      }
      message={[
        !threshold.isFinite()
          ? t('All %s withdrawals are subject to a %s delay.', replacements)
          : t('Withdrawals of %s %s or more will be delayed for %s.', [
              formatNumber(threshold, decimals),
              ...replacements,
            ]),
        <a
          className="ml-2"
          href="https://docs.vega.xyz/testnet/concepts/deposits-withdrawals#withdrawal-limits"
          target="_blank"
          rel="noreferrer"
        >
          {t('Read more')}
          <Icon name="arrow-top-right" size={3} className="ml-2" />
        </a>,
      ]}
    />
  );
};

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

  const renderAssetsSelector = ({
    field,
  }: {
    field: ControllerRenderProps<FormFields, 'asset'>;
  }) => {
    return (
      <RichSelect
        data-testid="select-asset"
        id="asset"
        name="asset"
        required
        onValueChange={(value) => {
          onSelectAsset(value);
          field.onChange(value);
        }}
        placeholder={t('Please select an asset')}
        value={selectedAsset?.id}
        hasError={Boolean(errors.asset?.message)}
      >
        {assets.filter(isAssetTypeERC20).map((a) => (
          <AssetOption key={a.id} asset={a} />
        ))}
      </RichSelect>
    );
  };

  const showWithdrawDelayNotification =
    delay &&
    selectedAsset &&
    (!threshold.isFinite() ||
      new BigNumber(amount).isGreaterThanOrEqualTo(threshold));

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
            render={renderAssetsSelector}
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
          {showWithdrawDelayNotification && (
            <div className="mt-2">
              <WithdrawDelayNotification
                threshold={threshold}
                symbol={selectedAsset.symbol}
                decimals={selectedAsset.decimals}
                delay={delay}
              />
            </div>
          )}
        </FormGroup>
        <Button
          data-testid="submit-withdrawal"
          type="submit"
          variant="primary"
          fill={true}
        >
          Release funds
        </Button>
      </form>
    </>
  );
};

type UseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const UseButton = (props: UseButtonProps) => {
  return (
    <button
      {...props}
      type="button"
      className="ml-auto text-sm absolute top-0 right-0 underline"
    />
  );
};

const EthereumButton = ({ clearAddress }: { clearAddress: () => void }) => {
  const openDialog = useWeb3ConnectStore((state) => state.open);
  const { isActive, connector } = useWeb3React();
  const [, , removeEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);

  if (!isActive) {
    return (
      <UseButton onClick={openDialog} data-testid="connect-eth-wallet-btn">
        {t('Connect')}
      </UseButton>
    );
  }

  return (
    <UseButton
      onClick={() => {
        connector.deactivate();
        clearAddress();
        removeEagerConnector();
      }}
      data-testid="disconnect-ethereum-wallet"
    >
      {t('Disconnect')}
    </UseButton>
  );
};
