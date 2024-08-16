import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccount, useDisconnect, useAccountEffect, useChainId } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { type Squid } from '@0xsquid/sdk';

import {
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
  TradingRichSelect,
  TradingRichSelectOption,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Emblem } from '@vegaprotocol/emblem';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';
import {
  ETHEREUM_ADDRESS_REGEX,
  VEGA_ID_REGEX,
  toBigNum,
} from '@vegaprotocol/utils';

import { useT } from '../../lib/use-t';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import {
  FormSecondaryActionButton,
  FormSecondaryActionWrapper,
} from '../form-secondary-action';
import { VegaKeySelect } from './vega-key-select';
import { Approval } from './approval';
import { useAssetReadContracts } from './use-asset-read-contracts';
import { Faucet } from './faucet';
import { isAssetUSDTArb } from '../../lib/utils/is-asset-usdt-arb';
import { AssetOption } from '../asset-option';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;
type FormFields = z.infer<typeof depositSchema>;

const depositSchema = z.object({
  fromAddress: z.string().regex(ETHEREUM_ADDRESS_REGEX, 'Connect wallet'),
  chainId: z.string(),
  fromAsset: z.string(),
  toAsset: z.string().regex(VEGA_ID_REGEX, 'Required'),
  toPubKey: z.string().regex(VEGA_ID_REGEX, 'Invalid key'),
  // Use a string but parse it as a number for validation
  amount: z.string().refine(
    (v) => {
      const n = Number(v);

      if (v?.length <= 0) return false;
      if (isNaN(n)) return false;
      if (n <= 0) return false;

      return true;
    },
    { message: 'Invalid number' }
  ),
});

export const DepositForm = ({
  squid,
  assets,
  initialAssetId,
  configs,
}: {
  squid: Squid;
  assets: Array<AssetERC20 & { balance: string }>;
  initialAssetId: string;
  configs: Configs;
}) => {
  // eslint-disable-next-line
  console.log(squid);
  const t = useT();
  const { pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const form = useForm<FormFields>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      // fromAddress is just derived from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      fromAddress: address,
      toAsset: initialAssetId,
      toPubKey: '',
      amount: '',
    },
  });

  const chainIdVal = useWatch({ name: 'chainId', control: form.control });
  const amount = useWatch({ name: 'amount', control: form.control });
  const assetId = useWatch({ name: 'toAsset', control: form.control });
  const tokens = squid.tokens?.filter((t) => {
    if (!chainIdVal) return true;
    if (t.chainId === chainIdVal) return true;
    return false;
  });
  const asset = assets?.find((a) => a.id === assetId);

  // Data relating to the select asset, like balance on address, allowance
  const { data, queryKey } = useAssetReadContracts({ asset, configs });

  const { submitDeposit } = useEvmDeposit({ queryKey });

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('fromAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('fromAddress', ''),
  });

  return (
    <form
      data-testid="deposit-form"
      onSubmit={form.handleSubmit((fields) => {
        const asset = assets?.find((a) => a.id === fields.toAsset);

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
                <div className="flex items-center gap-1">
                  <Emblem chainId={chainId} />
                  <input
                    value={address}
                    readOnly
                    className="appearance-none bg-transparent text-sm text-muted w-full focus:outline-none"
                    tabIndex={-1}
                  />
                  <FormSecondaryActionWrapper>
                    <FormSecondaryActionButton onClick={() => disconnect()}>
                      {t('Disconnect')}
                    </FormSecondaryActionButton>
                  </FormSecondaryActionWrapper>
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
      <FormGroup label="From chain" labelFor="chain">
        <Controller
          name="chainId"
          control={form.control}
          render={({ field }) => {
            return (
              <TradingRichSelect
                placeholder="Select chain"
                value={field.value}
                onValueChange={field.onChange}
              >
                {squid.chains.map((c) => {
                  return (
                    <TradingRichSelectOption value={c.chainId} key={c.chainId}>
                      <div className="text-sm text-left leading-4">
                        <div>{c.networkName}</div>
                        <div className="text-secondary text-xs">
                          {c.chainId}
                        </div>
                      </div>
                    </TradingRichSelectOption>
                  );
                })}
              </TradingRichSelect>
            );
          }}
        />
      </FormGroup>
      <FormGroup label="From asset" labelFor="asset">
        <div className="flex flex-col gap-1">
          <Controller
            name="fromAsset"
            control={form.control}
            render={({ field }) => {
              return (
                <TradingRichSelect
                  placeholder="Select asset"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {tokens.map((t) => {
                    return (
                      <TradingRichSelectOption
                        value={t.address}
                        key={t.address}
                      >
                        <div className="text-sm text-left leading-4">
                          <div>{t.name}</div>
                          <div className="text-secondary text-xs">
                            {t.address}
                          </div>
                        </div>
                      </TradingRichSelectOption>
                    );
                  })}
                </TradingRichSelect>
              );
            }}
          />
          {asset && !isAssetUSDTArb(asset) && (
            <TradingInputError intent="warning">
              {t(
                'The majority of markets on the network settle in USDT Arb. Are you sure you wish to deposit the selected asset?'
              )}
            </TradingInputError>
          )}
          {form.formState.errors.fromAsset?.message && (
            <TradingInputError>
              {form.formState.errors.fromAsset.message}
            </TradingInputError>
          )}
        </div>
        {asset && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => openAssetDialog(asset.id)}
            >
              {t('View asset details')}
            </FormSecondaryActionButton>
            <Faucet asset={asset} queryKey={queryKey} />
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
                        <TradingRichSelectOption
                          value={k.publicKey}
                          key={k.publicKey}
                        >
                          <div className="leading-4">
                            <div>{k.name}</div>
                            <div className="text-xs text-secondary">
                              {truncateMiddle(k.publicKey)}
                            </div>
                          </div>
                        </TradingRichSelectOption>
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
      <FormGroup label="To asset" labelFor="asset">
        <div className="flex flex-col gap-1">
          <Controller
            name="toAsset"
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
                      <TradingRichSelectOption value={a.id} key={a.id}>
                        <AssetOption asset={a} />
                      </TradingRichSelectOption>
                    );
                  })}
                </TradingRichSelect>
              );
            }}
          />
          {asset && !isAssetUSDTArb(asset) && (
            <TradingInputError intent="warning">
              {t(
                'The majority of markets on the network settle in USDT Arb. Are you sure you wish to deposit the selected asset?'
              )}
            </TradingInputError>
          )}
          {form.formState.errors.toAsset?.message && (
            <TradingInputError>
              {form.formState.errors.toAsset.message}
            </TradingInputError>
          )}
        </div>
        {asset && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => openAssetDialog(asset.id)}
            >
              {t('View asset details')}
            </FormSecondaryActionButton>
            <Faucet asset={asset} queryKey={queryKey} />
          </FormSecondaryActionWrapper>
        )}
      </FormGroup>
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
        {t('Deposit')}
      </TradingButton>
    </form>
  );
};
