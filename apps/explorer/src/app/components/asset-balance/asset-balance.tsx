import { useAssetDataProvider } from '@vegaprotocol/assets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { AssetLink } from '../links';

export type AssetBalanceProps = {
  assetId: string;
  price: string;
  showAssetLink?: boolean;
  showAssetSymbol?: boolean;
};

/**
 * Given a market ID and a price it will fetch the market
 * and format the price in that market's decimal places.
 */
const AssetBalance = ({
  assetId,
  price,
  showAssetLink = true,
  showAssetSymbol = false,
}: AssetBalanceProps) => {
  const { data: asset, loading } = useAssetDataProvider(assetId);

  const label =
    !loading && asset && asset.decimals
      ? addDecimalsFormatNumber(price, asset.decimals)
      : price;

  return (
    <div className="inline-block">
      <span>{label}</span>{' '}
      {showAssetLink && asset?.id ? (
        <AssetLink showAssetSymbol={showAssetSymbol} assetId={assetId} />
      ) : null}
    </div>
  );
};

export default AssetBalance;
