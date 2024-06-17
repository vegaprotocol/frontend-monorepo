import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { z } from 'zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  useDialogStore,
  useVegaWallet,
  useWallet,
} from '@vegaprotocol/wallet-react';
import { useAccount, useAccountEffect, useDisconnect } from 'wagmi';
import {
  FormGroup,
  TradingSelect as Select,
  TradingInput as Input,
  TradingButton,
  truncateMiddle,
  TradingInputError,
  Intent,
  TradingRichSelect,
  TradingOption,
} from '@vegaprotocol/ui-toolkit';
import { ConnectKitButton } from 'connectkit';
import { useEffect, type ButtonHTMLAttributes } from 'react';
import {
  addDecimalsFormatNumber,
  removeDecimal,
  toBigNum,
} from '@vegaprotocol/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Account, useAccounts } from '@vegaprotocol/accounts';
import { AccountType } from '@vegaprotocol/types';
import { EmblemByAsset } from '@vegaprotocol/emblem';

export const WithdrawContainer = ({
  initialAssetId,
}: {
  initialAssetId?: string;
}) => {
  const { pubKey } = useVegaWallet();
  const { data } = useAccounts(pubKey);

  const accounts = data?.filter(
    (a) => a.type === AccountType.ACCOUNT_TYPE_GENERAL
  );
  const account = accounts?.find((a) => a.asset.id === initialAssetId);
  const asset = account?.asset;

  return (
    <WithdrawForm accounts={accounts || []} initialAssetId={asset?.id || ''} />
  );
};

const withdrawSchema = z.object({
  assetId: z.string().min(1, 'Required'),
  fromPubKey: z.string().regex(/^[A-Fa-f0-9]{64}$/i, 'Connect Vega wallet'),
  toAddress: z.string().min(1, 'Enter address or connect wallet'),
  // Use a string but parse it as a number for validation
  amount: z.string().refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && n >= 0 && v?.length > 0;
    },
    { message: 'Invalid number' }
  ),
});

type FormFields = z.infer<typeof withdrawSchema>;

const WithdrawForm = ({
  accounts,
  initialAssetId,
}: {
  accounts: Account[];
  initialAssetId: string;
}) => {
  const vegaChainId = useWallet((store) => store.chainId);
  const { pubKey, pubKeys } = useVegaWallet();
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const createTransaction = useVegaTransactionStore((state) => state.create);

  const form = useForm<FormFields>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      fromPubKey: pubKey,
      assetId: initialAssetId,
      toAddress: address,
    },
  });

  const assetId = useWatch({ name: 'assetId', control: form.control });
  const account = accounts?.find((a) => a.asset.id === assetId);

  const submitDeposit = (fields: FormFields) => {
    if (!account) {
      throw new Error('no account for withdraw');
    }

    createTransaction({
      withdrawSubmission: {
        amount: removeDecimal(fields.amount, account.asset.decimals),
        asset: fields.assetId,
        ext: {
          erc20: {
            receiverAddress: fields.toAddress,
          },
        },
      },
    });
  };

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('toAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('toAddress', ''),
  });

  // Update the form field when pubKeys change
  useEffect(() => {
    if (pubKeys.length) {
      form.setValue('fromPubKey', pubKeys[0].publicKey, {
        shouldValidate: true,
      });
    } else {
      form.setValue('fromPubKey', '');
    }
  }, [pubKeys, form]);

  return (
    <form onSubmit={form.handleSubmit(submitDeposit)}>
      <FormGroup label="From (Vega key)" labelFor="fromPubKey">
        <Controller
          name="fromPubKey"
          control={form.control}
          render={({ field }) => {
            if (!pubKeys.length) {
              return (
                <TradingButton
                  intent={Intent.Info}
                  size="small"
                  onClick={() => openVegaWalletDialog()}
                >
                  Connect
                </TradingButton>
              );
            }

            return (
              <Select
                name="fromPubKey"
                value={field.value}
                onChange={field.onChange}
              >
                <option value="" disabled>
                  Please select
                </option>
                {pubKeys.map((k) => {
                  return (
                    <option key={k.publicKey} value={k.publicKey}>
                      {k.name} {truncateMiddle(k.publicKey)}
                    </option>
                  );
                })}
              </Select>
            );
          }}
        />
        {form.formState.errors.fromPubKey?.message && (
          <TradingInputError>
            {form.formState.errors.fromPubKey.message}
          </TradingInputError>
        )}
      </FormGroup>
      <FormGroup label="Asset" labelFor="asset">
        <Controller
          name="assetId"
          control={form.control}
          render={({ field }) => {
            return (
              <TradingRichSelect
                placeholder="Select asset"
                value={field.value}
                onValueChange={field.onChange}
              >
                {accounts.map((a) => {
                  return (
                    <TradingOption value={a.asset.id} key={a.asset.id}>
                      <div className="w-full flex items-start gap-2">
                        <EmblemByAsset
                          asset={a.asset.id}
                          vegaChain={vegaChainId}
                        />
                        <div className="text-xs text-left">
                          <div>{a.asset.name}</div>
                          <div>
                            {a.asset.symbol}{' '}
                            {a.asset.source.__typename === 'ERC20'
                              ? truncateMiddle(a.asset.source.contractAddress)
                              : a.asset.source.__typename}
                          </div>
                        </div>
                        <div className="ml-auto self-end text-xs">
                          {addDecimalsFormatNumber(a.balance, a.asset.decimals)}
                        </div>
                      </div>
                    </TradingOption>
                  );
                })}
              </TradingRichSelect>
            );
          }}
        />
        {form.formState.errors.assetId?.message && (
          <TradingInputError>
            {form.formState.errors.assetId.message}
          </TradingInputError>
        )}
        {account && (
          <UseButton onClick={() => openAssetDialog(account.asset.id)}>
            View asset details
          </UseButton>
        )}
      </FormGroup>
      <FormGroup label="To address" labelFor="toAddress">
        <Controller
          name="toAddress"
          control={form.control}
          render={({ field }) => {
            return (
              <>
                <Input value={field.value} onChange={field.onChange} />
                {isConnected ? (
                  <UseButton onClick={() => disconnect()}>Disconnect</UseButton>
                ) : (
                  <ConnectKitButton.Custom>
                    {({ show }) => {
                      return (
                        <UseButton
                          type="button"
                          onClick={() => {
                            if (show) show();
                          }}
                        >
                          Connect
                        </UseButton>
                      );
                    }}
                  </ConnectKitButton.Custom>
                )}
              </>
            );
          }}
        />
        {form.formState.errors.toAddress?.message && (
          <TradingInputError>
            {form.formState.errors.toAddress.message}
          </TradingInputError>
        )}
      </FormGroup>
      <FormGroup label="Amount" labelFor="amount">
        <Input {...form.register('amount')} />
        {form.formState.errors.amount?.message && (
          <TradingInputError>
            {form.formState.errors.amount.message}
          </TradingInputError>
        )}

        {account && (
          <UseButton
            onClick={() => {
              const amount = toBigNum(
                account.balance,
                account.asset.decimals
              ).toFixed(account.asset.decimals);
              form.setValue('amount', amount, { shouldValidate: true });
            }}
          >
            Use maximum
          </UseButton>
        )}
      </FormGroup>
      <TradingButton
        type="submit"
        size="large"
        fill={true}
        intent={Intent.Secondary}
      >
        Submit
      </TradingButton>
    </form>
  );
};

const UseButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      type="button"
      className="absolute right-0 top-0 pt-0.5 ml-auto text-xs underline underline-offset-4"
    />
  );
};
