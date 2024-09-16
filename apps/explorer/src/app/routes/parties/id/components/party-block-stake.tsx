import { t } from '@vegaprotocol/i18n';
import { useExplorerPartyAssetsQuery } from '../__generated__/Party-assets';
import GovernanceAssetBalance from '../../../../components/asset-balance/governance-asset-balance';
import {
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './party-block';
export interface PartyBlockStakeProps {
  partyId: string;
  accountLoading: boolean;
  accountError?: Error;
}

/**
 * Displays an overview of a single party's staking balance, importantly maintaining'
 * the same height before and after the details are loaded in.
 *
 * Unlike PartyBlockAccounts there is not action button in the title of this block as
 * there is no page for it to link to currently. That's a future task.
 */
export const PartyBlockStake = ({
  partyId,
  accountLoading,
  accountError,
}: PartyBlockStakeProps) => {
  const partyRes = useExplorerPartyAssetsQuery({
    // Don't cache data for this query, party information can move quite quickly
    fetchPolicy: 'network-only',
    variables: { partyId: partyId },
    skip: !partyId,
  });

  const p = partyRes.data?.partiesConnection?.edges[0].node;

  return (
    <PartyBlock title={t('Staking')}>
      {p?.stakingSummary.currentStakeAvailable ? (
        <KeyValueTable>
          <KeyValueTableRow noBorder={true}>
            <div>{t('Associated to key')}</div>
            <div>
              <GovernanceAssetBalance
                price={p.stakingSummary.currentStakeAvailable}
              />
            </div>
          </KeyValueTableRow>
        </KeyValueTable>
      ) : accountLoading && !accountError ? (
        <Loader size="small" />
      ) : !accountError ? (
        <p>{t('No staking balance')}</p>
      ) : (
        <p>
          <Icon className="mr-1" name="error" />
          <span className="text-sm">{t('Could not load stake details')}</span>
        </p>
      )}
    </PartyBlock>
  );
};
