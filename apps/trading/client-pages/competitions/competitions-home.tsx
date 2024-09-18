import { useT } from '../../lib/use-t';
import { ExternalLink, Loader } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import { Links } from '../../lib/links';
import { CompetitionsActions } from '../../components/competitions/competitions-cta';
import { CompetitionsLeaderboard } from '../../components/competitions/competitions-leaderboard';
import { useTeams } from '../../lib/hooks/use-teams';
import take from 'lodash/take';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { TeamCard } from '../../components/competitions/team-card';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { Trans } from 'react-i18next';
import { DocsLinks } from '@vegaprotocol/environment';
import { HeaderHero } from '../../components/header-hero';
import { ErrorBoundary } from '../../components/error-boundary';
import { SimpleRewardCardsContainer } from '../../components/rewards-container/simple-reward-cards-container';

export const CompetitionsHome = () => {
  const t = useT();
  usePageTitle(t('Competitions'));

  const { data: teamsData, loading: teamsLoading } = useTeams();

  const {
    team: myTeam,
    stats: myTeamStats,
    games: myTeamGames,
    rank: myTeamRank,
    role: myRole,
    teamId: myTeamId,
  } = useMyTeam();

  return (
    <ErrorBoundary feature="competitions">
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
        <section className="mb-12">
          {/** Get started */}
          <h2 className="text-2xl mb-6">{t('Get started')}</h2>

          <CompetitionsActions myRole={myRole} myTeamId={myTeamId} />
        </section>
      )}

      {/** List of available games */}
      <section className="mb-12">
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

        <SimpleRewardCardsContainer />
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
