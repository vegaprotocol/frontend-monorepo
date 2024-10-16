import { useT } from '../../lib/use-t';
import { StepHeader } from './step-header';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../lib/constants';
import { Card } from '../../components/card';
import { useOnboardStore } from '../../stores/onboard';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { areTeamGames, useGames } from '../../lib/hooks/use-games';
import { useTeam } from '../../lib/hooks/use-team';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { CompactTeamStats } from '../../components/competitions/team-stats';
import { JoinTeam } from '../competitions/join-team';
import { Links } from '../../lib/links';
import { ProgressionChain } from './step-progression-chain';
import { useCheckReferralSet } from './use-check-referral-set';

export const StepJoinTeam = (props: { onComplete: () => void }) => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  useCheckReferralSet();

  const teamId = useOnboardStore((s) => s.team);
  const step = useOnboardStore((s) => s.step);
  const steps = useOnboardStore((s) => s.steps);

  const {
    team,
    stats,
    members,
    partyTeam,
    refetch,
    loading: teamLoading,
  } = useTeam(teamId, pubKey);

  const { data: games, loading: gamesLoading } = useGames({ teamId });

  const loading = teamLoading || gamesLoading;

  const onSuccess = () => {
    refetch();
    props.onComplete();
  };

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }

  return (
    <div className="md:max-w-2xl mx-auto flex flex-col gap-10">
      <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      <ProgressionChain currentStep={step} progression={steps} />
      <Card className="p-8 flex flex-col gap-4">
        {team && teamId ? (
          <>
            <div className="flex flex-col gap-4 items-center">
              <TeamAvatar teamId={teamId} />
              <h3 className="text-2xl text-center">{team?.name}</h3>
              <div className="w-full h-px border-b"></div>
              <CompactTeamStats
                stats={stats}
                members={members}
                games={areTeamGames(games) ? games : undefined}
              />
            </div>

            <JoinTeam team={team} partyTeam={partyTeam} onSuccess={onSuccess} />
          </>
        ) : (
          <div>
            {/* TODO: handle team not found */}
            no team
          </div>
        )}
      </Card>
      <p className="flex gap-4 justify-center text-center">
        <Link to={Links.MARKETS()} className="underline underline-offset-4">
          {t('Go to markets')}
        </Link>
      </p>
    </div>
  );
};
