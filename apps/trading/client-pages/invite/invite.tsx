import { useNavigate, useRoutes } from 'react-router-dom';

import { Step, useOnboardStore } from '../../stores/onboard';
import { StepRoutes } from './step-utils';

import { InviteRoot } from './invite-root';
import { StepDeposit } from './step-deposit';
import { StepApplyCode } from './step-apply-code';
import { StepJoinTeam } from './step-join-team';
import { StepStartPlaying } from './step-start-playing';
import { StepInit } from './step-init';
import { Connect } from './connect';

export const Invite = () => {
  const navigate = useNavigate();
  const store = useOnboardStore();

  // Increment step and navigate
  const handleComplete = () => {
    store.next();
    navigate(StepRoutes[store.steps[store.step + 1]]);
  };

  // Go to the first step when connected
  const handleConnect = () => {
    navigate(StepRoutes[store.steps[store.step]]);
  };

  const routes = useRoutes([
    {
      element: <InviteRoot />,
      children: [
        {
          index: true,
          element: <StepInit />,
        },
        {
          path: StepRoutes[Step.Connect],
          element: <Connect onComplete={handleConnect} />,
        },
        {
          path: StepRoutes[Step.Deposit],
          element: <StepDeposit onComplete={handleComplete} />,
        },
        {
          path: StepRoutes[Step.ApplyCode],
          element: <StepApplyCode onComplete={handleComplete} />,
        },
        {
          path: StepRoutes[Step.JoinTeam],
          element: <StepJoinTeam onComplete={handleComplete} />,
        },
        {
          path: StepRoutes[Step.StartPlaying],
          element: <StepStartPlaying />,
        },
      ],
    },
  ]);

  return routes;
};
