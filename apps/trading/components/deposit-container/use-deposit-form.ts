import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useChainId } from 'wagmi';
import { type Squid } from '@0xsquid/sdk';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useAssetReadContracts } from './use-asset-read-contracts';
import { useSquidRoute } from './use-squid-route';
import { type FormFields, type Configs, useFormSchema } from './form-schema';
import { useNativeBalance } from './use-native-balance';
import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useEvmSquidDeposit } from 'apps/trading/lib/hooks/use-evm-squid-deposit';
import { type TxDeposit, type TxSquidDeposit } from '../../stores/evm';

/**
 * Form logic for deposits
 */
export const useDepositForm = (props: {
  squid: Squid;
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
  minAmount?: string;
  onDeposit?: (tx: TxDeposit | TxSquidDeposit) => void;
}) => {
  const { pubKey } = useVegaWallet();
  const { address } = useAccount();

  const chainId = useChainId();
  const defaultChain = props.squid.chains.find(
    (c) => c.chainId === String(chainId)
  );

  const schema = useFormSchema({ minAmount: props.minAmount });
  const form = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAddress: address,
      fromChain: defaultChain && defaultChain.chainId,
      fromAsset: '',
      // fromAddress is just derived from the connected wallet, but including
      // it as a form field so its included with the zodResolver validation
      // and shows up as an error if its not set
      toAsset: props.initialAsset?.id,
      toPubKey: pubKey,
      amount: 0,
    },
  });

  const fields = form.watch();

  const tokens = props.squid.tokens?.filter((t) => {
    if (!fields.fromChain) return false;
    if (t.chainId === fields.fromChain) return true;
    return false;
  });

  const chain = props.squid.chains.find((c) => c.chainId === fields.fromChain);
  const toAsset = props.assets?.find((a) => a.id === fields.toAsset);
  const fromAsset = tokens?.find((t) => t.address === fields.toAsset);

  // Data relating to the selected from asset, like balance on address and allowance
  // Only relevant if the asset is not a the chains native asset
  const balances = useAssetReadContracts({
    token: fromAsset,
    configs: props.configs,
  });

  // Because the read contracts above don't work with native balances we need to
  // separately get the native token balance
  const nativeBalance = useNativeBalance({
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

  const route = useSquidRoute({
    form,
    toAsset,
    enabled: isSwap,
  });

  const deposit = useEvmDeposit();
  const squidDeposit = useEvmSquidDeposit();

  const onSubmit = form.handleSubmit(async (fields) => {
    // Get full details of the chosen assets
    const fromAsset = tokens.find(
      (t) => t.address === fields.fromAsset && t.chainId === fields.fromChain
    );
    const toAsset = props.assets?.find((a) => a.id === fields.toAsset);

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
        amount: fields.amount.toString(),
        toPubKey: fields.toPubKey,
        routeData: route.data,
        chainId: Number(fields.fromChain),
      });
      props.onDeposit && props.onDeposit(res);
    } else {
      // Same asset, no swap required, use normal ethereum bridge
      // or normal arbitrum bridge to swap

      // Find the matching config for the selected asset
      const config = props.configs.find(
        (c) => c.chain_id === toAsset.source.chainId
      );

      if (!config) {
        throw new Error(`no bridge for toAsset ${toAsset.id}`);
      }

      const res = await deposit.write({
        asset: toAsset,
        bridgeAddress: config.collateral_bridge_contract
          .address as `0x${string}`,
        amount: fields.amount.toString(),
        allowance: (balances.data?.allowance || BigNumber(0)).toString(),
        toPubKey: fields.toPubKey,
        chainId: Number(config.chain_id),
        requiredConfirmations: config.confirmations,
      });
      props.onDeposit && props.onDeposit(res);
    }
  });

  return {
    form,

    chain,
    tokens,
    fromAsset,
    toAsset,

    route,
    isSwap,
    nativeBalance,
    balances,

    deposit,
    squidDeposit,
    onSubmit,
  };
};
