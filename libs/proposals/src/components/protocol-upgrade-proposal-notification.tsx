import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import { useNextProtocolUpgradeProposal, useTimeToUpgrade } from '../lib';
import { t } from '@vegaprotocol/i18n';
import { useProtocolUpgradeProposalLink } from '@vegaprotocol/environment';
import { ProtocolUpgradeCountdownMode } from './protocol-upgrade-countdown';
import { convertToCountdownString } from '@vegaprotocol/utils';
import { useState } from 'react';

type ProtocolUpgradeProposalNotificationProps = {
  mode?: ProtocolUpgradeCountdownMode;
};
export const ProtocolUpgradeProposalNotification = ({
  mode = ProtocolUpgradeCountdownMode.IN_BLOCKS,
}: ProtocolUpgradeProposalNotificationProps) => {
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
        <>
          <span className="text-vega-orange-500">{blocksLeft}</span>{' '}
          {t('blocks')}
        </>
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
        {t('The network will upgrade to %s in ', [data.vegaReleaseTag])}
        {countdown}
      </div>
      <div>
        {t(
          'Trading activity will be interrupted, manage your risk appropriately.'
        )}{' '}
        <ExternalLink href={detailsLink(vegaReleaseTag)}>
          {t('View details')}
        </ExternalLink>
      </div>
    </NotificationBanner>
  );
};
