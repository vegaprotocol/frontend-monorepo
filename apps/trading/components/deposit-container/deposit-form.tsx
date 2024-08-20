import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAccount,
  useAccountEffect,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { type Squid } from '@0xsquid/sdk';
import { ChainType } from '@0xsquid/sdk/dist/types';

import {
  ArbitrumSquidReceiver,
  CollateralBridge,
  Token,
  prepend0x,
} from '@vegaprotocol/smart-contracts';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';
import {
  ETHEREUM_ADDRESS_REGEX,
  VEGA_ID_REGEX,
  removeDecimal,
} from '@vegaprotocol/utils';

import { useT } from '../../lib/use-t';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { Approval } from './approval';
import { useAssetReadContracts } from './use-asset-read-contracts';
import { useEthersSigner } from './use-ethers-signer';

import { ARBITRUM_SQUID_RECEIVER_ADDRESS } from './constants';
import { type ethers } from 'ethers';

import * as Fields from './fields';

type Configs = Array<EthereumConfig | EVMBridgeConfig>;
export type FormFields = z.infer<typeof depositSchema>;

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

  const { address } = useAccount();
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
    <FormProvider {...form}>
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
              const fromAmount = removeDecimal(
                fields.amount,
                fromAsset.decimals
              );
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
                fromAddress: address as `0x${string}`,
                fromChain: fields.fromChain,
                fromToken: fields.fromAsset,
                fromAmount,
                toChain: toAsset.source.chainId,
                toToken: toAsset.source.contractAddress,
                toAddress: address as `0x${string}`,
                // @ts-ignore invalid types from squid
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
        <Fields.FromAddress control={form.control} />
        <Fields.FromChain control={form.control} chains={squid.chains} />
        <Fields.FromAsset
          control={form.control}
          tokens={tokens}
          fromAsset={fromAsset}
          chain={chain}
        />
        <Fields.Amount
          control={form.control}
          toAsset={toAsset}
          balanceOf={data?.balanceOf}
        />
        <Fields.ToPubKey control={form.control} pubKeys={pubKeys} />
        <Fields.ToAsset
          control={form.control}
          assets={assets}
          toAsset={toAsset}
          queryKey={queryKey}
        />
        {toAsset && data && (
          <Approval
            asset={toAsset}
            amount={amount}
            data={data}
            configs={configs}
            queryKey={queryKey}
          />
        )}
        <Button type="submit" size="lg" fill={true} intent={Intent.Secondary}>
          {t('Deposit')}
        </Button>
      </form>
    </FormProvider>
  );
};
