import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubHeading } from '../../../../components/heading';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { AssetDetail, AssetDetailsTable } from '@vegaprotocol/assets';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';

export const ProposalAssetDetails = ({
  asset,
  originalAsset,
}: {
  asset: AssetFieldsFragment;
  originalAsset?: AssetFieldsFragment;
}) => {
  const { t } = useTranslation();
  const [showAssetDetails, setShowAssetDetails] = useState(false);

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
