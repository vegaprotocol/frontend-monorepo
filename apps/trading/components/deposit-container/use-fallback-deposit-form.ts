import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useChainId } from 'wagmi';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useEvmDeposit } from '../../lib/hooks/use-evm-deposit';
import { useAssetReadContracts } from './use-asset-read-contracts';

// TODO: change this to show lifetime depositl limit only
// import { Approval } from './approval';
import {
  type FormFields,
  type Configs,
  useFallbackFormSchema,
} from './form-schema';
import BigNumber from 'bignumber.js';
import { type TxDeposit } from '../../stores/evm';

export const useFallbackDepositForm = (props: {
  assets: Array<AssetERC20>;
  initialAsset?: AssetERC20;
  configs: Configs;
  onDeposit?: (tx: TxDeposit) => void;
  minAmount?: string;
}) => {
  const { pubKey } = useVegaWallet();

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
      amount: 0,
    },
  });

  const fields = form.watch();

  const toAsset = props.assets?.find((a) => a.id === fields.toAsset);

  // Data relating to the select asset, like balance on address, allowance
  const balances = useAssetReadContracts({
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

  const onSubmit = form.handleSubmit(async (fields) => {
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
      amount: fields.amount.toString(),
      allowance: (balances.data?.allowance || BigNumber(0)).toString(),
      toPubKey: fields.toPubKey,
      chainId: Number(config.chain_id),
      requiredConfirmations: config.confirmations,
    });

    props.onDeposit && props.onDeposit(res);
  });

  return {
    form,

    toAsset,
    balances,

    deposit,
    onSubmit,
  };
};
