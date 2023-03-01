import { useAssetDataProvider } from '@vegaprotocol/assets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { AssetLink } from '../links';

export type AssetBalanceProps = {
  assetId: string;
  price: string;
  showAssetLink?: boolean;
};

/**
 * Given a market ID and a price it will fetch the market
 * and format the price in that market's decimal places.
 */
const AssetBalance = ({
  assetId,
  price,
  showAssetLink = true,
}: AssetBalanceProps) => {
  const { data: asset } = useAssetDataProvider(assetId);

  const label =
    asset && asset.decimals
      ? addDecimalsFormatNumber(price, asset.decimals)
      : price;

  return (
    <div className="inline-block">
      <span>{label}</span>{' '}
      {showAssetLink && asset?.id ? <AssetLink assetId={assetId} /> : null}
    </div>
  );
};

export default AssetBalance;
