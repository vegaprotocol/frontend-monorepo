import { DepositContainer } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { Intent, TradingAnchorButton } from '@vegaprotocol/ui-toolkit';
import { GetStartedCheckList } from '../../components/welcome-dialog';
import {
  useGetOnboardingStep,
  useOnboardingStore,
  OnboardingStep,
} from '../../components/welcome-dialog/use-get-onboarding-step';
import { Links, Routes } from '../../pages/client-router';
import classNames from 'classnames';

export const Deposit = () => {
  return (
    <div className="flex justify-center w-full px-8 py-16">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl uppercase xl:text-5xl font-alpha calt">
          {t('Deposit')}
        </h1>
        <div className="mt-10">
          <DepositContainer />
          <DepositGetStarted />
        </div>
      </div>
    </div>
  );
};

const DepositGetStarted = () => {
  const onboardingDismissed = useOnboardingStore((store) => store.dismissed);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const step = useGetOnboardingStep();
  const wrapperClasses = classNames(
    'flex flex-col py-4 px-6 gap-4 rounded mt-6',
    'bg-vega-blue-300 dark:bg-vega-blue-700',
    'border border-vega-blue-350 dark:border-vega-blue-650'
  );

  if (onboardingDismissed) {
    return null;
  }

  return (
    <div className={wrapperClasses}>
      <h3 className="text-lg">{t('Get started')}</h3>
      <GetStartedCheckList />
      {step > OnboardingStep.ONBOARDING_DEPOSIT_STEP && (
        <TradingAnchorButton
          href={Links[Routes.HOME]()}
          onClick={() => dismiss()}
          intent={Intent.Info}
        >
          {t('Start trading')}
        </TradingAnchorButton>
      )}
    </div>
  );
};
