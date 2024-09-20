import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useChainId } from 'wagmi';
import { type Squid } from '@0xsquid/sdk';
import { type Estimate } from '@0xsquid/squid-types';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { Button, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

import { useT } from '../../lib/use-t';

import { useAssetReadContracts } from './use-asset-read-contracts';
import { useSquidRoute } from './use-squid-route';
import { SwapInfo } from './swap-info';
import { type FormFields, formSchema, type Configs } from './form-schema';
import { useNativeBalance } from './use-native-balance';
import * as Fields from './fields';
import BigNumber from 'bignumber.js';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { FeedbackDialog, SquidFeedbackDialog } from './feedback-dialog';
import { useEvmSquidDeposit } from 'apps/trading/lib/hooks/use-evm-squid-deposit';
import { type TxDeposit } from '../../lib/hooks/use-evm-deposit-slice';
import { type TxSquidDeposit } from '../../lib/hooks/use-evm-squid-deposit-slice';

export const DepositForm = ({
  squid,
  assets,
  initialAsset,
  configs,
  onDeposit,
}: {
  squid: Squid;
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
  onDeposit?: (tx: TxDeposit | TxSquidDeposit) => void;
}) => {
  const { pubKey, pubKeys } = useVegaWallet();
  const { address } = useAccount();

  const chainId = useChainId();
  const defaultChain = squid.chains.find((c) => c.chainId === String(chainId));

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromAddress: address,
      fromChain: defaultChain && defaultChain.chainId,
      fromAsset: '',
      // fromAddress is just derived from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      toAsset: initialAsset?.id,
      toPubKey: pubKey,
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
  const fromAsset = tokens?.find((t) => t.address === fields.toAsset);

  // Data relating to the selected from asset, like balance on address and allowance
  // Only relevant if the asset is not a the chains native asset
  const { data: balanceData, queryKey: balanceDataQueryKey } =
    useAssetReadContracts({
      token: fromAsset,
      configs,
    });

  // Because the read contracts above don't work with native balances we need to
  // separately get the native token balance
  const { data: nativeBalance } = useNativeBalance({
    address,
    chainId: fields.fromChain,
  });

  // Check if the from and to asset are the same, if not then we will be using
  // squid to swap and then deposit via a post hook
  const isSwap =
    fields.fromAsset && toAsset
      ? fields.fromAsset.toLowerCase() !==
        toAsset?.source.contractAddress.toLowerCase()
      : undefined;

  const {
    data: routeData,
    error: routeError,
    isFetching,
  } = useSquidRoute({
    form,
    toAsset,
    enabled: isSwap,
  });

  const deposit = useEvmDeposit();
  const squidDeposit = useEvmSquidDeposit();

  return (
    <FormProvider {...form}>
      <form
        data-testid="deposit-form"
        onSubmit={form.handleSubmit(async (fields) => {
          // Get full details of the chosen assets
          const fromAsset = tokens.find(
            (t) =>
              t.address === fields.fromAsset && t.chainId === fields.fromChain
          );
          const toAsset = assets?.find((a) => a.id === fields.toAsset);

          if (!toAsset || toAsset.source.__typename !== 'ERC20') {
            throw new Error('no to asset');
          }

          if (!fromAsset) {
            throw new Error('no from asset');
          }

          const isSwapRequired =
            fromAsset.address.toLowerCase() !==
            toAsset.source.contractAddress.toLowerCase();

          if (isSwapRequired) {
            const res = await squidDeposit.write({
              asset: toAsset,
              amount: fields.amount,
              toPubKey: fields.toPubKey,
              routeData,
              chainId: Number(fields.fromChain),
            });
            onDeposit && onDeposit(res);
          } else {
            // Same asset, no swap required, use normal ethereum bridge
            // or normal arbitrum bridge to swap

            // Find the matching config for the selected asset
            const config = configs.find(
              (c) => c.chain_id === toAsset.source.chainId
            );

            if (!config) {
              throw new Error(`no bridge for toAsset ${toAsset.id}`);
            }

            const res = await deposit.write({
              asset: toAsset,
              bridgeAddress: config.collateral_bridge_contract
                .address as `0x${string}`,
              amount: fields.amount,
              allowance: (balanceData?.allowance || BigNumber(0)).toString(),
              toPubKey: fields.toPubKey,
              chainId: Number(config.chain_id),
              requiredConfirmations: config.confirmations,
            });
            onDeposit && onDeposit(res);
          }
        })}
      >
        <Fields.FromAddress control={form.control} />
        <Fields.FromChain
          control={form.control}
          chains={squid.chains}
          tokens={squid.tokens}
        />
        <Fields.FromAsset
          control={form.control}
          tokens={tokens}
          chain={chain}
        />
        <Fields.Amount
          control={form.control}
          balanceOf={balanceData?.balanceOf}
          nativeBalanceOf={nativeBalance}
        />
        <Fields.ToPubKey control={form.control} pubKeys={pubKeys} />
        <Fields.ToAsset
          control={form.control}
          assets={assets}
          toAsset={toAsset}
          queryKey={balanceDataQueryKey}
          route={routeData?.route}
        />
        {isSwap && (
          <div className="mb-4">
            <SwapInfo route={routeData?.route} error={routeError} />
          </div>
        )}
        <SubmitButton
          isSwap={isSwap}
          isFetchingRoute={isFetching}
          // isExecuting={squidDeposit.data.status !== 'idle'}
          estimate={routeData?.route.estimate}
        />
        {!isSwap && (
          <FeedbackDialog data={deposit.data} onChange={deposit.reset} />
        )}
        {isSwap && (
          <SquidFeedbackDialog
            data={squidDeposit.data}
            onChange={squidDeposit.reset}
          />
        )}
      </form>
    </FormProvider>
  );
};

const SubmitButton = (props: {
  isSwap?: boolean;
  isFetchingRoute?: boolean;
  isExecuting?: boolean;
  estimate?: Estimate;
}) => {
  const t = useT();

  let text = t('Deposit');

  if (props.isSwap && props.estimate) {
    text = t('Deposit {{amount}} {{symbol}}', {
      amount: addDecimalsFormatNumber(
        props.estimate.toAmount,
        props.estimate.toToken.decimals
      ),
      symbol: props.estimate.toToken.symbol,
    });
  }

  if (props.isFetchingRoute) {
    text = t('Calculating route');
  }

  if (props.isExecuting) {
    text = t('Depositing...');
  }

  return (
    <Button
      type="submit"
      size="lg"
      fill={true}
      intent={Intent.Secondary}
      disabled={props.isFetchingRoute || props.isExecuting}
      className="flex gap-2 items-center"
    >
      {text}
      {props.isExecuting && <Loader size="small" />}
    </Button>
  );
};
