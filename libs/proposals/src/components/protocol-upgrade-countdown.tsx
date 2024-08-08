import { useNextProtocolUpgradeProposal, useTimeToUpgrade } from '../lib';
import { convertToCountdownString } from '@vegaprotocol/utils';
import classNames from 'classnames';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useProtocolUpgradeProposalLink } from '@vegaprotocol/environment';
import { useT } from '../use-t';
import { Trans } from 'react-i18next';

export enum ProtocolUpgradeCountdownMode {
  IN_BLOCKS,
  IN_ESTIMATED_TIME_REMAINING,
}

type ProtocolUpgradeCountdownProps = {
  mode?: ProtocolUpgradeCountdownMode;
};
export const ProtocolUpgradeCountdown = ({
  mode = ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING,
}: ProtocolUpgradeCountdownProps) => {
  const t = useT();
  const { data, lastBlockHeight } = useNextProtocolUpgradeProposal();

  const time = useTimeToUpgrade(
    data && data.upgradeBlockHeight
      ? Number(data.upgradeBlockHeight)
      : undefined
  );

  const detailsLink = useProtocolUpgradeProposalLink();

  if (!data) return null;

  const emphasis = 'text-vega-orange-500 dark:text-vega-orange-500';

  let countdown;
  switch (mode) {
    case ProtocolUpgradeCountdownMode.IN_BLOCKS:
      countdown = (
        <Trans
          i18nKey="numberOfBlocks"
          defaults="<0>{{count}}</0> blocks"
          components={[<span className={emphasis}>count</span>]}
          values={{
            count: Number(data.upgradeBlockHeight) - Number(lastBlockHeight),
          }}
        />
      );
      break;
    case ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING:
      countdown =
        time !== undefined ? (
          <span className={emphasis}>
            {convertToCountdownString(time, '0:00:00:00')}
          </span>
        ) : (
          <span className="text-vega-orange-600 lowercase italic">
            {t('estimating...')}
          </span>
        );
      break;
  }

  return (
    <a
      href={detailsLink(data.vegaReleaseTag, data.upgradeBlockHeight)}
      target="_blank"
      rel="noreferrer nofollow noopener"
    >
      <div
        data-testid="protocol-upgrade-counter"
        className={classNames(
          'flex h-8 flex-nowrap items-center gap-1 px-2 py-1 text-xs lg:px-4',
          'rounded border',
          'border-vega-orange-500 dark:border-vega-orange-500',
          'bg-vega-orange-300 dark:bg-vega-orange-700',
          'text-default'
        )}
      >
        <VegaIcon name={VegaIconNames.EXCLAMATION_MARK} size={12} />{' '}
        <span className="flex flex-nowrap gap-1 whitespace-nowrap">
          <span>
            <Trans
              defaults="Network upgrade in <0/>"
              components={[countdown]}
            />
          </span>
        </span>
      </div>
    </a>
  );
};
