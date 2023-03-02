import type { Asset } from '@vegaprotocol/assets';
import { AssetOption } from '@vegaprotocol/assets';
import {
  ethereumAddress,
  required,
  vegaPublicKey,
  minSafe,
  maxSafe,
  addDecimal,
  isAssetTypeERC20,
  truncateByChars,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import {
  Button,
  FormGroup,
  Input,
  InputError,
  RichSelect,
  Notification,
  Intent,
  ButtonLink,
  Select,
  Link,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';
import type { FieldError } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { DepositLimits } from './deposit-limits';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { EthTxState } from '@vegaprotocol/web3';
import { EthTxStatus } from '@vegaprotocol/web3';
import {
  ETHEREUM_EAGER_CONNECT,
  useWeb3ConnectStore,
  getChainName,
} from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';

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
  approveStatus: EthTxState;
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
  approveStatus,
  submitDeposit,
  requestFaucet,
  allowance,
  isFaucetable,
}: DepositFormProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { isActive, account } = useWeb3React();
  const { pubKey, pubKeys: _pubKeys } = useVegaWallet();
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      to: pubKey ? pubKey : undefined,
      asset: selectedAsset?.id || '',
    },
  });

  const onSubmit = async (fields: FormFields) => {
    if (!selectedAsset || selectedAsset.source.__typename !== 'ERC20') {
      throw new Error('Invalid asset');
    }

    if (formState === 'approve') throw new Error('Deposits not approved');
    if (!approved) throw new Error('Deposits not approved');

    submitDeposit({
      assetSource: selectedAsset.source.contractAddress,
      amount: fields.amount,
      vegaPublicKey: fields.to,
    });
  };

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

  const pubKeys = useMemo(() => {
    return _pubKeys ? _pubKeys.map((pk) => pk.publicKey) : [];
  }, [_pubKeys]);

  const approved = allowance && allowance.isGreaterThan(0) ? true : false;
  const formState = getFormState(selectedAsset, isActive, approved);
  console.log(formState, approved, allowance?.toString());

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate={true}
      data-testid="deposit-form"
    >
      <FormGroup
        label={t('From (Ethereum address)')}
        labelFor="ethereum-address"
      >
        <Controller
          name="from"
          control={control}
          rules={{
            validate: {
              required: (value) => {
                if (!value) return t('Connect Ethereum wallet');
                return true;
              },
              ethereumAddress,
            },
          }}
          defaultValue={account}
          render={() => {
            if (isActive && account) {
              return (
                <div className="text-sm">
                  <p className="mb-1">{account}</p>
                  <DisconnectEthereumButton
                    onDisconnect={() => {
                      setValue('from', ''); // clear from value so required ethereum connection validation works
                    }}
                  />
                </div>
              );
            }
            return (
              <Button
                onClick={openDialog}
                variant="primary"
                type="button"
                data-testid="connect-eth-wallet-btn"
              >
                {t('Connect')}
              </Button>
            );
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
            <RichSelect
              data-testid="select-asset"
              id={field.name}
              name={field.name}
              onValueChange={(value) => {
                onSelectAsset(value);
                field.onChange(value);
              }}
              placeholder={t('Please select an asset')}
              value={selectedAsset?.id}
              hasError={Boolean(errors.asset?.message)}
            >
              {assets.filter(isAssetTypeERC20).map((a) => (
                <AssetOption asset={a} key={a.id} />
              ))}
            </RichSelect>
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
              e.preventDefault();
              openAssetDetailsDialog(selectedAsset.id, e.target as HTMLElement);
            }}
          >
            {t('View asset details')}
          </button>
        )}
      </FormGroup>
      <FormGroup label={t('To (Vega key)')} labelFor="to">
        <AddressField
          pubKeys={pubKeys}
          onChange={() => setValue('to', '')}
          select={
            <Select {...register('to')} id="to" defaultValue="">
              <option value="" disabled={true}>
                {t('Please select')}
              </option>
              {pubKeys?.length &&
                pubKeys.map((pk) => (
                  <option key={pk} value={pk}>
                    {pk}
                  </option>
                ))}
            </Select>
          }
          input={
            <Input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true} // focus input immediately after is shown
              id="to"
              type="text"
              {...register('to', {
                validate: {
                  required,
                  vegaPublicKey,
                },
              })}
            />
          }
        />
        {errors.to?.message && (
          <InputError intent="danger" forInput="to">
            {errors.to.message}
          </InputError>
        )}
      </FormGroup>
      {selectedAsset && max && deposited && (
        <div className="mb-6">
          <DepositLimits
            max={max}
            deposited={deposited}
            balance={balance}
            asset={selectedAsset}
            allowance={allowance}
          />
        </div>
      )}
      {formState === 'deposit' && (
        <FormGroup label={t('Amount')} labelFor="amount">
          <Input
            type="number"
            autoComplete="off"
            id="amount"
            {...register('amount', {
              validate: {
                required,
                minSafe: (value) => minSafe(new BigNumber(min))(value),
                approved: (v) => {
                  const value = new BigNumber(v);
                  if (value.isGreaterThan(maxAmount.approved)) {
                    return t('Amount is above approved amount');
                  }
                  return true;
                },
                limit: (v) => {
                  const value = new BigNumber(v);
                  if (value.isGreaterThan(maxAmount.limit)) {
                    return t('Amount is above deposit limit');
                  }
                  return true;
                },
                balance: (v) => {
                  const value = new BigNumber(v);
                  if (value.isGreaterThan(maxAmount.available)) {
                    return t('Insufficient amount in Ethereum wallet');
                  }
                  return true;
                },
                maxSafe: (v) => {
                  return maxSafe(maxAmount.amount)(v);
                },
              },
            })}
          />
          {errors.amount?.message && (
            <AmountError error={errors.amount} submitApprove={submitApprove} />
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
      )}
      <FormButton
        selectedAsset={selectedAsset}
        formState={formState}
        onApprove={submitApprove}
        approveStatus={approveStatus}
        approved={approved}
      />
    </form>
  );
};

