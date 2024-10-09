import { useT } from '../../lib/use-t';
import { useFundsAvailable } from '../../lib/hooks/use-funds-available';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';
import { StepHeader } from './step-header';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { Navigate, useNavigate } from 'react-router-dom';
import { ProgressionChain } from './step-progression-chain';
import { Card } from '../../components/card';
import { OnboardDeposit } from '../../components/deposit-container';
import { ExitInvite } from './exit-invite';
import { ONBOARDING_TARGET_ASSET } from '../../lib/constants';

export const StepDeposit = () => {
  const navigate = useNavigate();
  const t = useT();
  const { requiredFunds, sumOfFunds } = useFundsAvailable();

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  // eslint-disable-next-line no-console
  console.info(
    'STEP_DEPOSIT: The sum of funds (qUSD) of the connected key: ',
    sumOfFunds.toNumber()
  );

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <ExitInvite />;
  if (currentStep !== Step.Deposit) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <StepHeader title={t('ONBOARDING_STEP_DEPOSIT')} />
        <ProgressionChain currentStep={currentStep} progression={progression} />
        <Card className="p-8 flex flex-col gap-4 ">
          <OnboardDeposit
            onDeposit={() => {
              navigate(StepLinks[Step.JoinTeam]);
            }}
            minAmount={requiredFunds?.toString()}
            initialAssetId={ONBOARDING_TARGET_ASSET}
          />
        </Card>
      </div>
    </>
  );
};
