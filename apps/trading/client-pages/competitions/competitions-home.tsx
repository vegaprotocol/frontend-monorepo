import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '@sentry/react';
import { ExternalLink, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useEpochInfoQuery } from '../../lib/hooks/__generated__/Epoch';
import { Link, useNavigate } from 'react-router-dom';
import { Links } from '../../lib/links';
import {
  ActionButton,
  CompetitionsAction,
  CompetitionsActionsContainer,
} from '../../components/competitions/competitions-cta';
import { GamesContainer } from '../../components/competitions/games-container';
import { CompetitionsLeaderboard } from '../../components/competitions/competitions-leaderboard';
import { useTeams } from '../../lib/hooks/use-teams';
import take from 'lodash/take';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { TeamCard } from '../../components/competitions/team-card';
import { Role, useMyTeam } from '../../lib/hooks/use-my-team';
import { useRewards } from '../../lib/hooks/use-rewards';
import { Trans } from 'react-i18next';
import { DocsLinks } from '@vegaprotocol/environment';
import { type ComponentProps } from 'react';
import { HeaderHero } from '../../components/header-hero';

export const CompetitionsHome = () => {
  const t = useT();
  const navigate = useNavigate();

  usePageTitle(t('Competitions'));

  const { data: epochData } = useEpochInfoQuery();
  const currentEpoch = Number(epochData?.epoch.id);

  const { data: gamesData, loading: gamesLoading } = useRewards({
    onlyActive: true,
    scopeToTeams: true,
  });

  const { data: teamsData, loading: teamsLoading } = useTeams();

  const {
    team: myTeam,
    stats: myTeamStats,
    games: myTeamGames,
    rank: myTeamRank,
    role: myRole,
    teamId: myTeamId,
  } = useMyTeam();

  type event = { preventDefault: () => void };

  /** Action A */
  let createTeamBtnProps: ComponentProps<typeof ActionButton> = {
    intent: Intent.Primary,
    children: t('Create a public team'),
    disabled: false,
    onClick: (e: event) => {
      e.preventDefault();
      navigate(Links.COMPETITIONS_CREATE_TEAM());
    },
    tooltip: undefined,
    // @ts-ignore Button takes all button element attributes
    'data-testid': 'create-public-team-button',
  };

  /** Action B */
  let createPrivateTeamBtnProps: ComponentProps<typeof ActionButton> = {
    intent: Intent.Primary,
    children: t('Create a private team'),
    disabled: false,
    onClick: (e: event) => {
      e.preventDefault();
      navigate(Links.COMPETITIONS_CREATE_TEAM_SOLO());
    },
    tooltip: undefined,
    // @ts-ignore Button takes all button element attributes
    'data-testid': 'create-private-team-button',
  };

  /** Action C */
  let chooseTeamBtnProps: ComponentProps<typeof ActionButton> = {
    intent: Intent.Primary,
    children: t('Choose a team'),
    disabled: false,
    onClick: (e: event) => {
      e.preventDefault();
      navigate(Links.COMPETITIONS_TEAMS());
    },
    tooltip: undefined,
    // @ts-ignore Button takes all button element attributes
    'data-testid': 'choose-team-button',
  };

  if (myRole === Role.NOT_IN_TEAM_BUT_REFERRER) {
    /** A */
    createTeamBtnProps = {
      ...createTeamBtnProps,
      children: t('Upgrade to team'),
      tooltip: t('Upgrade your existing referral set to a team'),
      disabled: myTeamId == null,
    };
    /** B */
    createPrivateTeamBtnProps = {
      ...createPrivateTeamBtnProps,
      children: t('Upgrade to private team'),
      tooltip: t('Upgrade your existing referral set to a private team.'),
      disabled: myTeamId == null,
    };
    /** C */
    chooseTeamBtnProps = {
      ...chooseTeamBtnProps,
      disabled: true,
      tooltip: t(
        'As the creator of a referral set you cannot join another team.'
      ),
    };
  }

  if (myRole === Role.NOT_IN_TEAM_BUT_REFEREE) {
    /** A */
    createTeamBtnProps = {
      ...createTeamBtnProps,
      disabled: true,
      tooltip: t(
        'As a member of a referral set you cannot create a team, but you can join one.'
      ),
    };
    /** B */
    createPrivateTeamBtnProps = {
      ...createPrivateTeamBtnProps,
      disabled: true,
      tooltip: t(
        'As a member of a referral set you cannot create a team, but you can join one.'
      ),
    };
  }

  return (
    <ErrorBoundary>
      <HeaderHero title={t('Competitions')}>
        <p>
          <Trans
            i18nKey={
              'Check the cards below to see what community-created, on-chain games are active and how to compete. Joining a team also lets you take part in the on-chain <0>referral program</0>.'
            }
            components={[
              <Link className="underline" key="ref-prog" to={Links.REFERRALS()}>
                referral program
              </Link>,
            ]}
          />
        </p>
        <p>
          <Trans
            i18nKey={
              'Got an idea for a competition? Anyone can define and fund one -- <0>propose an on-chain game</0> yourself.'
            }
            components={[
              <ExternalLink
                className="underline"
                key="propose"
                href={DocsLinks?.ASSET_TRANSFER_PROPOSAL}
              >
                propose an on-chain game
              </ExternalLink>,
            ]}
          />
          {/** Docs: https://docs.vega.xyz/mainnet/tutorials/proposals/asset-transfer-proposal */}
        </p>
      </HeaderHero>

      {/** Team card */}
      {myTeam ? (
        <section>
          <h2 className="text-2xl mb-6">{t('My team')}</h2>
          <div className="mb-12">
            <TeamCard
              team={myTeam}
              rank={myTeamRank}
              stats={myTeamStats}
              games={myTeamGames}
            />
          </div>
        </section>
      ) : (
        <section>
          {/** Get started */}
          <h2 className="text-2xl mb-6">{t('Get started')}</h2>

          <CompetitionsActionsContainer>
            <CompetitionsAction
              variant="create-team"
              title={t('Create a team')}
              description={t(
                'Create a new team, share your code with potential members, or set a whitelist for an exclusive group.'
              )}
              actionElement={<ActionButton {...createTeamBtnProps} />}
            />
            <CompetitionsAction
              variant="create-solo-team"
              title={t('Solo team / lone wolf')}
              description={t(
                'Want to compete but think the best team size is one? This is the option for you.'
              )}
              actionElement={<ActionButton {...createPrivateTeamBtnProps} />}
            />
            <CompetitionsAction
              variant="join-team"
              title={t('Join a team')}
              description={t(
                'Browse existing public teams to find your perfect match.'
              )}
              actionElement={<ActionButton {...chooseTeamBtnProps} />}
            />
          </CompetitionsActionsContainer>
        </section>
      )}

      {/** List of available games */}
      <section>
        <h2 className="text-2xl mb-1">{t('Games')}</h2>
        <p className="mb-6 text-sm">
          <Trans
            i18nKey={
              'See all the live games on the cards below. <0>Find out how to create one</0>.'
            }
            components={[
              <ExternalLink
                className="underline"
                key="find-out"
                href={DocsLinks?.ASSET_TRANSFER_PROPOSAL}
              >
                Find out how to create one
              </ExternalLink>,
            ]}
          />
          {/** Docs: https://docs.vega.xyz/mainnet/tutorials/proposals/asset-transfer-proposal */}
        </p>

        <div className="mb-12 flex">
          {gamesLoading ? (
            <Loader size="small" />
          ) : (
            <GamesContainer data={gamesData} currentEpoch={currentEpoch} />
          )}
        </div>
      </section>

      {/** The teams ranking */}
      <section>
        <div className="mb-1 flex flex-row items-baseline gap-3 justify-between">
          <h2 className="text-2xl">
            <Link to={Links.COMPETITIONS_TEAMS()} className=" underline">
              {t('Leaderboard')}
            </Link>
          </h2>
          <Link to={Links.COMPETITIONS_TEAMS()} className="text-sm underline">
            {t('View all teams')}
          </Link>
        </div>
        <p className="mb-6 text-sm">
          {t(
            'Teams can earn rewards if they meet the goals set in the on-chain trading competitions. Track your earned rewards here, and see which teams are top of the leaderboard this month.'
          )}
        </p>

        <div className="flex">
          {teamsLoading ? (
            <Loader size="small" />
          ) : (
            <CompetitionsLeaderboard data={take(teamsData, 10)} />
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
};
