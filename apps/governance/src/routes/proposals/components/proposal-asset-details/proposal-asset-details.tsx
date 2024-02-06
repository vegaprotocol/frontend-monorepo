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

  return (
    <section data-testid="proposal-asset-details">
      <CollapsibleToggle
        toggleState={showAssetDetails}
        setToggleState={setShowAssetDetails}
        dataTestId={'proposal-asset-details-toggle'}
      >
        <SubHeading title={t('assetSpecification')} />
      </CollapsibleToggle>

      {showAssetDetails && (
        <div className="mb-10 pb-4">
          <AssetDetailsTable
            asset={asset}
            originalAsset={originalAsset}
            omitRows={[
              AssetDetail.STATUS,
              AssetDetail.INFRASTRUCTURE_FEE_ACCOUNT_BALANCE,
              AssetDetail.GLOBAL_REWARD_POOL_ACCOUNT_BALANCE,
              AssetDetail.MAKER_PAID_FEES_ACCOUNT_BALANCE,
              AssetDetail.MAKER_RECEIVED_FEES_ACCOUNT_BALANCE,
              AssetDetail.LP_FEE_REWARD_ACCOUNT_BALANCE,
              AssetDetail.MARKET_PROPOSER_REWARD_ACCOUNT_BALANCE,
            ]}
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
