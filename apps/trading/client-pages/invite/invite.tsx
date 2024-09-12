import { Card } from '../../components/card';
import { TEMP_APP_NAME } from '../../lib/constants';
import { ns, useT } from '../../lib/use-t';
import {
  Button,
  cn,
  Dialog,
  Input,
  InputError,
  Intent,
  Loader,
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
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { CompactTeamStats } from '../../components/competitions/team-stats';
import { areTeamGames, useGames } from '../../lib/hooks/use-games';
import { JoinTeam } from '../competitions/join-team';
import { CompetitionsActions } from 'apps/trading/components/competitions/competitions-cta';
import {
  Link,
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { Links } from '../../lib/links';
import { usePartyProfilesQuery } from 'apps/trading/components/vega-wallet-connect-button/__generated__/PartyProfiles';
import { removePaginationWrapper } from '@vegaprotocol/utils';

enum Step {
  Connect = 'Connect',
  Deposit = 'Deposit',
  ApplyCode = 'ApplyCode',
  JoinTeam = 'JoinTeam',
  StartPlaying = 'StartPlaying',
}

const StepProgressions = {
  /**
   * The default onboarding progression, no special invitation given.
   */
  Default: [Step.Connect, Step.Deposit, Step.StartPlaying],

  /**
   * The onboarding progression when landed with a referral code.
   */
  Referral: [Step.Connect, Step.Deposit, Step.ApplyCode, Step.StartPlaying],

  /**
   * The onboarding progression when landed with a team invitation.
   */
  TeamInvitation: [
    Step.Connect,
    Step.Deposit,
    Step.JoinTeam /** goes to team after joining successfully */,
  ],

  /**
   * The onboarding progression when landed with both referral code
   * and team invitation.
   */
  ReferralAndTeamInvitation: [
    Step.Connect,
    Step.Deposit,
    Step.ApplyCode,
    Step.JoinTeam,
  ],
};

// TODO: Remove
const allSteps = [
  Step.Connect,
  Step.Deposit,
  Step.ApplyCode,
  Step.JoinTeam,
  Step.StartPlaying,
];

const StepRoutes = {
  [Step.Connect]: 'connect',
  [Step.Deposit]: 'deposit',
  [Step.ApplyCode]: 'apply-code',
  [Step.JoinTeam]: 'join-team',
  [Step.StartPlaying]: 'start-playing',
};

const StepLinks = {
  [Step.Connect]: '/invite/connect',
  [Step.Deposit]: '/invite/deposit',
  [Step.ApplyCode]: '/invite/apply-code',
  [Step.JoinTeam]: '/invite/join-team',
  [Step.StartPlaying]: '/invite/start-playing',
};

type InviteStore = {
  code?: string;
  team?: string;
  finished: number;
  started: number;
};
type InviteActions = {
  start: () => void;
  finish: () => void;
  setCode: (code: string) => void;
  setTeam: (teamId: string) => void;
};

const useInviteStore = create<InviteStore & InviteActions>()(
  persist(
    (set) => ({
      code: undefined,
      team: undefined,
      finished: 0,
      started: 0,
      start: () => {
        set({ started: Date.now(), finished: 0 });
      },
      finish: () => {
        set({ finished: Date.now() });
      },
      setCode: (code) => {
        set({ code });
      },
      setTeam: (teamId) => {
        set({ team: teamId });
      },
    }),
    {
      name: `${TEMP_APP_NAME.toLowerCase()}-invite-store`,
      version: 1,
    }
  )
);

export const Invite = () => {
  return (
    <>
      <Routes>
        <Route path="" element={<ProcessSteps />} />
        <Route path={StepRoutes[Step.Connect]} element={<StepConnect />} />
        <Route path={StepRoutes[Step.Deposit]} element={<StepDeposit />} />
        <Route path={StepRoutes[Step.ApplyCode]} element={<StepApplyCode />} />
        <Route path={StepRoutes[Step.JoinTeam]} element={<StepJoinTeam />} />
        <Route
          path={StepRoutes[Step.StartPlaying]}
          element={<StepStartPlaying />}
        />
      </Routes>
      <Traverse />
    </>
  );
};

const ProcessSteps = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get('code') || undefined;
  const team = params.get('team') || undefined;

  const {
    data: referralData,
    isEligible,
    loading: referralLoading,
  } = useReferralSet(code);
  const validReferral = Boolean(referralData && isEligible);

  const { team: teamData, loading: teamLoading } = useTeam(team);
  const validTeam = Boolean(teamData);

  const [storedCode, storedTeam, started, finished] = useInviteStore(
    (state) => [state.code, state.team, state.started, state.finished]
  );
  const [setCode, setTeam, start] = useInviteStore((state) => [
    state.setCode,
    state.setTeam,
    state.start,
  ]);

  const progression = determineStepProgression(storedCode, storedTeam);
  const { step: desiredStep, loading: stepLoading } =
    useDetermineCurrentStep(progression);

  const loading = referralLoading || teamLoading || stepLoading;

  useEffect(() => {
    if (loading) return;
    // already finished
    if (finished > 0) return;
    // already started, ignoring new code, team values TODO: Check this
    if (started > 0) return;

    if (code && validReferral) setCode(code);
    if (team && validTeam) setTeam(team);
    start();
  }, [
    code,
    finished,
    loading,
    setCode,
    setTeam,
    start,
    started,
    storedCode,
    storedTeam,
    team,
  ]);

  /**
   * Already finished onboarding, no need to go through the process again.
   */
  if (finished > 0) {
    return <Navigate to={Links.MARKETS()} />;
  }

  if (started <= 0 || loading) {
    return <Loader className="text-surface-0-fg" />;
  }

  if (desiredStep) {
    return <Navigate to={StepRoutes[desiredStep]} />;
  }

  return <div className="text-red">COULD NOT DETERMINE STEP</div>;
};

// TODO: Remove
const Traverse = () => {
  const location = useLocation();

  const matching = allSteps.map((s) =>
    matchPath(`/invite/${StepRoutes[s]}`, location.pathname)
  );
  const currentStep = matching.findIndex((m) => m != null);

  const next = currentStep + 1 >= allSteps.length ? 0 : currentStep + 1;
  const prev = currentStep - 1 < 0 ? allSteps.length - 1 : currentStep - 1;

  return (
    <div className="flex gap-4 mx-auto">
      <Link to={StepRoutes[allSteps[prev]]}>PREVIOUS</Link>
      <Link to={StepRoutes[allSteps[next]]}>NEXT</Link>
    </div>
  );
};

const determineStepProgression = (code?: string, team?: string) => {
  if (code && !team) return StepProgressions.Referral;
  if (!code && team) return StepProgressions.TeamInvitation;
  if (code && team) return StepProgressions.ReferralAndTeamInvitation;
  return StepProgressions.Default;
};
const useDetermineStepProgression = () => {
  const [code, team] = useInviteStore((state) => [state.code, state.team]);
  return determineStepProgression(code, team);
};

const useDetermineCurrentStep = (steps: Step[] = StepProgressions.Default) => {
  const { pubKey, status, isReadOnly } = useVegaWallet();
  const {
    requiredFunds,
    isEligible,
    loading: fundsLoading,
  } = useFundsAvailable(pubKey, true);
  const { data: referralSet, loading: referralLoading } =
    useFindReferralSet(pubKey);
  const { team, loading: teamLoading } = useMyTeam();

  const loading = fundsLoading || referralLoading || teamLoading;
  const connected = pubKey && status === 'connected' && !isReadOnly;

  let step = undefined;

  if (!loading) {
    if (steps.includes(Step.Connect) && !connected) {
      step = Step.Connect;
    } else if (steps.includes(Step.Deposit) && requiredFunds && !isEligible) {
      step = Step.Deposit;
    } else if (steps.includes(Step.ApplyCode) && !referralSet) {
      step = Step.ApplyCode;
    } else if (steps.includes(Step.JoinTeam) && !team) {
      step = Step.JoinTeam;
    } else if (steps.includes(Step.StartPlaying)) {
      step = Step.StartPlaying;
    }
  }

  return {
    step,
    loading,
  };
};

export const StepConnect = () => {
  const t = useT();
  const openWalletDialog = useDialogStore((state) => state.open);

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading: stepLoading } =
    useDetermineCurrentStep(progression);

  const [code, team] = useInviteStore((state) => [state.code, state.team]);
  const { data: referralData, loading: referralLoading } = useReferralSet(code);

  const { data: profileData, loading: profileLoading } = usePartyProfilesQuery({
    variables: {
      partyIds: referralData?.referrer ? [referralData.referrer] : [],
    },
    skip: !referralData?.referrer,
  });
  const referrerProfile = removePaginationWrapper(
    profileData?.partiesProfilesConnection?.edges
  ).find((p) => p.partyId === referralData?.referrer);

  const { team: teamData, loading: teamLoading } = useTeam(team);

  let invitedBy = referrerProfile?.alias || '';
  if (teamData && teamData.name.length > 0) {
    invitedBy = teamData.name;
  }

  console.log('invite', profileData);

  let header: ReactNode = t('ONBOARDING_INVITE_HEADER', {
    appName: TEMP_APP_NAME,
  });
  if (invitedBy.length > 0) {
    header = (
      <Trans
        i18nKey={'ONBOARDING_INVITE_BY_HEADER'}
        ns={ns}
        components={[
          <span key="invited-by-name" className="text-surface-0-fg">
            {invitedBy}
          </span>,
        ]}
        values={{
          appName: TEMP_APP_NAME,
          name: invitedBy,
        }}
      />
    );
  }

  const loading =
    stepLoading || referralLoading || profileLoading || teamLoading;

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.Connect) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={header} />
        <Card className="p-8 flex flex-col gap-4 items-center">
          {/** TODO: Change logo */}
          <VLogo />
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { appName: TEMP_APP_NAME })}
          </h3>
          <p>
            {t('ONBOARDING_STEP_CONNECT_DESCRIPTION', {
              appName: TEMP_APP_NAME,
            })}
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

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

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
        <Header title={t('ONBOARDING_HEADER', { appName: TEMP_APP_NAME })} />
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

