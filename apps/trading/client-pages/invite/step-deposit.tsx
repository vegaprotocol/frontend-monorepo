import { useT } from '../../lib/use-t';
import { useFundsAvailable } from '../../lib/hooks/use-funds-available';
import { StepHeader } from './step-header';
import { Link } from 'react-router-dom';
import { Card } from '../../components/card';
import { OnboardDeposit } from '../../components/deposit-container';
import { ONBOARDING_TARGET_ASSET } from '../../lib/constants';
import { Links } from '../../lib/links';
import { useOnboardStore } from '../../stores/onboard';
import { ProgressionChain } from './step-progression-chain';

export const StepDeposit = (props: { onComplete: () => void }) => {
  const t = useT();
  const { requiredFunds, sumOfFunds } = useFundsAvailable();
  const step = useOnboardStore((s) => s.step);
  const steps = useOnboardStore((s) => s.steps);

  // eslint-disable-next-line no-console
  console.info(
    'STEP_DEPOSIT: The sum of funds (qUSD) of the connected key: ',
    sumOfFunds.toNumber()
  );

  return (
    <div className="md:w-7/12 mx-auto flex flex-col gap-10">
      <StepHeader title={t('ONBOARDING_STEP_DEPOSIT')} />
      <ProgressionChain currentStep={step} progression={steps} />
      <Card className="p-8 flex flex-col gap-4 ">
        <OnboardDeposit
          onDeposit={props.onComplete}
          minAmount={requiredFunds?.toString()}
          initialAssetId={ONBOARDING_TARGET_ASSET}
        />
      </Card>
      <p className="flex gap-4 justify-center text-center">
        <Link to={Links.MARKETS()} className="underline underline-offset-4">
          {t('Go to markets')}
        </Link>
      </p>
    </div>
  );
};
