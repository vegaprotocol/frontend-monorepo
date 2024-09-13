import { useT } from '../../lib/use-t';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';
import { StepHeader } from './step-header';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { Navigate } from 'react-router-dom';
import { ProgressionChain } from './step-progression-chain';
import { APP_NAME } from '../../lib/constants';
import { Card } from '../../components/card';
import { useOnboardStore } from '../../stores/onboard';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { areTeamGames, useGames } from '../../lib/hooks/use-games';
import { useTeam } from '../../lib/hooks/use-team';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { CompactTeamStats } from '../../components/competitions/team-stats';
import { JoinTeam } from '../competitions/join-team';
import last from 'lodash/last';

export const StepJoinTeam = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const [teamId, finished, finish] = useOnboardStore((state) => [
    state.team,
    state.finished,
    state.finish,
  ]);

  const {
    team,
    stats,
    members,
    partyTeam,
    refetch,
    loading: teamLoading,
  } = useTeam(teamId, pubKey);
  const { data: games, loading: gamesLoading } = useGames({ teamId });

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading: stepLoading } =
    useDetermineCurrentStep(progression);

  const loading = teamLoading || gamesLoading || stepLoading;

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.JoinTeam) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  if (!team || !teamId) {
    return (
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
        <ProgressionChain currentStep={currentStep} progression={progression} />
        <Card className="p-8 flex flex-col gap-4 ">ERROR</Card>
      </div>
    );
  }

  const onSuccess = () => {
    refetch();
    const lastStep = last(progression);
    if (!currentStep || !lastStep) return;
    if (currentStep === lastStep && finished === 0) {
      finish();
    }
  };

  return (
    <div className="md:max-w-2xl mx-auto flex flex-col gap-10">
      <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      <ProgressionChain currentStep={currentStep} progression={progression} />
      <Card className="p-8 flex flex-col gap-4">
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
      </Card>
    </div>
  );
};
