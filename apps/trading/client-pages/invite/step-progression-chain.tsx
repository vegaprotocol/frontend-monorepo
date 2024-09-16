import { useT } from '../../lib/use-t';
import { APP_NAME } from '../../lib/constants';
import { Step } from './step-utils';
import { cn, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

export const ProgressionChain = ({
  progression: steps,
  currentStep,
}: {
  progression: Step[];
  currentStep?: Step;
}) => {
  const t = useT();
  const StepLabel = {
    [Step.Connect]: t('ONBOARDING_STEP_CONNECT', { appName: APP_NAME }),
    [Step.Deposit]: t('ONBOARDING_STEP_DEPOSIT'),
    [Step.ApplyCode]: t('ONBOARDING_STEP_APPLY_CODE'),
    [Step.JoinTeam]: t('ONBOARDING_STEP_JOIN_TEAM'),
    [Step.StartPlaying]: t('ONBOARDING_STEP_START_PLAYING'),
  };

  const displayable = steps.filter((s) => s !== Step.Connect); // ignore connect
  const current = displayable.indexOf(currentStep as typeof displayable[0]);

  return (
    <ol className="list-none flex gap-0 mx-auto">
      {displayable.map((step, i) => {
        return (
          <li
            key={`onboarding-step-${i + 1}`}
            className="relative overflow-hidden flex flex-col items-center gap-2"
          >
            <div
              aria-hidden
              className={cn('border-b w-full absolute top-4', {
                'left-1/2': i === 0,
                'right-1/2': i === displayable.length - 1,
              })}
            ></div>
            <div
              className={cn(
                'relative border rounded-full w-8 h-8 text-center bg-surface-0',
                {
                  'bg-intent-primary text-intent-primary-foreground border-none':
                    i === current,
                  'bg-intent-success text-gs-950 border-none':
                    i < (current || 0),
                }
              )}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
                {i + 1 > (current || 0) ? (
                  i + 1
                ) : (
                  <VegaIcon name={VegaIconNames.TICK} />
                )}
              </span>
            </div>
            <div className="px-2">{StepLabel[step]}</div>
          </li>
        );
      })}
    </ol>
  );
};
