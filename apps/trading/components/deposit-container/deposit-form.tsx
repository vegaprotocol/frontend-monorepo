import { FormProvider } from 'react-hook-form';
import { type Squid } from '@0xsquid/sdk';
import { type Estimate } from '@0xsquid/squid-types';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { Button, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

import { useT } from '../../lib/use-t';

import { SwapInfo } from './swap-info';
import { type Configs } from './form-schema';
import * as Fields from './fields';
import { FeedbackDialog, SquidFeedbackDialog } from './feedback-dialog';
import { type TxDeposit, type TxSquidDeposit } from '../../stores/evm';
import { useDepositForm } from './use-deposit-form';

export const DepositForm = (props: {
  squid: Squid;
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
  onDeposit?: (tx: TxDeposit | TxSquidDeposit) => void;
  minAmount?: string;
}) => {
  const { pubKeys } = useVegaWallet();
  const {
    form,
    chain,
    tokens,
    toAsset,
    balances,
    nativeBalance,
    route,
    isSwap,
    squidDeposit,
    deposit,
    onSubmit,
  } = useDepositForm(props);

  return (
    <FormProvider {...form}>
      <form data-testid="deposit-form" onSubmit={onSubmit}>
        <Fields.FromAddress control={form.control} />
        <Fields.FromChain
          control={form.control}
          chains={props.squid.chains}
          tokens={props.squid.tokens}
        />
        <Fields.FromAsset
          control={form.control}
          tokens={tokens}
          chain={chain}
        />
        <Fields.Amount
          control={form.control}
          balanceOf={balances.data?.balanceOf}
          nativeBalanceOf={nativeBalance.data}
        />
        <Fields.ToPubKey control={form.control} pubKeys={pubKeys} />
        <Fields.ToAsset
          control={form.control}
          assets={props.assets}
          toAsset={toAsset}
          queryKey={balances.queryKey}
          route={route.data?.route}
        />
        {isSwap && (
          <div className="mb-4">
            <SwapInfo route={route.data?.route} error={route.error} />
          </div>
        )}
        <SubmitButton
          isSwap={isSwap}
          isFetchingRoute={route.isFetching}
          estimate={route.data?.route.estimate}
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
