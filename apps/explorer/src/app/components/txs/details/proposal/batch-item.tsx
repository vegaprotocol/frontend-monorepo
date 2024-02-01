import { t } from '@vegaprotocol/i18n';
import { AssetLink, MarketLink, NetworkParameterLink } from '../../../links';
import type { components } from '../../../../../types/explorer';
import Hash from '../../../links/hash';

type Item = components['schemas']['vegaBatchProposalTermsChange'];

export interface BatchItemProps {
  item: Item;
}

/**
 * Produces a one line summary for an item in a batch proposal. Could
 * easily be adapted to summarise individual proposals, but there is no
 * place for that yet.
 *
 * Details (like IDs) should be shown and linked if available, but handled
 * if not available. This is adequate as the ProposalSummary component contains
 * a JSON viewer for the full proposal.
 */
export const BatchItem = ({ item }: BatchItemProps) => {
  if (item.cancelTransfer) {
    const transferId = item?.cancelTransfer?.changes?.transferId || false;
    return (
      <span>
        {t('Cancel transfer')}&nbsp;
        {transferId && (
          <Hash className="ml-1" truncate={true} text={transferId} />
        )}
      </span>
    );
  } else if (item.newFreeform) {
    return <span>{t('New freeform')}</span>;
  } else if (item.newMarket) {
    return <span>{t('New market')}</span>;
  } else if (item.newSpotMarket) {
    return <span>{t('New spot market')}</span>;
  } else if (item.newTransfer) {
    return <span>{t('New transfer')}</span>;
  } else if (item.updateAsset) {
    const assetId = item?.updateAsset?.assetId || false;
    return (
      <span>
        {t('Update asset')}
        {assetId && <AssetLink className="ml-1" assetId={assetId} />}
      </span>
    );
  } else if (item.updateMarket) {
    const marketId = item?.updateMarket?.marketId || false;
    return (
      <span>
        {t('Update market')}{' '}
        {marketId && <MarketLink className="ml-1" id={marketId} />}
      </span>
    );
  } else if (item.updateMarketState) {
    const marketId = item?.updateMarketState?.changes?.marketId || false;
    return (
      <span>
        {t('Update market state')}
        {marketId && <MarketLink className="ml-1" id={marketId} />}
      </span>
    );
  } else if (item.updateNetworkParameter) {
    const param = item?.updateNetworkParameter?.changes?.key || false;
    return (
      <span>
        {t('Update network parameter')}
        {param && <NetworkParameterLink className="ml-1" parameter={param} />}
      </span>
    );
  } else if (item.updateReferralProgram) {
    return <span>{t('Update referral program')}</span>;
  } else if (item.updateSpotMarket) {
    const marketId = item?.updateSpotMarket?.marketId || '';
    return (
      <span>
        {t('Update spot market')}
        <MarketLink className="ml-1" id={marketId} />
      </span>
    );
  } else if (item.updateVolumeDiscountProgram) {
    return <span>{t('Update volume discount program')}</span>;
  }

  return <span>{t('Unknown proposal type')}</span>;
};
