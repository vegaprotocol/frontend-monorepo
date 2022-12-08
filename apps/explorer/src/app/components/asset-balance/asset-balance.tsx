import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { AssetLink } from '../links';
import { useExplorerAssetQuery } from '../links/asset-link/__generated__/Asset';

export type AssetBalanceProps = {
  assetId: string;
  price: string;
};

/**
 * Given a market ID and a price it will fetch the market
 * and format the price in that market's decimal places.
 */
const AssetBalance = ({ assetId, price }: AssetBalanceProps) => {
  const { data } = useExplorerAssetQuery({
    variables: { id: assetId },
  });

  let label = price;

  if (data && data.asset?.decimals) {
    label = addDecimalsFormatNumber(price, data.asset.decimals);
  }

  return (
    <div className="inline-block">
      <span>{label}</span> <AssetLink id={data?.asset?.id || ''} />
    </div>
  );
};

export default AssetBalance;
