import { z } from 'zod';

import { useAccount, useDisconnect, useAccountEffect } from 'wagmi';

import { ConnectKitButton } from 'connectkit';
import {
  useEnabledAssets,
  useAssetDetailsDialogStore,
  type AssetERC20,
} from '@vegaprotocol/assets';
import {
  FormGroup,
  TradingInput as Input,
  TradingButton,
  truncateMiddle,
  TradingInputError,
  Intent,
  KeyValueTable,
  KeyValueTableRow,
  TradingRichSelect,
  TradingOption,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  addDecimalsFormatNumber,
  formatNumberRounded,
  toBigNum,
} from '@vegaprotocol/utils';
import {
  useEVMBridgeConfigs,
  useEthereumConfig,
  type EVMBridgeConfig,
  type EthereumConfig,
} from '@vegaprotocol/web3';

import { useT } from '../../lib/use-t';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useEvmFaucet } from '../../lib/hooks/use-evm-faucet';

import { VegaKeySelect } from './vega-key-select';
import { AssetOption } from './asset-option';
import { Approval } from './approval';
import { useAssetReadContracts } from './use-asset-read-contracts';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../form-secondary-action';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;

export const DepositContainer = ({
  initialAssetId,
}: {
  initialAssetId?: string;
}) => {
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { data: assets } = useEnabledAssets();

  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  const asset = assets?.find((a) => a.id === initialAssetId);

  return (
    <DepositForm
      assets={
        (assets || []).filter(
          (a) => a.source.__typename === 'ERC20'
        ) as AssetERC20[]
      }
      initialAssetId={asset?.id || ''}
      configs={allConfigs}
    />
  );
};

const depositSchema = z.object({
  fromAddress: z.string().min(1, 'Connect wallet'),
  assetId: z.string().min(1, 'Required'),
  toPubKey: z.string().regex(/^[A-Fa-f0-9]{64}$/i, 'Invalid key'),
  // Use a string but parse it as a number for validation
  amount: z.string().refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && n >= 0 && v?.length > 0;
    },
    { message: 'Invalid number' }
  ),
});

type FormFields = z.infer<typeof depositSchema>;

