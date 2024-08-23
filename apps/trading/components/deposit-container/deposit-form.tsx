import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { type Squid } from '@0xsquid/sdk';

import { type AssetERC20 } from '@vegaprotocol/assets';
import {
  Button,
  Intent,
  Loader,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useT } from '../../lib/use-t';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useAssetReadContracts } from './use-asset-read-contracts';

import * as Fields from './fields';

import { useSquidRoute } from './use-squid-route';
import { Approval } from './approval';
import { SwapInfo } from './swap-info';
import { type FormFields, formSchema, type Configs } from './form-schema';
import { useNativeBalance } from './use-native-balance';
import { useSquidExecute } from './use-squid-execute';
import { type Estimate } from '@0xsquid/squid-types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export const DepositForm = ({
  squid,
  assets,
  initialAsset,
  configs,
}: {
  squid: Squid;
  assets: Array<AssetERC20>;
  initialAsset: AssetERC20;
  configs: Configs;
}) => {
  const t = useT();
  const { pubKey, pubKeys } = useVegaWallet();

  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const chainId = useChainId();
  const defaultChain = squid.chains.find((c) => c.chainId === String(chainId));

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromChain: defaultChain && defaultChain.chainId,
      // fromAddress is just derived from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      fromAddress: address,
      toAsset: initialAsset.id,
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
    configs,
    enabled: isSwap,
  });

  const { submitDeposit } = useEvmDeposit({ queryKey: balanceDataQueryKey });
  const {
    submitSquidDeposit,
    status,
    error: squidExecuteError,
    hash,
  } = useSquidExecute();

  return (
    <FormProvider {...form}>
      <form
        uata-testid="deposit-form"
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
          const bridgeAddress = config.collateral_bridge_contract.address;

          if (!fromAsset) {
            throw new Error('no from asset');
          }

          if (Number(fromAsset.chainId) !== chainId) {
            await switchChainAsync({ chainId: Number(fromAsset.chainId) });
          }

          if (
            fromAsset.address.toLowerCase() ===
            toAsset.source.contractAddress.toLowerCase()
          ) {
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
            submitSquidDeposit(routeData);
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
        {!isSwap && toAsset && balanceData && (
          <Approval
            asset={toAsset}
            amount={fields.amount}
            data={balanceData}
            configs={configs}
            queryKey={balanceDataQueryKey}
          />
        )}
        {isSwap && (
          <div className="mb-2">
            <SwapInfo route={routeData?.route} error={routeError} />
          </div>
        )}
        <SubmitButton
          isSwap={isSwap}
          isFetchingRoute={isFetching}
          isExecuting={status === 'pending'}
          estimate={routeData?.route.estimate}
        />
        {status === 'pending' && (
          <div className="flex flex-col gap-2 items-center text-xs mt-2">
            <p>
              {t('Swap and deposit in progress')}{' '}
              {hash && (
                <a
                  href={`https://axelarscan.io/gmp/${hash}`}
                  className="underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('View on Axelarscan')}
                </a>
              )}
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <VegaIcon name={VegaIconNames.CROSS} />
              <p>{t('Swap and deposit failed')}</p>
            </div>
            <p>{squidExecuteError.message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <VegaIcon name={VegaIconNames.TICK} />
              <p>{t('Swap and deposit complete')}</p>
            </div>
          </div>
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
