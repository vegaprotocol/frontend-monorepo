import { useAssetDataProvider } from '@vegaprotocol/assets';
import { addDecimalsFixedFormatNumber } from '@vegaprotocol/utils';
import { AssetLink } from '../links';

export type AssetBalanceProps = {
  assetId: string;
  price: string;
  showAssetLink?: boolean;
  showAssetSymbol?: boolean;
  rounded?: boolean;
  hideLabel?: boolean;
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
  rounded = false,
  hideLabel = false,
}: AssetBalanceProps) => {
  const { data: asset, loading } = useAssetDataProvider(assetId);

  const label =
    !loading && asset && asset.decimals
      ? addDecimalsFixedFormatNumber(
          price,
          asset.decimals,
          rounded ? 0 : undefined
        )
      : price;

  return (
    <div className="inline-block">
      <span className="font-mono">{label}</span>{' '}
      {showAssetLink && asset?.id ? (
        <AssetLink
          showAssetSymbol={showAssetSymbol}
          assetId={assetId}
          hideLabel={hideLabel}
        />
      ) : null}
    </div>
  );
};

export default AssetBalance;
