import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubHeading } from '../../../../components/heading';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import {
  AssetDetail,
  AssetDetailsTable,
  useAssetQuery,
} from '@vegaprotocol/assets';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import {
  type INewAssetFieldsFragment,
  type IUpdateAssetFieldsFragment,
} from '../../__generated__/Proposals';
import { Lozenge } from '@vegaprotocol/ui-toolkit';

export const ProposalAssetDetails = ({
  change,
  assetId,
}: {
  change: IUpdateAssetFieldsFragment | INewAssetFieldsFragment;
  assetId: string;
}) => {
  const { t } = useTranslation();
  const [showAssetDetails, setShowAssetDetails] = useState(false);

  const { data } = useAssetQuery({
    fetchPolicy: 'network-only',
    variables: {
      assetId,
    },
  });

  if (!data) return null;

  let asset = removePaginationWrapper(data?.assetsConnection?.edges)[0];

  const originalAsset = asset;

  if (change.__typename === 'UpdateAsset') {
    asset = {
      ...asset,
      quantum: change.quantum,
      source: { ...asset.source },
    };

    if (asset.source.__typename === 'ERC20') {
      asset.source.lifetimeLimit = change.source.lifetimeLimit;
      asset.source.withdrawThreshold = change.source.withdrawThreshold;
    }
  }

  const title = (
    <span>
      <Lozenge className="text-lg">{asset.symbol}</Lozenge>{' '}
      <span className="lowercase">{t('assetSpecification')}</span>
    </span>
  );

  return (
    <section data-testid="proposal-asset-details">
      <CollapsibleToggle
        toggleState={showAssetDetails}
        setToggleState={setShowAssetDetails}
        dataTestId={'proposal-asset-details-toggle'}
      >
        <SubHeading title={title} />
      </CollapsibleToggle>

      {showAssetDetails && (
        <div className="mb-10 pb-4">
          <AssetDetailsTable
            asset={asset}
            originalAsset={originalAsset}
            omitRows={[AssetDetail.STATUS]}
            inline={true}
            noBorder={true}
            dtClassName="text-black dark:text-white text-ui !px-0 !font-normal"
            ddClassName="text-black dark:text-white text-ui !px-0 !font-normal max-w-full"
          />
        </div>
      )}
    </section>
  );
};
