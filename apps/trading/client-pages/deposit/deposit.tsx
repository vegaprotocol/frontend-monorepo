import { DepositContainer } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { Intent, TradingAnchorButton } from '@vegaprotocol/ui-toolkit';
import { GetStartedCheckList } from '../../components/welcome-dialog';
import {
  useGetOnboardingStep,
  useOnboardingStore,
  OnboardingStep,
} from '../../components/welcome-dialog/use-get-onboarding-step';
import { Links } from '../../lib/links';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';

export const Deposit = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;
  return (
    <div className="flex flex-col gap-6">
      <DepositContainer assetId={assetId} />
      <DepositGetStarted />
    </div>
  );
};

const DepositGetStarted = () => {
  const onboardingDismissed = useOnboardingStore((store) => store.dismissed);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const step = useGetOnboardingStep();
  const wrapperClasses = classNames(
    'flex flex-col py-4 px-6 gap-4 rounded',
    'bg-vega-blue-300 dark:bg-vega-blue-700',
    'border border-vega-blue-350 dark:border-vega-blue-650'
  );

  // Dont show unless still onboarding
  if (onboardingDismissed) {
    return null;
  }

  return (
    <div className="pt-6 border-t border-default">
      <div className={wrapperClasses}>
        <h3 className="text-lg">{t('Get started')}</h3>
        <GetStartedCheckList />
        {step > OnboardingStep.ONBOARDING_DEPOSIT_STEP && (
          <TradingAnchorButton
            href={Links.HOME()}
            onClick={() => dismiss()}
            intent={Intent.Info}
          >
            {t('Start trading')}
          </TradingAnchorButton>
        )}
      </div>
    </div>
  );
};
