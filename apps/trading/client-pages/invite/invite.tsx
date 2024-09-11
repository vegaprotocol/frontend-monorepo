import { Card } from '../../components/card';
import { APP_NAME } from '../../lib/constants';
import { ns, useT } from '../../lib/use-t';
import {
  Button,
  cn,
  Dialog,
  Input,
  InputError,
  Intent,
  VegaIcon,
  VegaIconNames,
  VLogo,
} from '@vegaprotocol/ui-toolkit';
import {
  useDialogStore,
  useSimpleTransaction,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import { Trans } from 'react-i18next';
import { QUSDTooltip } from '../referrals/qusd-tooltip';
import { useFundsAvailable } from '../referrals/hooks/use-funds-available';
import { DepositContainer } from '../../components/deposit-container';
import { GradientText } from '../../components/gradient-text';
import {
  useFindReferralSet,
  useReferralSet,
} from '../referrals/hooks/use-find-referral-set';
import { useMyTeam } from '../../lib/hooks/use-my-team';
import { useReferralProgram } from '../referrals/hooks/use-referral-program';
import minBy from 'lodash/minBy';
import { useForm } from 'react-hook-form';
import { TransactionSteps } from '../../components/transaction-dialog/transaction-steps';
import { useCallback, useState } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { CompactTeamStats } from '../../components/competitions/team-stats';
import { areTeamGames, useGames } from '../../lib/hooks/use-games';
import { JoinTeam } from '../competitions/join-team';
import { CompetitionsActions } from 'apps/trading/components/competitions/competitions-cta';

export const Invite = () => {
  return <StepStartPlaying />;
};

enum Step {
  Connect = 'Connect',
  Deposit = 'Deposit',
  ApplyCode = 'ApplyCode',
  JoinTeam = 'JoinTeam',
  StartPlaying = 'StartPlaying',
}

const DEFAULT_STEPS = [Step.Connect, Step.Deposit, Step.StartPlaying];

const useDetermineSteps = () => {
  // TODO: Read from store
  return DEFAULT_STEPS;
};

const useDetermineCurrentStep = (steps: Step[] = DEFAULT_STEPS) => {
  const { pubKey, status, isReadOnly } = useVegaWallet();
  const { isEligible } = useFundsAvailable();
  const { data: referralSet } = useFindReferralSet(pubKey);
  const { team } = useMyTeam();

  const connected = pubKey && status === 'connected' && !isReadOnly;

  if (steps.includes(Step.Connect) && !connected) {
    return Step.Connect;
  }
  if (steps.includes(Step.Deposit) && !isEligible) {
    return Step.Deposit;
  }
  if (steps.includes(Step.ApplyCode) && !referralSet) {
    return Step.ApplyCode;
  }
  if (steps.includes(Step.JoinTeam) && !team) {
    return Step.JoinTeam;
  }
  if (steps.includes(Step.StartPlaying)) {
    return Step.StartPlaying;
  }

  return undefined;
};

export const StepConnect = () => {
  const t = useT();
  const openWalletDialog = useDialogStore((state) => state.open);
  const { pubKey, status } = useVegaWallet();
  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={t('ONBOARDING_INVITE_HEADER', { appName: APP_NAME })} />
        <Card className="p-8 flex flex-col gap-4 items-center">
          {/** TODO: Change logo */}
          <VLogo />
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { appName: APP_NAME })}
          </h3>
          <p>
            {t('ONBOARDING_STEP_CONNECT_DESCRIPTION', { appName: APP_NAME })}
          </p>
          <Button intent={Intent.Primary} size="lg" onClick={openWalletDialog}>
            {t('Connect wallet')}
          </Button>
        </Card>
      </div>
    </>
  );
};
export const StepDeposit = () => {
  const t = useT();
  const { requiredFunds } = useFundsAvailable();
  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
        {/** TODO: Determine step */}
        <StepsChain
          currentStep={0}
          steps={[
            Step.Deposit,
            Step.ApplyCode,
            Step.JoinTeam,
            Step.StartPlaying,
          ]}
        />
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

export const StepApplyCode = () => {
  const t = useT();

  const program = useReferralProgram();

  const firstBenefitTier = minBy(program.benefitTiers, (bt) => bt.epochs);
  const minEpochs = firstBenefitTier ? firstBenefitTier.epochs : 0;

  type formFields = { code: string };

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<formFields>({
    defaultValues: {
      code: undefined, // TODO: Get this from state
    },
  });

  const codeField = watch('code');

  const {
    data: previewData,
    loading: previewLoading,
    isEligible: isPreviewEligible,
  } = useReferralSet(
    codeField && codeField.length === 64 ? codeField : undefined
  );

  const validateSet = useCallback(() => {
    if (codeField && !previewLoading && previewData && !isPreviewEligible) {
      return t('The code is no longer valid.');
    }
    if (codeField && !previewLoading && !previewData) {
      return t('The code is invalid');
    }
    return true;
  }, [codeField, isPreviewEligible, previewData, previewLoading]);

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const { error, reset, result, send, status } = useSimpleTransaction();

  const onSubmit = ({ code }: formFields) => {
    setTxDialogOpen(true);
    send({
      applyReferralCode: {
        id: code as string,
      },
    });
  };

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
        {/** TODO: Determine step */}
        <StepsChain
          currentStep={1}
          steps={[
            Step.Deposit,
            Step.ApplyCode,
            Step.JoinTeam,
            Step.StartPlaying,
          ]}
        />
        <Card className="p-8 flex flex-col gap-4 ">
          {firstBenefitTier ? (
            <dl className="flex flex-col gap-2 items-center border-b pb-4">
              <dt className="text-6xl">
                <GradientText>{firstBenefitTier.discount}</GradientText>
              </dt>
              <dd className="flex flex-col gap-1 items-center">
                <span className="text-2xl">
                  {t('ONBOARDING_STEP_APPLY_CODE_DISCOUNT_DESCRIPTION')}
                </span>
                {minEpochs > 0 && (
                  <span>
                    <Trans
                      i18nKey={
                        'ONBOARDING_STEP_APPLY_CODE_DISCOUNT_REQUIREMENTS'
                      }
                      values={{ minEpochs }}
                      components={[
                        <GradientText>{minEpochs} epochs</GradientText>,
                      ]}
                      ns={ns}
                    />
                  </span>
                )}
              </dd>
            </dl>
          ) : null}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <label className="flex flex-col gap-1">
              <span>{t('ONBOARDING_STEP_APPLY_CODE_FIELD')}</span>
              <Input
                {...register('code', {
                  required: t('ONBOARDING_STEP_APPLY_CODE_FIELD_REQUIRED'),
                  minLength: {
                    value: 64,
                    message: t('ONBOARDING_STEP_APPLY_CODE_FIELD_MIN_LENGTH'),
                  },
                  validate: () => validateSet(),
                })}
              />
            </label>
            <Button intent={Intent.Primary} type="submit">
              {t('ONBOARDING_STEP_APPLY_CODE_SUBMIT')}
            </Button>
            {errors.code && <InputError>{errors.code.message}</InputError>}
          </form>
          <Dialog
            title={t('ONBOARDING_STEP_APPLY_CODE')}
            open={txDialogOpen}
            onChange={(open) => {
              setTxDialogOpen(open);
            }}
          >
            <TransactionSteps
              status={status}
              result={result}
              error={error}
              // TODO: If next is join team then diff label needed
              confirmedLabel={t('ONBOARDING_STEP_START_PLAYING')}
              reset={() => {
                reset();
                setTxDialogOpen(false);
              }}
              resetLabel={t('Dismiss')}
            />
          </Dialog>
        </Card>
      </div>
    </>
  );
};
export const StepJoinTeam = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  // TODO: Get this from state
  const teamId =
    'eaa71ff8b3fd5b2d2abc3d6d1d28616cca821216e9c7d630b8108e48138b2421';

  const { team, stats, members, partyTeam, refetch } = useTeam(teamId, pubKey);
  const { data: games, loading: gamesLoading } = useGames({ teamId });

  if (!team) {
    return (
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
        {/** TODO: Determine step */}
        <StepsChain
          currentStep={2}
          steps={[
            Step.Deposit,
            Step.ApplyCode,
            Step.JoinTeam,
            Step.StartPlaying,
          ]}
        />
        <Card className="p-8 flex flex-col gap-4 ">ERROR</Card>
      </div>
    );
  }

  return (
    <div className="md:max-w-2xl mx-auto flex flex-col gap-10">
      <Header title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      {/** TODO: Determine step */}
      <StepsChain
        currentStep={2}
        steps={[Step.Deposit, Step.ApplyCode, Step.JoinTeam, Step.StartPlaying]}
      />
      <Card className="p-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 items-center">
          <TeamAvatar teamId={teamId} />
          <h3 className="text-2xl text-center">{team?.name}</h3>
          <div className="w-full h-px border-b"></div>
          <CompactTeamStats
            stats={stats}
            members={members}
            games={areTeamGames(games) ? games : undefined}
          />
        </div>

        <JoinTeam team={team} partyTeam={partyTeam} refetch={refetch} />
      </Card>
    </div>
  );
};

