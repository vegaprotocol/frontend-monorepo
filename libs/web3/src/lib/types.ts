import { type WithdrawalBusEventFieldsFragment } from './__generated__/TransactionResult';

export enum VegaTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Error = 'Error',
  Complete = 'Complete',
}

export interface VegaTxState {
  status: VegaTxStatus;
  error: Error | null;
  txHash: string | null;
  signature: string | null;
  dialogOpen: boolean;
}

export type AssetData = {
  id: string;
  symbol: string;
  chainId: number;
  contractAddress: string;
  decimals: number;
  quantum: string;
};

export const toAssetData = (
  asset?: WithdrawalBusEventFieldsFragment['asset']
): AssetData | undefined => {
  if (asset && asset.source.__typename === 'ERC20') {
    return {
      id: asset.id,
      symbol: asset.symbol,
      chainId: Number(asset.source.chainId),
      contractAddress: asset.source.contractAddress,
      decimals: asset.decimals,
      quantum: asset.quantum,
    };
  }
  return undefined;
};