const DepositForm = ({
  assets,
  initialAssetId,
  configs,
}: {
  assets: Array<AssetERC20>;
  initialAssetId: string;
  configs: Configs;
}) => {
  const t = useT();
  const { pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const form = useForm<FormFields>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      // fromAddress is just dervied from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      fromAddress: address,
      assetId: initialAssetId,
      toPubKey: '',
      amount: '',
    },
  });

  const amount = useWatch({ name: 'amount', control: form.control });
  const assetId = useWatch({ name: 'assetId', control: form.control });
  const asset = assets?.find((a) => a.id === assetId);

  // Data releating to the select asset, like balance on address, allowance
  const { data, queryKey } = useAssetReadContracts({ asset, configs });

  const { submitFaucet } = useEvmFaucet({ queryKey });
  const { submitDeposit } = useEvmDeposit({ queryKey });

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('fromAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('fromAddress', ''),
  });

  return (
    <form
      onSubmit={form.handleSubmit((fields) => {
        const asset = assets?.find((a) => a.id === fields.assetId);

        if (!asset || asset.source.__typename !== 'ERC20') {
          throw new Error('invalid asset');
        }

        const assetChainId = asset.source.chainId;
        const config = configs.find((c) => c.chain_id === assetChainId);
        const bridgeAddress = config?.collateral_bridge_contract
          .address as `0x${string}`;

        submitDeposit({
          asset,
          bridgeAddress,
          amount: fields.amount,
          toPubKey: fields.toPubKey,
          requiredConfirmations: config?.confirmations || 1,
        });
      })}
    >
      <FormGroup label={t('From address')} labelFor="fromAddress">
        <Controller
          name="fromAddress"
          control={form.control}
          render={() => {
            if (isConnected) {
              return (
                <div className="flex flex-col items-start">
                  <input
                    value={address}
                    readOnly
                    className="appearance-none bg-transparent text-sm text-muted w-full focus:outline-none"
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    className="underline underline-offset-4 text-xs"
                    onClick={() => disconnect()}
                  >
                    {t('Disconnect')}
                  </button>
                </div>
              );
            }

            return (
              <ConnectKitButton.Custom>
                {({ show }) => {
                  return (
                    <TradingButton
                      type="button"
                      onClick={() => {
                        if (show) show();
                      }}
                      intent={Intent.Info}
                      size="small"
                    >
                      {t('Connect')}
                    </TradingButton>
                  );
                }}
              </ConnectKitButton.Custom>
            );
          }}
        />
        {form.formState.errors.fromAddress?.message && (
          <TradingInputError>
            {form.formState.errors.fromAddress.message}
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
                      <AssetOption asset={a} />
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
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => openAssetDialog(asset.id)}
            >
              {t('View asset details')}
            </FormSecondaryActionButton>
            <FormSecondaryActionButton onClick={() => submitFaucet({ asset })}>
              {t('Get {{symbol}}', { symbol: asset.symbol })}
            </FormSecondaryActionButton>
          </FormSecondaryActionWrapper>
        )}
      </FormGroup>
      <FormGroup label="To (Vega key)" labelFor="toPubKey">
        <VegaKeySelect
          onChange={() => form.setValue('toPubKey', '')}
          input={<Input {...form.register('toPubKey')} />}
          select={
            <Controller
              name="toPubKey"
              control={form.control}
              render={({ field }) => {
                return (
                  <TradingRichSelect
                    placeholder="Select public key"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {pubKeys.map((k) => {
                      return (
                        <TradingOption value={k.publicKey} key={k.publicKey}>
                          <div className="text-xs">
                            <div>{k.name}</div>
                            <div>{truncateMiddle(k.publicKey)}</div>
                          </div>
                        </TradingOption>
                      );
                    })}
                  </TradingRichSelect>
                );
              }}
            />
          }
        />
        {form.formState.errors.toPubKey?.message && (
          <TradingInputError>
            {form.formState.errors.toPubKey.message}
          </TradingInputError>
        )}
      </FormGroup>
      {data && asset && (
        <div className="pb-4">
          <KeyValueTable>
            <KeyValueTableRow>
              <div>{t('Balance available')}</div>
              <div>
                {addDecimalsFormatNumber(data.balanceOf || '0', asset.decimals)}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>{t('Allowance')}</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.allowance || '0', asset.decimals)
                )}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>{t('Deposit cap')}</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.lifetimeLimit || '0', asset.decimals)
                )}
              </div>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <div>{t('Deposited')}</div>
              <div>
                {formatNumberRounded(
                  toBigNum(data.deposited || '0', asset.decimals)
                )}
              </div>
            </KeyValueTableRow>
          </KeyValueTable>
        </div>
      )}
      <FormGroup label="Amount" labelFor="amount">
        <Input {...form.register('amount')} />
        {form.formState.errors.amount?.message && (
          <TradingInputError>
            {form.formState.errors.amount.message}
          </TradingInputError>
        )}

        {asset && data && data.balanceOf && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => {
                const amount = toBigNum(
                  data.balanceOf || '0',
                  asset.decimals
                ).toFixed(asset.decimals);
                form.setValue('amount', amount, { shouldValidate: true });
              }}
            >
              {t('Use maximum')}
            </FormSecondaryActionButton>
          </FormSecondaryActionWrapper>
        )}
      </FormGroup>
      {asset && data && (
        <Approval
          asset={asset}
          amount={amount}
          data={data}
          configs={configs}
          queryKey={queryKey}
        />
      )}
      <TradingButton
        type="submit"
        size="large"
        fill={true}
        intent={Intent.Secondary}
      >
        {t('Submit')}
      </TradingButton>
    </form>
  );
};
