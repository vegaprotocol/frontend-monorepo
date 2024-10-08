import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useChainId } from 'wagmi';

import { type AssetERC20 } from '@vegaprotocol/assets';
import {
  Button,
  Intent,
  TradingRichSelectTriggerContent,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useT } from '../../lib/use-t';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useAssetReadContracts } from './use-asset-read-contracts';

import * as Fields from './fields';

// TODO: change this to show lifetime depositl limit only
// import { Approval } from './approval';
import {
  type FormFields,
  type Configs,
  useFallbackFormSchema,
} from './form-schema';
import { AssetOption } from '../asset-option';
import { formatNumber } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { FeedbackDialog } from './feedback-dialog';

export const FallbackDepositForm = (props: {
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
  onDeposit?: (tx: TxDeposit | TxSquidDeposit) => void;
  minAmount?: string;
}) => {
  const t = useT();
  const { pubKey, pubKeys } = useVegaWallet();

  const { address } = useAccount();

  const chainId = useChainId();

  const schema = useFallbackFormSchema({ minAmount: props.minAmount });
  const form = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      // fromAddress is just derived from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      fromAddress: address,
      fromChain: String(chainId),
      fromAsset: props.initialAsset?.source.contractAddress,
      toAsset: props.initialAsset?.id,
      toPubKey: pubKey,
      amount: '',
    },
  });

  const fields = form.watch();

  const toAsset = props.assets?.find((a) => a.id === fields.toAsset);

  // Data relating to the select asset, like balance on address, allowance
  const { data: balanceData, queryKey } = useAssetReadContracts({
    token: toAsset
      ? {
          address: toAsset.source.contractAddress,
          chainId: toAsset.source.chainId,
          decimals: toAsset.decimals,
        }
      : undefined,
    configs: props.configs,
  });

  const deposit = useEvmDeposit();

  return (
    <FormProvider {...form}>
      <form
        data-testid="deposit-form"
        onSubmit={form.handleSubmit(async (fields) => {
          const toAsset = props.assets?.find((a) => a.id === fields.toAsset);

          if (!toAsset || toAsset.source.__typename !== 'ERC20') {
            throw new Error('invalid asset');
          }

          const config = props.configs.find(
            (c) => c.chain_id === toAsset.source.chainId
          );

          if (!config) {
            throw new Error(`no bridge for toAsset ${toAsset.id}`);
          }

          // The default bridgeAddress for the selected toAsset if an arbitrum
          // to asset is selected will get changed to the squid receiver address
          const bridgeAddress = config.collateral_bridge_contract.address;

          const res = await deposit.write({
            asset: toAsset,
            bridgeAddress: bridgeAddress as `0x${string}`,
            amount: fields.amount,
            allowance: (balanceData?.allowance || BigNumber(0)).toString(),
            toPubKey: fields.toPubKey,
            chainId: Number(config.chain_id),
            requiredConfirmations: config.confirmations,
          });

          props.onDeposit && props.onDeposit(res);
        })}
      >
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
                        <span>{formatNumber(balanceData?.balanceOf || 0)}</span>
                      }
                    />
                  </TradingRichSelectTriggerContent>
                </span>
              </Tooltip>
            ) : undefined
          }
        />
        <Fields.ToPubKey control={form.control} pubKeys={pubKeys} />
        <Fields.ToAsset
          control={form.control}
          assets={props.assets}
          toAsset={toAsset}
          queryKey={queryKey}
        />
        <Fields.Amount
          control={form.control}
          balanceOf={balanceData?.balanceOf}
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
