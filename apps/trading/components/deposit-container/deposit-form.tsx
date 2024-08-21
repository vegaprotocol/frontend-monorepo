import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAccount,
  useAccountEffect,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { type Squid } from '@0xsquid/sdk';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';
import { ETHEREUM_ADDRESS_REGEX, VEGA_ID_REGEX } from '@vegaprotocol/utils';

import { useT } from '../../lib/use-t';
import i18n from '../../lib/i18n';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useAssetReadContracts } from './use-asset-read-contracts';
import { useEthersSigner } from './use-ethers-signer';
import { type ethers } from 'ethers';

import * as Fields from './fields';

import { useSquidRoute } from './use-squid-route';
import { Approval } from './approval';
import { SwapInfo } from './swap-info';

export type Configs = Array<EthereumConfig | EVMBridgeConfig>;
export type FormFields = z.infer<typeof depositSchema>;

export const depositSchema = z.object({
  fromAddress: z
    .string()
    .regex(ETHEREUM_ADDRESS_REGEX, i18n.t('Connect wallet')),
  fromChain: z.string(),
  fromAsset: z.string(),
  toAsset: z.string().regex(VEGA_ID_REGEX),
  toPubKey: z.string().regex(VEGA_ID_REGEX),
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

  const fields = form.watch();

  const tokens = squid.tokens?.filter((t) => {
    if (!fields.fromChain) return false;
    if (t.chainId === fields.fromChain) return true;
    return false;
  });

  const chain = squid.chains.find((c) => c.chainId === fields.fromChain);
  const toAsset = assets?.find((a) => a.id === fields.toAsset);

  // Data relating to the select asset, like balance on address, allowance
  const { data, queryKey } = useAssetReadContracts({ asset: toAsset, configs });

  const { submitDeposit } = useEvmDeposit({ queryKey });

  useAccountEffect({
    onConnect: ({ address }) => {
      form.setValue('fromAddress', address, { shouldValidate: true });
    },
    onDisconnect: () => form.setValue('fromAddress', ''),
  });

  const isSwap =
    fields.fromAsset && toAsset
      ? fields.fromAsset !== toAsset?.source.contractAddress
      : undefined;

  const { data: routeData, isFetching } = useSquidRoute({
    form,
    assets,
    configs,
    enabled: isSwap,
  });

  return (
    <FormProvider {...form}>
      <form
        data-testid="deposit-form"
        onSubmit={form.handleSubmit(async (fields) => {
          const fromAsset = tokens.find(
            (t) =>
              t.address === fields.fromAsset && t.chainId === fields.fromChain
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
          const bridgeAddress = config.collateral_bridge_contract
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
              if (!routeData) {
                throw new Error('no route data');
              }

              const tx = (await squid.executeRoute({
                signer,
                route: routeData.route,
              })) as unknown as ethers.providers.TransactionResponse;
              const txReceipt = await tx.wait();

              // eslint-disable-next-line
              console.log(routeData.requestId, routeData.route, tx, txReceipt);
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
        {!isSwap && toAsset && data && (
          <Approval
            asset={toAsset}
            amount={fields.amount}
            data={data}
            configs={configs}
            queryKey={queryKey}
          />
        )}
        {isSwap && routeData && (
          <div className="mb-2">
            <SwapInfo estimate={routeData.route.estimate} />
          </div>
        )}
        <Button
          type="submit"
          size="lg"
          fill={true}
          intent={Intent.Secondary}
          disabled={isFetching}
        >
          {isFetching ? t('Calculating route') : t('Deposit')}
        </Button>
      </form>
    </FormProvider>
  );
};
