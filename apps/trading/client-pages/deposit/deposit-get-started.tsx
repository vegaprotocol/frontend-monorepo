import { cn } from '@vegaprotocol/ui-toolkit';
import { Intent, AnchorButton } from '@vegaprotocol/ui-toolkit';
import { GetStartedCheckList } from '../../components/welcome-dialog';
import { useOnboardingStore } from '../../stores/onboarding';
import {
  useGetOnboardingStep,
  OnboardingStep,
} from '../../lib/hooks/use-get-onboarding-step';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

export const DepositGetStarted = () => {
  const t = useT();
  const onboardingDismissed = useOnboardingStore((store) => store.dismissed);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const step = useGetOnboardingStep();
  const wrapperClasses = cn(
    'flex flex-col py-4 px-6 gap-4 rounded',
    'bg-blue-300 dark:bg-blue-700',
    'border border-blue-350 dark:border-blue-650'
  );

  // Dont show unless still onboarding
  if (onboardingDismissed) {
    return null;
  }

  return (
    <div className="pt-6 border-t border-gs-300 dark:border-gs-700">
      <div className={wrapperClasses}>
        <h3 className="text-lg">{t('Get started')}</h3>
        <GetStartedCheckList />
        {step > OnboardingStep.ONBOARDING_DEPOSIT_STEP && (
          <AnchorButton
            href={Links.HOME()}
            onClick={() => dismiss()}
            intent={Intent.Info}
          >
            {t('Start trading')}
          </AnchorButton>
        )}
      </div>
    </div>
  );
};
