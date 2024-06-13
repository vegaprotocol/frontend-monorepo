import { type AssetFieldsFragment } from './__generated__/Asset';
import { getAssetSymbol } from './utils';

export const AssetSymbol = ({
  asset,
}: {
  asset: AssetFieldsFragment | undefined;
}) => {
  if (!asset) return null;

  return <>{getAssetSymbol(asset)}</>;
};