const AmountError = ({
  error,
  submitApprove,
}: {
  error: FieldError;
  submitApprove: () => void;
}) => {
  if (error.type === 'approved') {
    return (
      <InputError intent="danger" forInput="amount">
        {error.message}.
        <button onClick={submitApprove} className="underline ml-2">
          {t('Update approve amount')}
        </button>
      </InputError>
    );
  }
  return (
    <InputError intent="danger" forInput="amount">
      {error.message}
    </InputError>
  );
};

interface FormButtonProps {
  selectedAsset?: Asset;
  formState: ReturnType<typeof getFormState>;
  onApprove: () => void;
  approveStatus: EthTxState;
  approved: boolean;
}

const FormButton = ({
  selectedAsset,
  formState,
  onApprove,
  approveStatus,
  approved,
}: FormButtonProps) => {
  const { isActive, chainId } = useWeb3React();
  const desiredChainId = useWeb3ConnectStore((store) => store.desiredChainId);
  const invalidChain = isActive && chainId !== desiredChainId;
  return (
    <>
      <div className="mb-2">
        <ApproveNotification
          selectedAsset={selectedAsset}
          onApprove={onApprove}
          tx={approveStatus}
          formState={formState}
          approved={approved}
        />
      </div>
      {invalidChain && (
        <div className="mb-2">
          <Notification
            intent={Intent.Danger}
            testId="chain-error"
            message={t(
              `This app only works on ${getChainName(desiredChainId)}.`
            )}
          />
        </div>
      )}
      <Button
        type="submit"
        data-testid="deposit-submit"
        variant={isActive ? 'primary' : 'default'}
        fill={true}
        disabled={formState === 'approve' || invalidChain}
      >
        {t('Deposit')}
      </Button>
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

const DisconnectEthereumButton = ({
  onDisconnect,
}: {
  onDisconnect: () => void;
}) => {
  const { connector } = useWeb3React();
  const [, , removeEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);

  return (
    <ButtonLink
      onClick={() => {
        connector.deactivate();
        removeEagerConnector();
        onDisconnect();
      }}
      data-testid="disconnect-ethereum-wallet"
    >
      {t('Disconnect')}
    </ButtonLink>
  );
};

const getFormState = (
  selectedAsset: Asset | undefined,
  isActive: boolean,
  approved: boolean
) => {
  if (!isActive) return 'idle';
  if (!selectedAsset) return 'idle';
  if (approved) return 'deposit';
  return 'approve';
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
          className="ml-auto text-sm absolute top-0 right-0 underline"
        >
          {isInput ? t('Select from wallet') : t('Enter manually')}
        </button>
      )}
    </>
  );
};

interface ApproveNotificationProps {
  selectedAsset?: Asset;
  tx: EthTxState;
  onApprove: () => void;
  approved: boolean;
}

const ApproveNotification = ({
  selectedAsset,
  tx,
  onApprove,
  approved,
}: ApproveNotificationProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  console.log(selectedAsset?.symbol, tx.status, approved);

  if (!selectedAsset) {
    return null;
  }

  if (approved && tx.status === EthTxStatus.Default) {
    return null;
  }

  if (
    tx.status === EthTxStatus.Default ||
    // if the user rejected show the prompt again so they can re-attempt
    // @ts-ignore code will exist
    (tx.status === EthTxStatus.Error && tx.error?.code === 'ACTION_REJECTED')
  ) {
    return (
      <Notification
        intent={Intent.Warning}
        testId="approve-default"
        message={t(
          `Before you can make a deposit of your chosen asset, ${selectedAsset?.symbol}, you need to approve its use in your Ethereum wallet`
        )}
        buttonProps={{
          size: 'sm',
          text: `Approve ${selectedAsset?.symbol}`,
          action: onApprove,
        }}
      />
    );
  }

  if (tx.status === EthTxStatus.Error) {
    return (
      <Notification
        intent={Intent.Danger}
        testId="approve-error"
        message={t(`Approval failed: ${tx.error?.message}`)}
      />
    );
  }

  if (tx.status === EthTxStatus.Requested) {
    return (
      <Notification
        intent={Intent.Warning}
        testId="approve-requested"
        message={t(
          `Got to your Ethereum wallet and approve the transaction to enable the use of ${selectedAsset?.symbol}`
        )}
      />
    );
  }

  if (tx.status === EthTxStatus.Pending) {
    return (
      <Notification
        intent={Intent.Primary}
        testId="approve-pending"
        message={
          <>
            <p>
              {t(
                `Your ${selectedAsset?.symbol} is being confirmed by the Ethereum network. When this is complete, you can continue your deposit`
              )}
            </p>
            {tx.txHash && (
              <ExternalLink href={`${ETHERSCAN_URL}/tx/${tx.txHash}`}>
                {truncateByChars(tx.txHash)}
              </ExternalLink>
            )}
          </>
        }
      />
    );
  }

  if (tx.status === EthTxStatus.Confirmed) {
    return (
      <Notification
        intent={Intent.Success}
        testId="approve-confirmed"
        message={
          <>
            <p>
              {t(
                `Asset approved. You can now make deposits of up to XXX ${selectedAsset?.symbol}.`
              )}
            </p>
            {tx.txHash && (
              <ExternalLink href={`${ETHERSCAN_URL}/tx/${tx.txHash}`}>
                {truncateByChars(tx.txHash)}
              </ExternalLink>
            )}
          </>
        }
      />
    );
  }

  throw new Error('Invalid state for approval ui');
};
