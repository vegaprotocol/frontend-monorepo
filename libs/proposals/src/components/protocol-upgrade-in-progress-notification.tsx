import { useProtocolUpgradeProposalLink } from '@vegaprotocol/environment';

import { t } from '@vegaprotocol/i18n';
import {
  ExternalLink,
  Intent,
  NotificationBanner,
  SHORT,
} from '@vegaprotocol/ui-toolkit';
import type { StoredNextProtocolUpgradeData } from '../lib';
import {
  NEXT_PROTOCOL_UPGRADE_PROPOSAL_SNAPSHOT,
  useNextProtocolUpgradeProposal,
} from '../lib';
import { useLocalStorageSnapshot } from '@vegaprotocol/react-helpers';
import { useBlockRising } from '../lib/protocol-upgrade-proposals/use-block-rising';

/**
 * A flag determining whether to get the upgrade proposal data from local
 * storage if `useNextProtocolUpgradeProposal` fails.
 */
const ALLOW_STORED_PROPOSAL_DATA = true;

export const ProtocolUpgradeInProgressNotification = () => {
  const { data, error } = useNextProtocolUpgradeProposal(undefined, true);
  const [nextUpgrade] = useLocalStorageSnapshot(
    NEXT_PROTOCOL_UPGRADE_PROPOSAL_SNAPSHOT
  );
  const { blocksRising, block } = useBlockRising();
  const detailsLink = useProtocolUpgradeProposalLink();

  const { vegaReleaseTag, upgradeBlockHeight } =
    error && !data && nextUpgrade && ALLOW_STORED_PROPOSAL_DATA
      ? (JSON.parse(nextUpgrade) as StoredNextProtocolUpgradeData) // gets stored data in case of an data node error if allowed
      : data || { vegaReleaseTag: undefined, upgradeBlockHeight: undefined };

  /**
   * If upgrade is in progress then none of the nodes should produce blocks,
   * same should be with the tendermint block info otherwise it's a network
   * issue and not an upgrade. The upgrade usually lasts for couple of minutes.
   *
   * Once the networks is back then the notification disappears.
   */
  const upgradeInProgress =
    vegaReleaseTag &&
    upgradeBlockHeight &&
    !blocksRising &&
    block <= Number(upgradeBlockHeight);

  if (!upgradeInProgress) return null;

  return (
    <NotificationBanner intent={Intent.Danger} className={SHORT}>
      <div className="uppercase">
        {t('The network is being upgraded to %s', vegaReleaseTag)}
      </div>
      <div>
        {t(
          'Trading and other network activity has stopped until the upgrade is complete.'
        )}{' '}
        {vegaReleaseTag && (
          <ExternalLink href={detailsLink(vegaReleaseTag)}>
            {t('View details')}
          </ExternalLink>
        )}
      </div>
    </NotificationBanner>
  );
};
