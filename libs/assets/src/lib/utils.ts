import { toBigNum } from '@vegaprotocol/utils';
import { getExternalChainShortLabel } from '@vegaprotocol/environment';
import { type AssetFieldsFragment } from './__generated__/Asset';

export const getQuantumValue = (value: string, quantum: string) => {
  return toBigNum(value, 0).dividedBy(toBigNum(quantum, 0));
};

export const getAssetSymbol = (asset: AssetFieldsFragment) => {
  let symbol = asset.symbol;

  if (asset.source.__typename === 'ERC20') {
    const chainLabel = getExternalChainShortLabel(asset.source.chainId);
    symbol = `${asset.symbol}${chainLabel ? `(${chainLabel})` : ''}`;
  }

  return symbol;
};
