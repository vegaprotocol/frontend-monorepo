import {
  useLinks,
  DApp,
  CONSOLE_REWARDS_PAGE,
} from '@vegaprotocol/environment';
import {
  ExternalLink,
  getIntentIcon,
  Intent,
  NotificationBanner,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Trans } from 'react-i18next';
import { useMatch } from 'react-router-dom';
import Routes from '../../routes/routes';
import { type ReactNode } from 'react';

const ConsoleRewardsLink = ({ children }: { children: ReactNode }) => {
  const consoleLink = useLinks(DApp.Console);
  return (
    <ExternalLink
      href={consoleLink(CONSOLE_REWARDS_PAGE)}
      className="underline inline-flex gap-1 items-center"
      title="Rewards in Console"
    >
      <span>{children}</span>
      <VegaIcon size={12} name={VegaIconNames.OPEN_EXTERNAL} />
    </ExternalLink>
  );
};

export const RewardsMovedNotification = () => {
  const onRewardsPage = useMatch(Routes.REWARDS);
  if (!onRewardsPage) return null;

  return (
    <NotificationBanner
      intent={Intent.Warning}
      icon={getIntentIcon(Intent.Warning)}
    >
      <Trans
        i18nKey="rewardsMovedNotification"
        components={[<ConsoleRewardsLink>Console</ConsoleRewardsLink>]}
      />
    </NotificationBanner>
  );
};
