import classNames from 'classnames';
import {
  ExternalLink,
  Intent,
  TradingAnchorButton,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import {
  OnboardingStep,
  useGetOnboardingStep,
  useOnboardingStore,
} from './use-get-onboarding-step';
import { Links, Routes } from '../../lib/links';
import { useGlobalStore } from '../../stores';
import { useSidebar, ViewType } from '../sidebar';
import { useT } from '../../lib/use-t';

interface Props {
  lead?: string;
}

const GetStartedButton = ({ step }: { step: OnboardingStep }) => {
  const t = useT();
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const setDialogOpen = useOnboardingStore((store) => store.setDialogOpen);
  const marketId = useGlobalStore((store) => store.marketId);
  const setWalletDialogOpen = useOnboardingStore(
    (store) => store.setWalletDialogOpen
  );
  const setViews = useSidebar((store) => store.setViews);

  const buttonProps = {
    size: 'small' as const,
    'data-testid': 'get-started-button',
    intent: Intent.Info,
  };

  if (step <= OnboardingStep.ONBOARDING_CONNECT_STEP) {
    return (
      <TradingButton {...buttonProps} onClick={() => setWalletDialogOpen(true)}>
        {t('Connect')}
      </TradingButton>
    );
  } else if (step === OnboardingStep.ONBOARDING_DEPOSIT_STEP) {
    return (
      <TradingAnchorButton
        {...buttonProps}
        href={Links.DEPOSIT()}
        onClick={() => setDialogOpen(false)}
      >
        {t('Deposit')}
      </TradingAnchorButton>
    );
  } else if (step >= OnboardingStep.ONBOARDING_ORDER_STEP) {
    const link = marketId ? Links.MARKET(marketId) : Links.HOME();
    return (
      <TradingAnchorButton
        {...buttonProps}
        href={link}
        onClick={() => {
          setViews({ type: ViewType.Order }, Routes.MARKET);
          dismiss();
        }}
      >
        {t('Ready to trade')}
      </TradingAnchorButton>
    );
  }

  return (
    <TradingButton {...buttonProps} onClick={() => setWalletDialogOpen(true)}>
      {t('Get started')}
    </TradingButton>
  );
};

export const GetStartedCheckList = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const currentStep = useGetOnboardingStep();
  return (
    <ul className="list-none">
      <Step
        step={1}
        text={t('Connect')}
        complete={Boolean(
          currentStep > OnboardingStep.ONBOARDING_CONNECT_STEP || pubKey
        )}
      />
      <Step
        step={2}
        text={t('Deposit funds')}
        complete={currentStep > OnboardingStep.ONBOARDING_DEPOSIT_STEP}
      />
      <Step
        step={3}
        text={t('Open a position')}
        complete={currentStep > OnboardingStep.ONBOARDING_ORDER_STEP}
      />
    </ul>
  );
};

export const GetStarted = ({ lead }: Props) => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const currentStep = useGetOnboardingStep();
  const dismissed = useOnboardingStore((store) => store.dismissed);

  const wrapperClasses = classNames(
    'flex flex-col py-4 px-6 gap-4 rounded',
    'bg-vega-blue-300 dark:bg-vega-blue-700',
    'border border-vega-blue-350 dark:border-vega-blue-650',
    { 'mt-8': !lead }
  );

  if (!dismissed) {
    return (
      <div className={wrapperClasses} data-testid="get-started-banner">
        {lead && <h2>{lead}</h2>}
        <h3 className="text-lg">{t('Get started')}</h3>
        <div>
          <GetStartedCheckList />
        </div>
        <div>
          <GetStartedButton step={currentStep} />
        </div>
        {VEGA_ENV === Networks.MAINNET && (
          <p className="text-sm">
            {t('Experiment for free with virtual assets on')}{' '}
            <ExternalLink href={VEGA_NETWORKS.TESTNET}>
              {t('Fairground Testnet')}
            </ExternalLink>
          </p>
        )}
        {VEGA_ENV === Networks.TESTNET && (
          <p className="text-sm">
            {t('Ready to trade with real funds?')}{' '}
            <ExternalLink href={VEGA_NETWORKS.MAINNET}>
              {t('Switch to Mainnet')}
            </ExternalLink>
          </p>
        )}
      </div>
    );
  }

  if (!pubKey) {
    return (
      <div className={wrapperClasses}>
        <p className="mb-1 text-sm">
          You need a{' '}
          <ExternalLink href="https://vega.xyz/wallet">
            Vega wallet
          </ExternalLink>{' '}
          to start trading in this market.
        </p>
        <TradingButton
          onClick={openVegaWalletDialog}
          size="small"
          data-testid="order-connect-wallet"
          intent={Intent.Info}
        >
          {t('Connect wallet')}
        </TradingButton>
      </div>
    );
  }

  return null;
};

const Step = ({
  step,
  text,
  complete,
}: {
  step: number;
  text: string;
  complete: boolean;
}) => {
  return (
    <li
      className={classNames('flex', {
        'text-vega-clight-200 dark:text-vega-cdark-200': complete,
      })}
    >
      <div className="flex justify-center w-5">
        {complete ? <Tick /> : <span>{step}.</span>}
      </div>
      <div className="ml-1">{text}</div>
    </li>
  );
};

const Tick = () => {
  return (
    <span className="relative right-[2px]">
      <VegaIcon name={VegaIconNames.TICK} size={18} />
    </span>
  );
};
