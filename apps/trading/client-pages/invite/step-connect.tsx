import { Card } from '../../components/card';
import { APP_NAME } from '../../lib/constants';
import { ns, useT } from '../../lib/use-t';
import {
  Button,
  ButtonLink,
  Intent,
  Loader,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  useConnect,
  useConnector,
  useQuickstart,
  useWallet,
} from '@vegaprotocol/wallet-react';
import { Trans } from 'react-i18next';
import { useReferralSet } from '../referrals/hooks/use-find-referral-set';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { useTeam } from '../../lib/hooks/use-team';
import { Navigate, useNavigate } from 'react-router-dom';
import { StepHeader } from './step-header';
import type { ConnectorType, QuickStartConnector } from '@vegaprotocol/wallet';
import { useOnboardStore } from '../../stores/onboard';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';
import { usePartyProfile } from '../../lib/hooks/use-party-profiles';
import { GradientText } from 'apps/trading/components/gradient-text';

export const StepConnect = () => {
  const t = useT();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading: stepLoading } =
    useDetermineCurrentStep(progression);

  const [code, team] = useOnboardStore((state) => [state.code, state.team]);

  const { data: referralData, loading: referralLoading } = useReferralSet(code);
  const { team: teamData, loading: teamLoading } = useTeam(team);

  const partyId = teamData?.referrer || referralData?.referrer;
  const { data: profileData, loading: profileLoading } =
    usePartyProfile(partyId);

  let header: ReactNode = t('ONBOARDING_INVITE_HEADER', {
    appName: APP_NAME,
  });

  if (profileData && profileData.alias.length > 0) {
    header = (
      <Trans
        i18nKey={'ONBOARDING_INVITE_BY_HEADER'}
        ns={ns}
        components={[
          <span key="invited-by-name" className="text-surface-0-fg">
            {profileData.alias}
          </span>,
        ]}
        values={{
          appName: APP_NAME,
          name: profileData.alias,
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
        <StepHeader title={header}>
          {teamData && (
            <p className="bg-surface-1 text-surface-1-fg rounded-full py-4 px-6">
              <GradientText>Team: {teamData.name}</GradientText>
            </p>
          )}
        </StepHeader>
        <ProminentConnectionOptions />
        <p className="text-center">
          <ButtonLink onClick={() => setShowAdvanced(true)}>
            {t('Advanced connection options')}
          </ButtonLink>
        </p>
        {showAdvanced && <SecondaryConnectionOptions />}
      </div>
    </>
  );
};

const ProminentConnectionOptions = () => {
  const navigate = useNavigate();
  const t = useT();
  const { connect, connectors } = useConnect();

  const handleConnect = async (id: ConnectorType) => {
    const res = await connect(id);

    if (res.status === 'connected') {
      setTimeout(() => navigate(StepLinks[Step.Deposit]), 1000);
    }
  };

  const quickStartConnector = connectors.find(
    (c) => c.id === 'embedded-wallet-quickstart'
  );
  // const injectedConnector = connectors.find((c) => c.id === 'injected');

  if (!quickStartConnector) {
    throw new Error('must provide quickstart or injected connector');
  }

  return (
    <div className="flex justify-center gap-4">
      <Card className="flex flex-col gap-4 p-8 items-center text-center border">
        <div className="flex flex-col gap-4 items-center justify-center">
          <LogoCircle>
            <VegaIcon name={VegaIconNames.ETHEREUM} size={25} />
          </LogoCircle>
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { option: 'Ethereum' })}
          </h3>
          <p className="text-surface-1-fg-muted">
            {t(
              'Select a wallet provider to sign in with your Ethereum wallet.'
            )}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <EmbeddQuickStartButton
            connector={quickStartConnector as QuickStartConnector}
            onSuccess={() => handleConnect(quickStartConnector.id)}
          />
        </div>
      </Card>
      {/* <Card className="grid grid-rows-[subgrid] gap-4 row-span-2 flex-1 p-8 items-center text-center border">
        <div className="flex flex-col gap-4 items-center justify-center">
          <LogoCircle>
            <Logo />
          </LogoCircle>
          <h3 className="text-2xl">
            {t('ONBOARDING_STEP_CONNECT', { option: injectedConnector.name })}
          </h3>
          <p className="text-surface-1-fg-muted">
            {t('Sign in using the {{appName}} Wallet browser extension', {
              appName: APP_NAME,
            })}
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
          <ErrorMessage id="injected" />
        </div>
      </Card> */}
    </div>
  );
};

const SecondaryConnectionOptions = () => {
  const { connectors, connect } = useConnect();
  const connector = connectors.find((c) => c.id === 'jsonRpc');

  if (!connector) {
    throw new Error('no jsonRpc connector');
  }

  return (
    <div className="flex justify-center gap-4">
      <p>
        <Button onClick={() => connect(connector.id)}>{connector.name}</Button>
        <ErrorMessage id={connector.id} />
      </p>
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
      <ErrorMessage id="embedded-wallet-quickstart" error={error} />
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

const ErrorMessage = (
  props: PropsWithChildren<{ id: ConnectorType; error?: Error | null }>
) => {
  const { connector } = useConnector();
  const error = useWallet((store) => store.error);
  const derivedError = props.error || error;

  if (connector?.id !== props.id) {
    return null;
  }

  if (!derivedError) {
    return null;
  }

  return (
    <p className="text-intent-danger text-sm first-letter:uppercase">
      {derivedError.message}
    </p>
  );
};
