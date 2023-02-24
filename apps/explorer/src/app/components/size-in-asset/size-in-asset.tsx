import { useAssetDataProvider } from '@vegaprotocol/assets';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { AssetLink } from '../links';

export type DecimalSource = 'ASSET';

export type SizeInAssetProps = {
  assetId: string;
  size?: string | number;
  decimalSource?: DecimalSource;
};

/**
 * Given a market ID and an order size it will fetch the market
 * order size, and format the size accordingly
 */
const SizeInAsset = ({
  assetId,
  size,
  decimalSource = 'ASSET',
}: SizeInAssetProps) => {
  const { data } = useAssetDataProvider(assetId);
  if (!size) {
    return <span>-</span>;
  }

  let label = size;

  if (data) {
    if (decimalSource === 'ASSET' && data.decimals) {
      label = addDecimalsFormatNumber(size, data.decimals);
    }
  }

  return (
    <p>
      <span>{label}</span>&nbsp;
      <AssetLink assetId={assetId} showAssetSymbol={true} asDialog={true} />
    </p>
  );
};

export default SizeInAsset;
