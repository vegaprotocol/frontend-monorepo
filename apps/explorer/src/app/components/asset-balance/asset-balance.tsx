import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { AssetLink } from '../links';
import { useExplorerAssetQuery } from '../links/asset-link/__generated__/Asset';

export type AssetBalanceProps = {
  assetId: string;
  price: string;
  hideAssetLink?: boolean;
};

/**
 * Given a market ID and a price it will fetch the market
 * and format the price in that market's decimal places.
 */
const AssetBalance = ({
  assetId,
  price,
  hideAssetLink = false,
}: AssetBalanceProps) => {
  const { data } = useExplorerAssetQuery({
    fetchPolicy: 'cache-first',
    variables: { id: assetId },
  });

  const label =
    data && data.asset?.decimals
      ? addDecimalsFormatNumber(price, data.asset.decimals)
      : price;

  return (
    <div className="inline-block">
      <span>{label}</span>{' '}
      {hideAssetLink === false && data?.asset?.id ? (
        <AssetLink id={data.asset.id} />
      ) : null}
    </div>
  );
};

export default AssetBalance;