const StepStartPlaying = () => {
  const t = useT();
  const { role: myRole, teamId: myTeamId } = useMyTeam();

  return (
    <div className="mx-auto flex flex-col gap-10">
      <Header title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
      {/** TODO: Determine step */}
      <StepsChain
        currentStep={3}
        steps={[Step.Deposit, Step.ApplyCode, Step.JoinTeam, Step.StartPlaying]}
      />
      <CompetitionsActions myRole={myRole} myTeamId={myTeamId} />
    </div>
  );
};

const StepsChain = ({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep?: number;
}) => {
  const t = useT();
  const StepLabel = {
    [Step.Connect]: t('ONBOARDING_STEP_CONNECT', { appName: APP_NAME }),
    [Step.Deposit]: t('ONBOARDING_STEP_DEPOSIT'),
    [Step.ApplyCode]: t('ONBOARDING_STEP_APPLY_CODE'),
    [Step.JoinTeam]: t('ONBOARDING_STEP_JOIN_TEAM'),
    [Step.StartPlaying]: t('ONBOARDING_STEP_START_PLAYING'),
  };
  return (
    <ol className="list-none flex gap-0 mx-auto">
      {steps.map((step, i) => (
        <li
          key={`onboarding-step-${i + 1}`}
          className="relative overflow-hidden flex flex-col items-center gap-2"
        >
          <div
            aria-hidden
            className={cn('border-b w-full absolute top-4', {
              'left-1/2': i === 0,
              'right-1/2': i === steps.length - 1,
            })}
          ></div>
          <div
            className={cn(
              'relative border rounded-full w-8 h-8 text-center bg-surface-0',
              {
                'bg-intent-primary text-intent-primary-foreground border-none':
                  i === currentStep,
                'bg-intent-success text-gs-950 border-none':
                  i < (currentStep || 0),
              }
            )}
          >
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
              {i + 1 > (currentStep || 0) ? (
                i + 1
              ) : (
                <VegaIcon name={VegaIconNames.TICK} />
              )}
            </span>
          </div>
          <div className="px-2">{StepLabel[step]}</div>
        </li>
      ))}
    </ol>
  );
};

const Header = ({ title }: { title: string }) => (
  <h1 className="text-5xl text-center">
    <GradientText>{title}</GradientText>
  </h1>
);
