import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { useExplorerGovernanceAssetQuery } from './__generated__/Governance-asset';
import AssetBalance from './asset-balance';

export type GovernanceAssetBalanceProps = {
  price: string;
};

const DEFAULT_DECIMALS = 18;

/**
 * Effectively a wrapper around AssetBalance that does an extra query to fetch
 * the governance asset first, which is set by a network parameter
 */
const GovernanceAssetBalance = ({ price }: GovernanceAssetBalanceProps) => {
  const { data } = useExplorerGovernanceAssetQuery();

  if (data && data.networkParameter?.value) {
    const governanceAssetId = data.networkParameter.value;
    return <AssetBalance price={price} assetId={governanceAssetId} />;
  } else {
    return (
      <div className="inline-block">
        <span>{addDecimalsFormatNumber(price, DEFAULT_DECIMALS)}</span>
      </div>
    );
  }
};

export default GovernanceAssetBalance;
