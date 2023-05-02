import { t } from '@vegaprotocol/i18n';
import { toNonHex } from '../../../../components/search/detect-search';
import { useExplorerPartyAssetsQuery } from '../__generated__/Party-assets';
import GovernanceAssetBalance from '../../../../components/asset-balance/governance-asset-balance';
import {
  Button,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './party-block';
import BigNumber from 'bignumber.js';

export interface PartyBlockStakeProps {
  partyId: string;
  accountLoading: boolean;
  accountError?: Error;
}

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

  const linkedLength = p?.stakingSummary?.linkings?.edges?.length;
  const linkedStake =
    linkedLength && linkedLength > 0
      ? p?.stakingSummary?.linkings?.edges
          ?.reduce((total, e) => {
            return new BigNumber(total).plus(
              new BigNumber(e?.node.amount || 0)
            );
          }, new BigNumber(0))
          .toString()
      : '0';

  return (
    <PartyBlock
      title={t('Staking')}
      action={<Button size="xs">{t('Show all')}</Button>}
    >
      {p?.stakingSummary.currentStakeAvailable ? (
        <KeyValueTable>
          <KeyValueTableRow noBorder={true}>
            <div>{t('Available stake')}</div>
            <div>
              <GovernanceAssetBalance
                price={p.stakingSummary.currentStakeAvailable}
              />
            </div>
          </KeyValueTableRow>
          <KeyValueTableRow noBorder={true}>
            <div>{t('Active stake')}</div>
            <div>
              <GovernanceAssetBalance price={linkedStake || '0'} />
            </div>
          </KeyValueTableRow>
        </KeyValueTable>
      ) : accountLoading && !accountError ? (
        <Loader size="small" />
      ) : (
        <p>
          <Icon className="mr-1" name="error" />
          <span className="text-sm">{t('Could not load stake details')}</span>
        </p>
      )}
    </PartyBlock>
  );
};
