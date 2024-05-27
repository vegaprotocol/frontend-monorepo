import type { Asset, AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetOption } from '@vegaprotocol/assets';
import {
  useEthereumAddress,
  useRequired,
  useVegaPublicKey,
  useMinSafe,
  useMaxSafe,
  addDecimal,
  formatNumber,
} from '@vegaprotocol/utils';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  TradingRichSelect,
  Notification,
  Intent,
  ButtonLink,
  TradingSelect,
  truncateMiddle,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import type { ButtonHTMLAttributes, ChangeEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useWatch, Controller, useForm } from 'react-hook-form';
import { DepositLimits } from './deposit-limits';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import {
  ETHEREUM_EAGER_CONNECT,
  useWeb3ConnectStore,
  getChainName,
  useWeb3Disconnect,
} from '@vegaprotocol/web3';
import type { DepositBalances } from './use-deposit-balances';
import { FaucetNotification } from './faucet-notification';
import { ApproveNotification } from './approve-notification';
import { usePersistentDeposit } from './use-persistent-deposit';
import { AssetBalance } from './asset-balance';
import { useT } from './use-t';

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
  onSelectAsset: (assetId?: string) => void;
  handleAmountChange: (amount: string) => void;
  onDisconnect: () => void;
  submitApprove: (amount?: string) => void;
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
  const t = useT();
  const ethereumAddress = useEthereumAddress();
  const required = useRequired();
  const vegaPublicKey = useVegaPublicKey();
  const minSafe = useMinSafe();
  const maxSafe = useMaxSafe();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const openDialog = useWeb3ConnectStore((store) => store.open);
  const { isActive, account, chainId } = useWeb3React();
  const desiredChains = useWeb3ConnectStore((store) => store.chains);

  const { pubKey, pubKeys: _pubKeys } = useVegaWallet();
  const [approveNotificationIntent, setApproveNotificationIntent] =
    useState<Intent>(Intent.Warning);
  const [persistedDeposit] = usePersistentDeposit(selectedAsset?.id);

  const selectedAssetChainId =
    selectedAsset?.source.__typename === 'ERC20' &&
    Number(selectedAsset.source.chainId);

  // indicates if connected to the unsupported chain
  const invalidChain = isActive && !desiredChains?.includes(Number(chainId));

  // indicates if connected currently to the wrong chain that is not the same
  // as chosen asset
  const wrongChain = selectedAssetChainId !== chainId;

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      from: account || '',
      to: pubKey ? pubKey : undefined,
      asset: selectedAsset?.id,
      amount: persistedDeposit?.amount,
    },
  });

  const amount = useWatch({ name: 'amount', control });
  const availableAssets = assets.filter(
    (asset) => asset.source.__typename === 'ERC20'
  );

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

  useEffect(() => {
    setValue('from', account || '');
    trigger('from');
  }, [account, setValue, trigger]);

  const approved =
    balances && balances.allowance.isGreaterThan(0) ? true : false;

  return invalidChain ? (
    <div className="mb-2">
      <Notification
        intent={Intent.Danger}
        testId="chain-error"
        message={t(
          'This app only works on {{chainId}}. Switch your Ethereum wallet to the correct network.',
          {
            chainId: desiredChains
              ?.map((chain) => getChainName(chain))
              .join(t(' or ')),
          }
        )}
      />
    </div>
  ) : (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate={true}
      data-testid="deposit-form"
    >
      <TradingFormGroup
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
              wrongChain: () => (wrongChain ? false : true),
            },
          }}
          defaultValue={account}
          render={() => {
            if (isActive && account) {
              let chainLogo = 'https://icon.vega.xyz/missing.svg';
              if (chainId) {
                chainLogo = `https://icon.vega.xyz/chain/${chainId}/logo.svg`;
              }
              return (
                <div className="text-sm" aria-describedby="ethereum-address">
                  <div className="flex gap-1 mb-1">
                    {chainId ? (
                      <img
                        className="w-4 h-4"
                        src={chainLogo}
                        alt={String(chainId) || ''}
                      />
                    ) : null}
                    <span className="break-all" data-testid="ethereum-address">
                      {truncateMiddle(account)}
                    </span>
                  </div>

                  {wrongChain ? (
                    <p className="text-xs text-vega-red-500 flex items-center gap-1">
                      <VegaIcon name={VegaIconNames.WARNING} size={12} />
                      {t('Switch network in your wallet to {{chain}}', {
                        chain: getChainName(Number(selectedAssetChainId)),
                      })}
                    </p>
                  ) : null}

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
              <TradingButton
                onClick={openDialog}
                intent={Intent.Primary}
                type="button"
                data-testid="connect-eth-wallet-btn"
              >
                {t('Connect')}
              </TradingButton>
            );
          }}
        />
        {errors.from?.message && (
          <TradingInputError intent="danger">
            {errors.from.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('To (Vega key)')} labelFor="to">
        <AddressField
          pubKeys={pubKeys}
          onChange={() => setValue('to', '')}
          select={
            <TradingSelect {...register('to')} id="to" defaultValue="">
              <option value="" disabled>
                {t('Please select')}
              </option>
              {pubKeys?.length &&
                pubKeys.map((pk) => (
                  <option key={pk} value={pk}>
                    {pk}
                  </option>
                ))}
            </TradingSelect>
          }
          input={
            <TradingInput
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
          <TradingInputError intent="danger" forInput="to">
            {errors.to.message}
          </TradingInputError>
        )}
      </TradingFormGroup>
      <TradingFormGroup label={t('Asset')} labelFor="asset">
        <Controller
          control={control}
          name="asset"
          rules={{
            validate: {
              required: (value) => !!selectedAsset || required(value),
            },
          }}
          render={({ field }) => (
            <TradingRichSelect
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
              {availableAssets.map((asset) => (
                <AssetOption
                  asset={asset}
                  key={asset.id}
                  balance={
                    isActive && account && <AssetBalance asset={asset} />
                  }
                />
              ))}
            </TradingRichSelect>
          )}
        />
        {errors.asset?.message && (
          <TradingInputError intent="danger" forInput="asset">
            {errors.asset.message}
          </TradingInputError>
        )}
        {isActive && isFaucetable && selectedAsset && (
          <UseButton onClick={submitFaucet}>
            {t('Get {{assetSymbol}}', { assetSymbol: selectedAsset.symbol })}
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
      </TradingFormGroup>
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
        <TradingFormGroup label={t('Amount')} labelFor="amount">
          <TradingInput
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
                      "You can't deposit more than your approved deposit amount, {{amount}} {{assetSymbol}}",
                      {
                        amount: formatNumber(allowance.toString()),
                        assetSymbol: selectedAsset?.symbol || ' ',
                      }
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
                  if (balances.max.isGreaterThan(0) && !balances.exempt) {
                    lifetimeLimit = balances.max.minus(balances.deposited);
                  }

                  if (value.isGreaterThan(lifetimeLimit)) {
                    return t(
                      "You can't deposit more than your remaining deposit allowance, {{amount}} {{assetSymbol}}",
                      {
                        amount: formatNumber(lifetimeLimit.toString()),
                        assetSymbol: selectedAsset?.symbol || ' ',
                      }
                    );
                  }
                  return true;
                },
                balance: (v) => {
                  const value = new BigNumber(v);
                  const balance = new BigNumber(balances?.balance || 0);
                  if (value.isGreaterThan(balance)) {
                    return t(
                      "You can't deposit more than you have in your Ethereum wallet,  {{amount}} {{assetSymbol}}",
                      {
                        amount: formatNumber(balance),
                        assetSymbol: selectedAsset?.symbol || ' ',
                      }
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
            <TradingInputError intent="danger" forInput="amount">
              {errors.amount.message}
            </TradingInputError>
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
        </TradingFormGroup>
      )}
      {wrongChain ? (
        <div className="mb-4">
          <Notification
            intent={Intent.Danger}
            message={t('Switch network in your wallet to {{chain}}', {
              chain: getChainName(Number(selectedAssetChainId)),
            })}
          />
        </div>
      ) : (
        <ApproveNotification
          isActive={isActive}
          approveTxId={approveTxId}
          selectedAsset={selectedAsset}
          onApprove={(amount) => {
            submitApprove(amount);
            setApproveNotificationIntent(Intent.Warning);
          }}
          balances={balances}
          approved={approved}
          intent={approveNotificationIntent}
          amount={amount}
        />
      )}
      <FormButton
        approved={approved}
        isActive={isActive}
        selectedAsset={selectedAsset}
      />
    </form>
  );
};

interface FormButtonProps {
  approved: boolean;
  selectedAsset: AssetFieldsFragment | undefined;
  isActive: boolean;
}

const FormButton = ({ approved, selectedAsset, isActive }: FormButtonProps) => {
  const t = useT();

  return (
    <TradingButton
      type="submit"
      data-testid="deposit-submit"
      fill
      disabled={!isActive}
    >
      {t('Deposit')}
    </TradingButton>
  );
};

type UseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const UseButton = (props: UseButtonProps) => {
  return (
    <button
      {...props}
      type="button"
      className="absolute right-0 top-0 ml-auto text-sm underline"
    />
  );
};

const DisconnectEthereumButton = ({
  onDisconnect,
}: {
  onDisconnect: () => void;
}) => {
  const t = useT();
  const { connector } = useWeb3React();
  const [, , removeEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);
  const disconnect = useWeb3Disconnect(connector);

  return (
    <ButtonLink
      onClick={() => {
        disconnect();
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
  const t = useT();
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
          className="absolute right-0 top-0 ml-auto text-sm underline"
          data-testid="enter-pubkey-manually"
        >
          {isInput ? t('Select from wallet') : t('Enter manually')}
        </button>
      )}
    </>
  );
};
