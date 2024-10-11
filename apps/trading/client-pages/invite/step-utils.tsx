import { Step } from '../../stores/onboard';

export const StepRoutes = {
  [Step.Connect]: 'connect',
  [Step.Deposit]: 'deposit',
  [Step.ApplyCode]: 'apply-code',
  [Step.JoinTeam]: 'join-team',
  [Step.StartPlaying]: 'start-playing',
};

export const StepLinks = {
  [Step.Connect]: '/invite/connect',
  [Step.Deposit]: '/invite/deposit',
  [Step.ApplyCode]: '/invite/apply-code',
  [Step.JoinTeam]: '/invite/join-team',
  [Step.StartPlaying]: '/invite/start-playing',
};
