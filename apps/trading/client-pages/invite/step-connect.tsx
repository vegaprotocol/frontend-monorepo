import { Card } from '../../components/card';
import { Logo } from '../../components/logo';
import { APP_NAME } from '../../lib/constants';
import { ns, useT } from '../../lib/use-t';
import {
  Button,
  Intent,
  Loader,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  useConnect,
  useQuickstart,
  useWallet,
} from '@vegaprotocol/wallet-react';
import { Trans } from 'react-i18next';
import { useReferralSet } from '../referrals/hooks/use-find-referral-set';
import type { PropsWithChildren, ReactNode } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { Navigate, useNavigate } from 'react-router-dom';
import { usePartyProfilesQuery } from 'apps/trading/components/vega-wallet-connect-button/__generated__/PartyProfiles';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { StepHeader } from './step-header';
import type { ConnectorType, QuickStartConnector } from '@vegaprotocol/wallet';
import { useInviteStore } from './use-invite-store';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';

export const StepConnect = () => {
  const t = useT();

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

  // eslint-disable-next-line no-console
  console.log('invite', profileData);

  let header: ReactNode = t('ONBOARDING_INVITE_HEADER', {
    appName: APP_NAME,
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
          appName: APP_NAME,
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

  if (!currentStep) {
    throw new Error('step not found');
  }

  if (currentStep !== Step.Connect) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-4/6 mx-auto flex flex-col gap-10">
        <StepHeader title={header} />
        <ConnectionOptions />
      </div>
    </>
  );
};

const ConnectionOptions = () => {
  const navigate = useNavigate();
  const t = useT();
  const { connect, connectors } = useConnect();
  const error = useWallet((store) => store.error);

  const handleConnect = async (id: ConnectorType) => {
    const res = await connect(id);

    if (res.status === 'connected') {
      setTimeout(() => navigate(StepLinks[Step.Deposit]), 1000);
    }
  };

  const quickStartConnector = connectors.find(
    (c) => c.id === 'embedded-wallet-quickstart'
  );
  const injectedConnector = connectors.find((c) => c.id === 'injected');

  if (!quickStartConnector || !injectedConnector) {
    throw new Error('must provide quickstart or injected connector');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 row-auto gap-4">
      <Card className="grid grid-rows-[subgrid] gap-4 row-span-2 flex-1 p-8 items-center text-center border">
        <div className="flex flex-col gap-4 items-center justify-center">
          <LogoCircle>
            <VegaIcon name={VegaIconNames.ETHEREUM} size={25} />
          </LogoCircle>
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { option: quickStartConnector.name })}
          </h3>
          <p className="text-surface-1-fg-muted">
            {quickStartConnector.description}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <EmbeddQuickStartButton
            connector={quickStartConnector as QuickStartConnector}
            onSuccess={() => handleConnect(quickStartConnector.id)}
          />
        </div>
      </Card>
      <Card className="grid grid-rows-[subgrid] gap-4 row-span-2 flex-1 p-8 items-center text-center border">
        <div className="flex flex-col gap-4 items-center justify-center">
          <LogoCircle>
            <Logo />
          </LogoCircle>
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { option: injectedConnector.name })}
          </h3>
          <p className="text-surface-1-fg-muted">
            {injectedConnector.description}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <Button
            intent={Intent.Primary}
            size="lg"
            onClick={() => handleConnect(injectedConnector.id)}
          >
            {t('Connect wallet')}
          </Button>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      </Card>
    </div>
  );
};

const EmbeddQuickStartButton = (props: {
  connector: QuickStartConnector;
  onSuccess: () => void;
}) => {
  const t = useT();
  const { createWallet, error, isPending } = useQuickstart({
    connector: props.connector,
    onSuccess: props.onSuccess,
  });

  return (
    <>
      <Button
        intent={Intent.Primary}
        size="lg"
        onClick={createWallet}
        disabled={isPending}
        className="min-w-[140px]"
      >
        {isPending ? <Loader /> : t('Create wallet')}
      </Button>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </>
  );
};

const LogoCircle = (props: PropsWithChildren) => {
  return (
    <div className="w-14 h-14 rounded-full border flex items-center justify-center">
      {props.children}
    </div>
  );
};

const ErrorMessage = (props: PropsWithChildren) => {
  return (
    <p className="text-intent-danger text-sm first-letter:uppercase">
      {props.children}
    </p>
  );
};
