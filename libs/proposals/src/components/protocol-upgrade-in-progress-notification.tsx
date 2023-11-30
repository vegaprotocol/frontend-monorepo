import { useProtocolUpgradeProposalLink } from '@vegaprotocol/environment';

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
import { useT } from '../use-t';

/**
 * A flag determining whether to get the upgrade proposal data from local
 * storage if `useNextProtocolUpgradeProposal` fails.
 */
const ALLOW_STORED_PROPOSAL_DATA = true;

export const ProtocolUpgradeInProgressNotification = () => {
  const t = useT();
  const { data, error } = useNextProtocolUpgradeProposal(undefined, true);
  const [nextUpgrade] = useLocalStorageSnapshot(
    NEXT_PROTOCOL_UPGRADE_PROPOSAL_SNAPSHOT
  );
  const detailsLink = useProtocolUpgradeProposalLink();

  let vegaReleaseTag: string | undefined;
  let upgradeBlockHeight: string | undefined;

  const hasData = data && !error;
  const hasStoredData = nextUpgrade && ALLOW_STORED_PROPOSAL_DATA;

  if (hasData) {
    // gets tag and height from the data api
    vegaReleaseTag = data.vegaReleaseTag;
    upgradeBlockHeight = data.upgradeBlockHeight;
  } else if (hasStoredData) {
    // gets tag and height from stored value if data api is unavailable
    try {
      const stored = JSON.parse(nextUpgrade) as StoredNextProtocolUpgradeData;
      vegaReleaseTag = stored.vegaReleaseTag;
      upgradeBlockHeight = stored.upgradeBlockHeight;
    } catch {
      // NOOP - could not parse stored data
    }
  }

  const hasUpgradeInfo = vegaReleaseTag && upgradeBlockHeight;

  const { blocksRising, block } = useBlockRising(
    // skips querying blocks if there's no upgrade information available
    !hasUpgradeInfo
  );

  /**
   * If upgrade is in progress then none of the nodes should produce blocks,
   * same should be with the tendermint block info otherwise it's a network
   * issue and not an upgrade. The upgrade usually lasts for couple of minutes.
   *
   * Once the networks is back then the notification disappears.
   */
  const upgradeInProgress =
    hasUpgradeInfo && !blocksRising && block <= Number(upgradeBlockHeight);

  if (!upgradeInProgress) return null;

  return (
    <NotificationBanner intent={Intent.Danger} className={SHORT}>
      <div className="uppercase">
        {t('The network is being upgraded to {{vegaReleaseTag}}', {
          vegaReleaseTag,
        })}
      </div>
      <div>
        {t(
          'Trading and other network activity has stopped until the upgrade is complete.'
        )}{' '}
        {vegaReleaseTag && upgradeBlockHeight && (
          <ExternalLink href={detailsLink(vegaReleaseTag, upgradeBlockHeight)}>
            {t('View details')}
          </ExternalLink>
        )}
      </div>
    </NotificationBanner>
  );
};
