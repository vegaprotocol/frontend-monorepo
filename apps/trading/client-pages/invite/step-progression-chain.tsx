import { useT } from '../../lib/use-t';
import { cn, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Step } from '../../stores/onboard';

export const ProgressionChain = ({
  progression: steps,
  currentStep,
}: {
  progression: Step[];
  currentStep: number;
}) => {
  const t = useT();
  const StepLabel = {
    [Step.Connect]: '',
    [Step.Deposit]: t('ONBOARDING_STEP_DEPOSIT'),
    [Step.ApplyCode]: t('ONBOARDING_STEP_APPLY_CODE'),
    [Step.JoinTeam]: t('ONBOARDING_STEP_JOIN_TEAM'),
    [Step.StartPlaying]: t('ONBOARDING_STEP_START_PLAYING'),
  };

  return (
    <ol className="list-none flex gap-0 mx-auto">
      {steps.map((step, i) => {
        const isComplete = currentStep > i;
        const isCurrent = currentStep === i;

        return (
          <li
            key={step}
            className="relative overflow-hidden flex flex-col items-center gap-2"
          >
            <div
              aria-hidden
              className={cn('border-b w-full absolute top-4', {
                'left-1/2': i === 0,
                'right-1/2': i === steps.length - 1,
              })}
            />
            <div
              className={cn(
                'relative border rounded-full w-8 h-8 text-center bg-surface-0',
                {
                  'bg-intent-primary text-intent-primary-foreground border-none':
                    isCurrent,
                  'bg-intent-success text-gs-950 border-none': isComplete,
                }
              )}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
                {isComplete ? <VegaIcon name={VegaIconNames.TICK} /> : i + 1}
              </span>
            </div>
            <div className="px-2">{StepLabel[step]}</div>
          </li>
        );
      })}
    </ol>
  );
};
