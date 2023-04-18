import type { Asset, AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetOption } from '@vegaprotocol/assets';
import {
  ethereumAddress,
  required,
  vegaPublicKey,
  minSafe,
  maxSafe,
  addDecimal,
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
  RichSelect,
  Notification,
  Intent,
  ButtonLink,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ChangeEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useWatch, Controller, useForm } from 'react-hook-form';
import { DepositLimits } from './deposit-limits';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import {
  ETHEREUM_EAGER_CONNECT,
  useWeb3ConnectStore,
  getChainName,
} from '@vegaprotocol/web3';
import type { DepositBalances } from './use-deposit-balances';
import { FaucetNotification } from './faucet-notification';
import { ApproveNotification } from './approve-notification';
import { usePersistentDeposit } from './use-persistent-deposit';

interface FormFields {
  asset: string;
  from: string;
  to: string;
  amount: string;
}

export interface DepositFormProps {
  assets: Asset[];
  selectedAsset?: Asset;
  balances: DepositBalances | null;
  onSelectAsset: (assetId: string) => void;
  handleAmountChange: (amount: string) => void;
  onDisconnect: () => void;
  submitApprove: () => void;
  approveTxId: number | null;
  submitFaucet: () => void;
  faucetTxId: number | null;
  submitDeposit: (args: {
    assetSource: string;
    amount: string;
    vegaPublicKey: string;
  }) => void;
  isFaucetable?: boolean;
}

export const DepositForm = ({
  assets,
  selectedAsset,
  balances,
  onSelectAsset,
  handleAmountChange,
  onDisconnect,
  submitApprove,
  submitDeposit,
  submitFaucet,
  faucetTxId,
  approveTxId,
  isFaucetable,
}: DepositFormProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { isActive, account } = useWeb3React();
  const { pubKey, pubKeys: _pubKeys } = useVegaWallet();
  const [approveNotificationIntent, setApproveNotificationIntent] =
    useState<Intent>(Intent.Warning);
  const [persistedDeposit] = usePersistentDeposit(selectedAsset?.id);

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
      asset: selectedAsset?.id,
      amount: persistedDeposit?.amount,
    },
  });

  const amount = useWatch({ name: 'amount', control });

  const onSubmit = async (fields: FormFields) => {
    if (!selectedAsset || selectedAsset.source.__typename !== 'ERC20') {
      throw new Error('Invalid asset');
    }
    if (!approved) {
      setApproveNotificationIntent(Intent.Danger);
      return;
    }
    submitDeposit({
      assetSource: selectedAsset.source.contractAddress,
      amount: fields.amount,
      vegaPublicKey: fields.to,
    });
  };

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

  const approved =
    balances && balances.allowance.isGreaterThan(0) ? true : false;

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
                <div className="text-sm" aria-describedby="ethereum-address">
                  <p className="mb-1" data-testid="ethereum-address">
                    {account}
                  </p>
                  <DisconnectEthereumButton
                    onDisconnect={() => {
                      setValue('from', ''); // clear from value so required ethereum connection validation works
                      onDisconnect();
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
      <FormGroup label={t('To (Vega key)')} labelFor="to">
        <AddressField
          pubKeys={pubKeys}
          onChange={() => setValue('to', '')}
          select={
            <Select {...register('to')} id="to" defaultValue="">
              <option value="" disabled>
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
        {isActive && isFaucetable && selectedAsset && (
          <UseButton onClick={submitFaucet}>
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
      <FaucetNotification
        isActive={isActive}
        selectedAsset={selectedAsset}
        faucetTxId={faucetTxId}
      />
      {approved && selectedAsset && balances && (
        <div className="mb-6">
          <DepositLimits {...balances} asset={selectedAsset} />
        </div>
      )}
      {approved && (
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
                  const allowance = new BigNumber(balances?.allowance || 0);
                  if (value.isGreaterThan(allowance)) {
                    return t(
                      "You can't deposit more than your approved deposit amount, %s %s",
                      [
                        formatNumber(allowance.toString()),
                        selectedAsset?.symbol || ' ',
                      ]
                    );
                  }
                  return true;
                },
                limit: (v) => {
                  const value = new BigNumber(v);
                  if (!balances) {
                    return t('Could not verify balances of account'); // this should never happen
                  }

                  let lifetimeLimit = new BigNumber(Infinity);
                  if (balances.max.isGreaterThan(0)) {
                    lifetimeLimit = balances.max.minus(balances.deposited);
                  }

                  if (value.isGreaterThan(lifetimeLimit)) {
                    return t(
                      "You can't deposit more than your remaining deposit allowance, %s %s",
                      [
                        formatNumber(lifetimeLimit.toString()),
                        selectedAsset?.symbol || ' ',
                      ]
                    );
                  }
                  return true;
                },
                balance: (v) => {
                  const value = new BigNumber(v);
                  const balance = new BigNumber(balances?.balance || 0);
                  if (value.isGreaterThan(balance)) {
                    return t(
                      "You can't deposit more than you have in your Ethereum wallet, %s %s",
                      [formatNumber(balance), selectedAsset?.symbol || ' ']
                    );
                  }
                  return true;
                },
                maxSafe: (v) => {
                  return maxSafe(balances?.balance || new BigNumber(0))(v);
                },
              },
              onChange: (e: ChangeEvent<HTMLInputElement>) => {
                handleAmountChange(e.target.value || '');
              },
            })}
          />
          {errors.amount?.message && (
            <InputError intent="danger" forInput="amount">
              {errors.amount.message}
            </InputError>
          )}
          {selectedAsset && balances && (
            <UseButton
              onClick={() => {
                const amount = balances.balance.toFixed(selectedAsset.decimals);
                setValue('amount', amount);
                handleAmountChange(amount);
                clearErrors('amount');
              }}
            >
              {t('Use maximum')}
            </UseButton>
          )}
        </FormGroup>
      )}
      <ApproveNotification
        isActive={isActive}
        approveTxId={approveTxId}
        selectedAsset={selectedAsset}
        onApprove={() => {
          submitApprove();
          setApproveNotificationIntent(Intent.Warning);
        }}
        balances={balances}
        approved={approved}
        intent={approveNotificationIntent}
        amount={amount}
      />
      <FormButton approved={approved} selectedAsset={selectedAsset} />
    </form>
  );
};

interface FormButtonProps {
  approved: boolean;
  selectedAsset: AssetFieldsFragment | undefined;
}

const FormButton = ({ approved, selectedAsset }: FormButtonProps) => {
  const { isActive, chainId } = useWeb3React();
  const desiredChainId = useWeb3ConnectStore((store) => store.desiredChainId);
  const invalidChain = isActive && chainId !== desiredChainId;
  return (
    <>
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
        fill
        disabled={invalidChain}
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
          data-testid="enter-pubkey-manually"
        >
          {isInput ? t('Select from wallet') : t('Enter manually')}
        </button>
      )}
    </>
  );
};
