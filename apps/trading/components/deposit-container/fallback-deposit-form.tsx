import { FormProvider } from 'react-hook-form';

import { type AssetERC20 } from '@vegaprotocol/assets';
import {
  Button,
  Intent,
  TradingRichSelectTriggerContent,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useT } from '../../lib/use-t';

import * as Fields from './fields';

import { type Configs } from './form-schema';
import { AssetOption } from '../asset-option';
import { formatNumber } from '@vegaprotocol/utils';
import { FeedbackDialog } from './feedback-dialog';
import { useFallbackDepositForm } from './use-fallback-deposit-form';
import { type TxDeposit } from '../../stores/evm';

export const FallbackDepositForm = (props: {
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
  onDeposit?: (tx: TxDeposit) => void;
  minAmount?: string;
}) => {
  const t = useT();
  const { pubKeys } = useVegaWallet();
  const { form, toAsset, balances, deposit, onSubmit } =
    useFallbackDepositForm(props);

  return (
    <FormProvider {...form}>
      <form data-testid="deposit-form" onSubmit={onSubmit}>
        <Fields.FromAddress control={form.control} />
        <Fields.FromChain control={form.control} disabled={true} />
        <Fields.FromAsset
          control={form.control}
          disabled={true}
          disabledMessage={
            toAsset ? (
              <Tooltip
                description={t('Swaps not available')}
                align="center"
                side="bottom"
                sideOffset={1}
              >
                <span>
                  <TradingRichSelectTriggerContent>
                    <AssetOption
                      asset={toAsset}
                      balance={
                        <span>
                          {formatNumber(balances.data?.balanceOf || 0)}
                        </span>
                      }
                    />
                  </TradingRichSelectTriggerContent>
                </span>
              </Tooltip>
            ) : undefined
          }
        />
        <Fields.ToPubKeySelect control={form.control} pubKeys={pubKeys} />
        <Fields.ToAsset
          control={form.control}
          assets={props.assets}
          toAsset={toAsset}
          queryKey={balances.queryKey}
        />
        <Fields.Amount
          control={form.control}
          balanceOf={balances.data?.balanceOf}
          nativeBalanceOf={undefined}
        />
        <Button type="submit" size="lg" fill={true} intent={Intent.Secondary}>
          {t('Deposit')}
        </Button>
      </form>

      <FeedbackDialog data={deposit.data} onChange={deposit.reset} />
    </FormProvider>
  );
};