export const StepApplyCode = () => {
  const t = useT();
  const [code, team] = useInviteStore((state) => [state.code, state.team]);
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
      code,
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
  }, [codeField, isPreviewEligible, previewData, previewLoading, t]);

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

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.ApplyCode) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={t('ONBOARDING_HEADER', { appName: TEMP_APP_NAME })} />
        <ProgressionChain currentStep={currentStep} progression={progression} />
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
                        <GradientText key="min-epochs">
                          {minEpochs} epochs
                        </GradientText>,
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
                  disabled: true,
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

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.JoinTeam) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  if (!team) {
    return (
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <Header title={t('ONBOARDING_HEADER', { appName: TEMP_APP_NAME })} />
        <ProgressionChain currentStep={currentStep} progression={progression} />
        <Card className="p-8 flex flex-col gap-4 ">ERROR</Card>
      </div>
    );
  }

  return (
    <div className="md:max-w-2xl mx-auto flex flex-col gap-10">
      <Header title={t('ONBOARDING_HEADER', { appName: TEMP_APP_NAME })} />
      <ProgressionChain currentStep={currentStep} progression={progression} />
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

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  console.log('invite', currentStep, loading);

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <Navigate to="" />;
  if (currentStep !== Step.StartPlaying) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <div className="mx-auto flex flex-col gap-10">
      <Header title={t('ONBOARDING_HEADER', { appName: TEMP_APP_NAME })} />
      <ProgressionChain currentStep={currentStep} progression={progression} />
      <CompetitionsActions myRole={myRole} myTeamId={myTeamId} />
    </div>
  );
};

const ProgressionChain = ({
  progression: steps,
  currentStep,
}: {
  progression: Step[];
  currentStep?: Step;
}) => {
  const t = useT();
  const StepLabel = {
    [Step.Connect]: t('ONBOARDING_STEP_CONNECT', { appName: TEMP_APP_NAME }),
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

const Header = ({ title }: { title: ReactNode }) => (
  <h1 className="text-5xl text-center">
    <GradientText>{title}</GradientText>
  </h1>
);
