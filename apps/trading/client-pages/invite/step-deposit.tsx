import { ns, useT } from '../../lib/use-t';
import { useFundsAvailable } from '../../lib/hooks/use-funds-available';
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
import { Trans } from 'react-i18next';
import { QUSDTooltip } from '../referrals/qusd-tooltip';
import { DepositContainer } from '../../components/deposit-container';

export const StepDeposit = () => {
  const t = useT();
  const { requiredFunds } = useFundsAvailable();

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  const { sumOfFunds } = useFundsAvailable();
  // eslint-disable-next-line no-console
  console.info(
    'STEP_DEPOSIT: The sum of funds (qUSD) of the connected key: ',
    sumOfFunds.toNumber()
  );

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.Deposit) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
        <ProgressionChain currentStep={currentStep} progression={progression} />
        <Card className="p-8 flex flex-col gap-4 ">
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_DEPOSIT_HEADER', { requiredFunds })}
          </h3>
          <p>
            <Trans
              defaults="To protect the network from spam, you must have at least {{requiredFunds}} <0>qUSD</0> of any asset on the network to proceed."
              values={{
                requiredFunds,
              }}
              components={[<QUSDTooltip key="qusd" />]}
              ns={ns}
            />
          </p>

          <DepositContainer />
        </Card>
      </div>
    </>
  );
};
