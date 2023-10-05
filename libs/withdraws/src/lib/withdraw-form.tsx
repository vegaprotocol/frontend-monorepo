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
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  Notification,
  TradingRichSelect,
  ExternalLink,
  Intent,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import { useEffect, type ButtonHTMLAttributes } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { formatDistanceToNow } from 'date-fns';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { WithdrawLimits } from './withdraw-limits';
import {
  ETHEREUM_EAGER_CONNECT,
  useWeb3ConnectStore,
  useWeb3Disconnect,
} from '@vegaprotocol/web3';
import { AssetBalance } from './asset-balance';
import { DocsLinks } from '@vegaprotocol/environment';

export interface WithdrawalArgs {
  amount: string;
  asset: string;
  receiverAddress: string;
  availableTimestamp: number | null;
}

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
      key={symbol}
      testId={
        threshold.isEqualTo(0)
          ? 'withdrawals-delay-notification'
          : 'amount-withdrawal-delay-notification'
      }
      message={[
        threshold.isEqualTo(0)
          ? t('All %s withdrawals are subject to a %s delay.', replacements)
          : t('Withdrawals of %s %s or more will be delayed for %s.', [
              formatNumber(threshold, decimals),
              ...replacements,
            ]),
        DocsLinks?.WITHDRAWAL_LIMITS ? (
          <ExternalLink className="ml-1" href={DocsLinks.WITHDRAWAL_LIMITS}>
            {t('Read more')}
          </ExternalLink>
        ) : (
          ''
        ),
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
    trigger,
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

  useEffect(() => {
    setValue('to', address || '');
    trigger('to');
  }, [address, setValue, trigger]);

  const renderAssetsSelector = ({
    field,
  }: {
    field: ControllerRenderProps<FormFields, 'asset'>;
  }) => {
    return (
      <TradingRichSelect
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
          <AssetOption
            key={a.id}
            asset={a}
            balance={<AssetBalance asset={a} />}
          />
        ))}
      </TradingRichSelect>
    );
  };

  const showWithdrawDelayNotification =
    Boolean(delay) &&
    Boolean(selectedAsset) &&
    new BigNumber(amount).isGreaterThan(threshold);

  return (
    <>
      <div className="mb-4 text-sm">
        <p>{t('There are two steps required to make a withdrawal')}</p>
        <ol className="pl-4 list-disc">
          <li>{t('Step 1 - Release funds from Vega')}</li>
          <li>{t('Step 2 - Transfer funds to your Ethereum wallet')}</li>
        </ol>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate={true}
        data-testid="withdraw-form"
      >
        <TradingFormGroup label={t('Asset')} labelFor="asset">
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
            <TradingInputError intent="danger">
              {errors.asset.message}
            </TradingInputError>
          )}
        </TradingFormGroup>
        <TradingFormGroup
          label={t('To (Ethereum address)')}
          labelFor="ethereum-address"
        >
          <EthereumButton
            clearAddress={() => {
              setValue('to', '');
              clearErrors('to');
            }}
          />
          <TradingInput
            id="ethereum-address"
            data-testid="eth-address-input"
            {...register('to', { validate: { required, ethereumAddress } })}
          />
          {errors.to?.message && (
            <TradingInputError intent="danger">
              {errors.to.message}
            </TradingInputError>
          )}
        </TradingFormGroup>
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
        <TradingFormGroup label={t('Amount')} labelFor="amount">
          <TradingInput
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
            <TradingInputError intent="danger">
              {errors.amount.message}
            </TradingInputError>
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
          {selectedAsset && showWithdrawDelayNotification && (
            <div className="mt-2">
              <WithdrawDelayNotification
                threshold={threshold}
                symbol={selectedAsset.symbol}
                decimals={selectedAsset.decimals}
                delay={delay}
              />
            </div>
          )}
        </TradingFormGroup>
        <TradingButton
          data-testid="submit-withdrawal"
          type="submit"
          fill={true}
        >
          {t('Release funds')}
        </TradingButton>
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
      className="absolute top-0 right-0 ml-auto text-sm underline"
    />
  );
};

const EthereumButton = ({ clearAddress }: { clearAddress: () => void }) => {
  const openDialog = useWeb3ConnectStore((state) => state.open);
  const { isActive, connector } = useWeb3React();
  const [, , removeEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);
  const disconnect = useWeb3Disconnect(connector);

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
        disconnect();
        clearAddress();
        removeEagerConnector();
      }}
      data-testid="disconnect-ethereum-wallet"
    >
      {t('Disconnect')}
    </UseButton>
  );
};
