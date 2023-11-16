import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import { useNextProtocolUpgradeProposal, useTimeToUpgrade } from '../lib';
import { useProtocolUpgradeProposalLink } from '@vegaprotocol/environment';
import { ProtocolUpgradeCountdownMode } from './protocol-upgrade-countdown';
import { convertToCountdownString } from '@vegaprotocol/utils';
import { useState } from 'react';
import { useT } from '../use-t';
import { Trans } from 'i18';

type ProtocolUpgradeProposalNotificationProps = {
  mode?: ProtocolUpgradeCountdownMode;
};
export const ProtocolUpgradeProposalNotification = ({
  mode = ProtocolUpgradeCountdownMode.IN_BLOCKS,
}: ProtocolUpgradeProposalNotificationProps) => {
  const t = useT();
  const [visible, setVisible] = useState(true);
  const { data, lastBlockHeight } = useNextProtocolUpgradeProposal();
  const detailsLink = useProtocolUpgradeProposalLink();
  const time = useTimeToUpgrade(
    data && data.upgradeBlockHeight
      ? Number(data.upgradeBlockHeight)
      : undefined
  );

  if (!data || !lastBlockHeight || !visible) return null;

  const { vegaReleaseTag, upgradeBlockHeight } = data;

  let timeLeft = time;
  let blocksLeft = Number(upgradeBlockHeight) - Number(lastBlockHeight);
  if (blocksLeft < 0) {
    blocksLeft = 0;
    timeLeft = 0;
  }

  let countdown;
  switch (mode) {
    case ProtocolUpgradeCountdownMode.IN_BLOCKS:
      countdown = (
        <Trans
          defaults="<0>{{count}}</0> blocks"
          components={[<span className="text-vega-orange-500">count</span>]}
          values={{
            count: blocksLeft,
          }}
        />
      );
      break;
    case ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING:
      countdown =
        timeLeft !== undefined ? (
          <span
            title={t('estimated time to protocol upgrade')}
            className="text-vega-orange-500"
            data-testid="upgrade-proposal-estimate"
          >
            {convertToCountdownString(timeLeft, '0:00:00:00')}
          </span>
        ) : (
          <span className="text-vega-orange-600 lowercase italic">
            {t('estimating...')}
          </span>
        );
      break;
  }

  return (
    <NotificationBanner
      intent={Intent.Warning}
      onClose={() => {
        setVisible(false);
      }}
    >
      <div className="uppercase ">
        {t('The network will upgrade to {{vegaReleaseTag}} in {{countdown}}', {
          vegaReleaseTag: data.vegaReleaseTag,
          countdown,
        })}
      </div>
      <div>
        <Trans />
        {t(
          'Trading activity will be interrupted, manage your risk appropriately.'
        )}{' '}
        <ExternalLink href={detailsLink(vegaReleaseTag, upgradeBlockHeight)}>
          {t('View details')}
        </ExternalLink>
      </div>
    </NotificationBanner>
  );
};
