import { Links } from '../../lib/links';
import { Link, useMatch } from 'react-router-dom';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useOnboardStore } from 'apps/trading/stores/onboard';
import { useT } from '../../lib/use-t';
import { useTeam } from '../../lib/hooks/use-team';

export const OnboardBanner = () => {
  const t = useT();
  const store = useOnboardStore();
  const match = useMatch('/invite/*');

  const teamResult = useTeam(store.team);
  const team = teamResult.data?.teams?.edges.find(
    (t) => t.node.teamId === store.team
  );

  // banner needs to render an empty element so that the parent grid renders correctly
  const empty = <div />;

  if (match) {
    return empty;
  }

  if (store.dismissed) {
    return empty;
  }

  if (store.finished) {
    return empty;
  }

  let text = t('Connect and start trading to earn rewards.');

  if (store.team && team) {
    text = t('You have been invited to join team {{team}}.', {
      team: team.node.name,
    });
  }

  if (store.code) {
    text = t('You have been invited to join a referral set.');
  }

  return (
    <div className="flex justify-between gap-2 text-sm px-2 bg-radial text-gs-950">
      <p className="py-2 pl-2">
        {text}{' '}
        <Link to={Links.INVITE()} className="underline underline-offset-4">
          {t('Get started')} <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
        </Link>
      </p>
      <button className="p-2" onClick={store.dismiss}>
        <VegaIcon name={VegaIconNames.CROSS} />
      </button>
    </div>
  );
};
