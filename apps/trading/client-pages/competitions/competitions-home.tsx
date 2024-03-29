import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '@sentry/react';
import { CompetitionsHeader } from '../../components/competitions/competitions-header';
import {
  ExternalLink,
  Intent,
  Loader,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';
import { useEpochInfoQuery } from '../../lib/hooks/__generated__/Epoch';
import { Link, useNavigate } from 'react-router-dom';
import { Links } from '../../lib/links';
import {
  CompetitionsAction,
  CompetitionsActionsContainer,
} from '../../components/competitions/competitions-cta';
import { GamesContainer } from '../../components/competitions/games-container';
import { CompetitionsLeaderboard } from '../../components/competitions/competitions-leaderboard';
import { useTeams } from '../../lib/hooks/use-teams';
import take from 'lodash/take';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { TeamCard } from '../../components/competitions/team-card';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { useRewards } from '../../lib/hooks/use-rewards';
import { Trans } from 'react-i18next';
import { DocsLinks } from '@vegaprotocol/environment';

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
  } = useMyTeam();

  return (
    <ErrorBoundary>
      <CompetitionsHeader title={t('Competitions')}>
        <p className="text-lg mb-3">
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
        <p className="text-lg mb-1">
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
      </CompetitionsHeader>

      {/** Team card */}
      {myTeam ? (
        <>
          <h2 className="text-2xl mb-6">{t('My team')}</h2>
          <div className="mb-12">
            <TeamCard
              team={myTeam}
              rank={myTeamRank}
              stats={myTeamStats}
              games={myTeamGames}
            />
          </div>
        </>
      ) : (
        <>
          {/** Get started */}
          <h2 className="text-2xl mb-6">{t('Get started')}</h2>

          <CompetitionsActionsContainer>
            <CompetitionsAction
              variant="A"
              title={t('Create a team')}
              description={t(
                'Create a new team, share your code with potential members, or set a whitelist for an exclusive group.'
              )}
              actionElement={
                <TradingButton
                  intent={Intent.Primary}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(Links.COMPETITIONS_CREATE_TEAM());
                  }}
                  data-testId="create-public-team-button"
                >
                  {t('Create a public team')}
                </TradingButton>
              }
            />
            <CompetitionsAction
              variant="B"
              title={t('Solo team / lone wolf')}
              description={t(
                'Want to compete but think the best team size is one? This is the option for you.'
              )}
              actionElement={
                <TradingButton
                  intent={Intent.Primary}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(Links.COMPETITIONS_CREATE_TEAM_SOLO());
                  }}
                >
                  {t('Create a private team')}
                </TradingButton>
              }
            />
            <CompetitionsAction
              variant="C"
              title={t('Join a team')}
              description={t(
                'Browse existing public teams to find your perfect match.'
              )}
              actionElement={
                <TradingButton
                  intent={Intent.Primary}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(Links.COMPETITIONS_TEAMS());
                  }}
                >
                  {t('Choose a team')}
                </TradingButton>
              }
            />
          </CompetitionsActionsContainer>
        </>
      )}

      {/** List of available games */}
      <h2 className="text-2xl mb-1">{t('Games')}</h2>
      <p className="mb-6 text-sm">
        <Trans
          i18nKey={
            'See all the live games on the cards below. Every on-chain game is community funded and designed. <0>Find out how to create one</0>.'
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

      {/** The teams ranking */}
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
    </ErrorBoundary>
  );
};
