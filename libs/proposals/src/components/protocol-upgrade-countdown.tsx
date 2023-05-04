import { t } from '@vegaprotocol/i18n';
import { useNextProtocolUpgradeProposal, useTimeToUpgrade } from '../lib';
import { convertToCountdownString } from '@vegaprotocol/utils';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Icon, NavigationContext } from '@vegaprotocol/ui-toolkit';
import { useProtocolUpgradeProposalLink } from '@vegaprotocol/environment';
import { useContext } from 'react';
export enum ProtocolUpgradeCountdownMode {
  IN_BLOCKS,
  IN_ESTIMATED_TIME_REMAINING,
}
type ProtocolUpgradeCountdownProps = {
  mode?: ProtocolUpgradeCountdownMode;
};
export const ProtocolUpgradeCountdown = ({
  mode = ProtocolUpgradeCountdownMode.IN_BLOCKS,
}: ProtocolUpgradeCountdownProps) => {
  const { theme } = useContext(NavigationContext);
  const { data, lastBlockHeight } = useNextProtocolUpgradeProposal();

  const time = useTimeToUpgrade(
    data && data.upgradeBlockHeight
      ? Number(data.upgradeBlockHeight)
      : undefined
  );

  const detailsLink = useProtocolUpgradeProposalLink();

  if (!data) return null;

  const emphasis = classNames(
    'text-vega-orange-500 dark:text-vega-orange-500',
    {
      '!text-black': theme === 'yellow',
    }
  );

  let countdown;
  switch (mode) {
    case ProtocolUpgradeCountdownMode.IN_BLOCKS:
      countdown = (
        <>
          <span className={emphasis}>
            {Number(data.upgradeBlockHeight) - Number(lastBlockHeight)}
          </span>{' '}
          {t('blocks')}
        </>
      );
      break;
    case ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING:
      countdown =
        time !== undefined ? (
          <span className={emphasis}>
            {convertToCountdownString(time, '0:00:00:00')}
          </span>
        ) : (
          <span
            className={classNames('italic lowercase text-vega-orange-600', {
              '!text-black': theme === 'yellow',
            })}
          >
            {t('estimating...')}
          </span>
        );
      break;
  }

  return (
    <a
      href={detailsLink(data.vegaReleaseTag)}
      target="_blank"
      rel="noreferrer nofollow noopener"
    >
      <div
        data-testid="protocol-upgrade-counter"
        className={classNames(
          'flex flex-nowrap items-center text-xs py-2 px-4',
          'border rounded',
          'border-vega-orange-500 dark:border-vega-orange-500',
          'bg-vega-orange-300 dark:bg-vega-orange-700',
          {
            '!bg-transparent !border-black': theme === 'yellow',
          }
        )}
      >
        <Icon
          name={IconNames.WARNING_SIGN}
          size={3}
          className={classNames('mr-2', emphasis)}
        />{' '}
        <span className="flex gap-1 flex-nowrap whitespace-nowrap">
          <span>{t('Network upgrade in')} </span>
          {countdown}
        </span>
      </div>
    </a>
  );
};
