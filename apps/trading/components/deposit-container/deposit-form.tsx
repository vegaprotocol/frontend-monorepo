import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAccount,
  useDisconnect,
  useAccountEffect,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { type Squid } from '@0xsquid/sdk';
import { ChainType } from '@0xsquid/sdk/dist/types';

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
  TradingRichSelectValue,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Emblem } from '@vegaprotocol/emblem';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';
import {
  ETHEREUM_ADDRESS_REGEX,
  VEGA_ID_REGEX,
  removeDecimal,
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
import { AssetBalance, AssetOption } from '../asset-option';
import { useEthersSigner } from './use-ethers-signer';
import {
  ArbitrumSquidReceiver,
  CollateralBridge,
  Token,
  prepend0x,
} from '@vegaprotocol/smart-contracts';
import { ARBITRUM_SQUID_RECEIVER_ADDRESS } from './constants';
import { type ethers } from 'ethers';
import { FormSecondaryActionLink } from '../form-secondary-action/form-secondary-action';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;
type FormFields = z.infer<typeof depositSchema>;

const depositSchema = z.object({
  fromAddress: z.string().regex(ETHEREUM_ADDRESS_REGEX, 'Connect wallet'),
  fromChain: z.string(),
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
  assets: Array<AssetERC20>;
  initialAssetId: string;
  configs: Configs;
}) => {
  const t = useT();
  const { pubKeys } = useVegaWallet();
  const { open: openAssetDialog } = useAssetDetailsDialogStore();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const signer = useEthersSigner();
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

  const chainIdVal = useWatch({ name: 'fromChain', control: form.control });
  const amount = useWatch({ name: 'amount', control: form.control });
  const fromAssetAddress = useWatch({
    name: 'fromAsset',
    control: form.control,
  });
  const toAssetId = useWatch({ name: 'toAsset', control: form.control });

  const tokens = squid.tokens?.filter((t) => {
    if (!chainIdVal) return false;
    if (t.chainId === chainIdVal) return true;
    return false;
  });

  const chain = squid.chains.find((c) => c.chainId === chainIdVal);
  const fromAsset = tokens?.find((t) => t.address === fromAssetAddress);
  const toAsset = assets?.find((a) => a.id === toAssetId);

  // Data relating to the select asset, like balance on address, allowance
  const { data, queryKey } = useAssetReadContracts({ asset: toAsset, configs });

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
      onSubmit={form.handleSubmit(async (fields) => {
        const fromAsset = tokens.find(
          (t) => t.address === fields.fromAsset && t.chainId === chainIdVal
        );
        const toAsset = assets?.find((a) => a.id === fields.toAsset);

        if (!toAsset || toAsset.source.__typename !== 'ERC20') {
          throw new Error('invalid asset');
        }

        const config = configs.find(
          (c) => c.chain_id === toAsset.source.chainId
        );

        if (!config) {
          throw new Error(`no bridge for toAsset ${toAsset.id}`);
        }

        // The default bridgeAddress for the selected toAsset if an arbitrum
        // to asset is selected will get changed to the squid receiver address
        let bridgeAddress = config.collateral_bridge_contract
          .address as `0x${string}`;

        if (!fromAsset) {
          throw new Error('no from asset');
        }

        if (!signer) {
          throw new Error('no signer');
        }

        if (Number(fromAsset.chainId) !== chainId) {
          await switchChainAsync({ chainId: Number(fromAsset.chainId) });
        }

        if (fromAsset.address === toAsset.source.contractAddress) {
          // Same asset, no swap required, use normal ethereum bridge
          // or normal arbitrum bridge to swap
          submitDeposit({
            asset: toAsset,
            bridgeAddress,
            amount: fields.amount,
            toPubKey: fields.toPubKey,
            requiredConfirmations: config?.confirmations || 1,
          });
        } else {
          // Swapping using squid

          try {
            const fromAmount = removeDecimal(fields.amount, fromAsset.decimals);
            const tokenContract = new Token(
              toAsset.source.contractAddress,
              signer
            );

            let approveCallData;
            let depositCallData;

            if (toAsset.source.chainId === '42161') {
              bridgeAddress = ARBITRUM_SQUID_RECEIVER_ADDRESS;
              // its arbitrum, use the arbitrum squid receiver contract
              approveCallData = tokenContract.encodeApproveData(
                bridgeAddress,
                fromAmount
              );
              const contract = new ArbitrumSquidReceiver(bridgeAddress);
              depositCallData = contract.encodeDepositData(
                toAsset.source.contractAddress,
                '0',
                prepend0x(fields.toPubKey),
                address as string
              );
            } else {
              approveCallData = tokenContract.encodeApproveData(
                bridgeAddress,
                fromAmount
              );
              const contract = new CollateralBridge(bridgeAddress, signer);
              depositCallData = contract.encodeDepositData(
                toAsset.source.contractAddress,
                '0',
                prepend0x(fields.toPubKey)
              );
            }

            const { route, requestId } = await squid.getRoute({
              fromAddress: address,
              fromChain: fields.fromChain,
              fromToken: fields.fromAsset,
              fromAmount,
              toChain: toAsset.source.chainId,
              toToken: toAsset.source.contractAddress,
              toAddress: address,
              // @ts-expect-error slippageConfig is used in v2 but types are incorrect
              slippageConfig: {
                autoMode: 1,
              },
              quoteOnly: false,
              enableBoost: true,
              postHook: {
                chainType: ChainType.EVM,
                calls: [
                  {
                    chainType: ChainType.EVM,
                    callType: 1, // SquidCallType.FULL_TOKEN_BALANCE
                    target: toAsset.source.contractAddress as `0x${string}`,
                    value: '0', // this will be replaced by the full native balance of the multicall after the swap
                    callData: approveCallData,
                    payload: {
                      tokenAddress: toAsset.source
                        .contractAddress as `0x${string}`,
                      inputPos: 1,
                    },
                    estimatedGas: '50000',
                  },
                  {
                    chainType: ChainType.EVM,
                    callType: 1, // SquidCallType.FULL_TOKEN_BALANCE
                    target: ARBITRUM_SQUID_RECEIVER_ADDRESS,
                    value: '0',
                    callData: depositCallData,
                    payload: {
                      tokenAddress: toAsset.source
                        .contractAddress as `0x${string}`,
                      inputPos: 1,
                    },
                    estimatedGas: '50000',
                  },
                ],
                description: 'sample',
                logoURI:
                  'https://v2.app.squidrouter.com/images/icons/squid_logo.svg',
                provider: address as string,
              },
            });
            const tx = (await squid.executeRoute({
              signer,
              route,
            })) as unknown as ethers.providers.TransactionResponse;
            const txReceipt = await tx.wait();

            // eslint-disable-next-line
            console.log(requestId, route, tx, txReceipt);
          } catch (err) {
            console.error(err);
          }
        }
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
          name="fromChain"
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
                      <div className="w-full flex items-center gap-2 h-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={t('Logo for {{name}}', { name: c.networkName })}
                          src={c.chainIconURI}
                          width="30"
                          height="30"
                          className="rounded-full bg-gs-600 border-gs-600 border-2"
                        />
                        <div className="text-sm text-left leading-4">
                          <div>{c.networkName}</div>
                          <div className="text-secondary text-xs">
                            {c.chainId}
                          </div>
                        </div>
                      </div>
                    </TradingRichSelectOption>
                  );
                })}
              </TradingRichSelect>
            );
          }}
        />
        {form.formState.errors.fromChain?.message && (
          <TradingInputError>
            {form.formState.errors.fromChain.message}
          </TradingInputError>
        )}
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
                  valueElement={
                    fromAsset && (
                      <TradingRichSelectValue placeholder="Select asset">
                        <div className="w-full flex items-center gap-2 h-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={t('Logo for {{name}}', {
                              name: fromAsset.name,
                            })}
                            src={fromAsset.logoURI}
                            width="30"
                            height="30"
                            className="rounded-full bg-gs-600 border-gs-600 border-2"
                          />
                          <div className="text-sm text-left leading-4">
                            <div>
                              {fromAsset.name} {fromAsset.symbol}
                            </div>
                            <div className="text-secondary text-xs">
                              {fromAsset.address}
                            </div>
                          </div>
                          <div className="ml-auto text-sm">
                            <AssetBalance
                              chainId={fromAsset.chainId}
                              address={fromAsset.address}
                            />
                          </div>
                        </div>
                      </TradingRichSelectValue>
                    )
                  }
                >
                  {tokens.map((token) => {
                    return (
                      <TradingRichSelectOption
                        value={token.address}
                        key={`${token.chainId}-${token.address}`}
                      >
                        <div className="w-full flex items-center gap-2 h-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={t('Logo for {{name}}', { name: token.name })}
                            src={token.logoURI}
                            width="30"
                            height="30"
                            className="rounded-full bg-gs-600 border-gs-600 border-2"
                          />
                          <div className="text-sm text-left leading-4">
                            <div>
                              {token.name} {token.symbol}
                            </div>
                            <div className="text-secondary text-xs">
                              {token.address}
                            </div>
                          </div>
                        </div>
                      </TradingRichSelectOption>
                    );
                  })}
                </TradingRichSelect>
              );
            }}
          />
          {form.formState.errors.fromAsset?.message && (
            <TradingInputError>
              {form.formState.errors.fromAsset.message}
            </TradingInputError>
          )}
        </div>
        {fromAsset && chain && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionLink
              href={
                new URL(
                  `address/${fromAsset.address}`,
                  chain.blockExplorerUrls[0]
                ).href
              }
              target="_blank"
            >
              {t('View asset on explorer')}
            </FormSecondaryActionLink>
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
          {toAsset && !isAssetUSDTArb(toAsset) && (
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
        {toAsset && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => openAssetDialog(toAsset.id)}
            >
              {t('View asset details')}
            </FormSecondaryActionButton>
            <Faucet asset={toAsset} queryKey={queryKey} />
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

        {toAsset && data && data.balanceOf && (
          <FormSecondaryActionWrapper>
            <FormSecondaryActionButton
              onClick={() => {
                const amount = toBigNum(
                  data.balanceOf || '0',
                  toAsset.decimals
                ).toFixed(toAsset.decimals);
                form.setValue('amount', amount, { shouldValidate: true });
              }}
            >
              {t('Use maximum')}
            </FormSecondaryActionButton>
          </FormSecondaryActionWrapper>
        )}
      </FormGroup>
      {toAsset && data && (
        <Approval
          asset={toAsset}
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
