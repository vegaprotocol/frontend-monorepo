import { toBigNum } from '@vegaprotocol/utils';
import { SUPPORTED_CHAIN_SHORT_LABELS } from '@vegaprotocol/environment';
import { type AssetFieldsFragment } from './__generated__/Asset';

export const getQuantumValue = (value: string, quantum: string) => {
  return toBigNum(value, 0).dividedBy(toBigNum(quantum, 0));
};

export const getAssetSymbol = (asset: AssetFieldsFragment) => {
  let symbol = asset.symbol;

  if (asset.source.__typename === 'ERC20') {
    symbol = `${asset.symbol}(${
      SUPPORTED_CHAIN_SHORT_LABELS[asset.source.chainId]
    })`;
  }

  return symbol;
};
