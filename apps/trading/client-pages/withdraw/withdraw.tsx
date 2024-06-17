import { useSearchParams } from 'react-router-dom';
import {
  type EVMBridgeConfig,
  type EthereumConfig,
  useEVMBridgeConfigs,
  useEthereumConfig,
} from '@vegaprotocol/web3';
import {
  AssetFieldsFragment,
  useAssetDetailsDialogStore,
  useEnabledAssets,
} from '@vegaprotocol/assets';
import { z } from 'zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
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
import { type ButtonHTMLAttributes } from 'react';
import { toBigNum } from '@vegaprotocol/utils';
import { zodResolver } from '@hookform/resolvers/zod';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;

export const Withdraw = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;

  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { data: assets } = useEnabledAssets();

  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  const asset = assets?.find((a) => a.id === assetId);

  return (
    <WithdrawForm
      assets={assets || []}
      initialAssetId={asset?.id || ''}
      configs={allConfigs}
    />
  );
};

const withdrawSchema = z.object({
  assetId: z.string().min(1, 'Required'),
  fromPubKey: z.string().regex(/^[A-Fa-f0-9]{64}$/i, 'Invalid key'),
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
  assets,
  initialAssetId,
  configs,
}: {
  assets: AssetFieldsFragment[];
  initialAssetId: string;
  configs: Configs;
}) => {
  const { pubKey, pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const form = useForm<FormFields>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      fromPubKey: pubKey,
      assetId: initialAssetId,
      toAddress: address,
    },
  });

  const assetId = useWatch({ name: 'assetId', control: form.control });
  const asset = assets?.find((a) => a.id === assetId);

  const submitDeposit = (fields: FormFields) => {
    console.log(fields);
  };

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('toAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('toAddress', ''),
  });

  return (
    <form onSubmit={form.handleSubmit(submitDeposit)}>
      <FormGroup label="From (Vega key)" labelFor="fromPubKey">
        <Select {...form.register('fromPubKey')}>
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
                {assets.map((a) => {
                  return (
                    <TradingOption value={a.id} key={a.id}>
                      {a.id}
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
        {asset && (
          <UseButton onClick={() => openAssetDialog(asset.id)}>
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

        {asset && (
          <UseButton
            onClick={() => {
              const amount = toBigNum(
                '0', // TODO: get account balance
                asset.decimals
              ).toFixed(asset.decimals);
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
