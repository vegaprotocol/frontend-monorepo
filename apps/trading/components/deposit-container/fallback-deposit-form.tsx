import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useT } from '../../lib/use-t';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useAssetReadContracts } from './use-asset-read-contracts';

import * as Fields from './fields';

import { Approval } from './approval';
import { type FormFields, formSchema, type Configs } from './form-schema';

export const FallbackDepositForm = ({
  assets,
  initialAsset,
  configs,
}: {
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
}) => {
  const t = useT();
  const { pubKeys } = useVegaWallet();

  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const chainId = useChainId();

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // fromAddress is just derived from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      fromAddress: address,
      fromChain: String(chainId),
      fromAsset: initialAsset?.source.contractAddress,
      toAsset: initialAsset?.id,
      toPubKey: '',
      amount: '',
    },
  });

  const fields = form.watch();

  const toAsset = assets?.find((a) => a.id === fields.toAsset);

  // Data relating to the select asset, like balance on address, allowance
  const { data, queryKey } = useAssetReadContracts({ asset: toAsset, configs });

  const { submitDeposit } = useEvmDeposit({ queryKey });

  return (
    <FormProvider {...form}>
      <form
        data-testid="deposit-form"
        onSubmit={form.handleSubmit(async (fields) => {
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

          if (Number(toAsset.source.chainId) !== chainId) {
            await switchChainAsync({ chainId: Number(toAsset.source.chainId) });
          }

          submitDeposit({
            asset: toAsset,
            bridgeAddress,
            amount: fields.amount,
            toPubKey: fields.toPubKey,
            requiredConfirmations: config?.confirmations || 1,
          });
        })}
      >
        <Fields.FromAddress control={form.control} />
        <Fields.FromChain control={form.control} disabled={true} />
        <Fields.FromAsset control={form.control} disabled={true} />
        <Fields.ToPubKey control={form.control} pubKeys={pubKeys} />
        <Fields.ToAsset
          control={form.control}
          assets={assets}
          toAsset={toAsset}
          queryKey={queryKey}
        />

        <Fields.Amount
          control={form.control}
          toAsset={toAsset}
          balanceOf={data?.balanceOf}
        />
        {toAsset && data && (
          <Approval
            asset={toAsset}
            amount={fields.amount}
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
