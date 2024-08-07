import { Button } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

// import config from '!/config';
// import { ExternalLink } from '@/components/external-link';
import { Frame } from '@/components/frame';
import { Tick } from '@/components/icons/tick';
import { OnboardingPage } from '@/components/pages/onboarding-page';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useGlobalsStore } from '@/stores/globals';

import { FULL_ROUTES } from '../../route-names';

export const locators = {
  description: 'description',
  scopeContainer: 'scope-container',
  scope: 'scope',
  userDataPolicy: 'user-data-policy',
  reportBugsAndCrashes: 'report-bugs-and-crashes',
  noThanks: 'no-thanks',
};

export const Telemetry = () => {
  const { saveSettings, loading } = useGlobalsStore((state) => ({
    saveSettings: state.saveSettings,
    loading: state.settingsLoading,
  }));
  const { globals } = useGlobalsStore((state) => ({
    globals: state.globals,
  }));
  const { request } = useJsonRpcClient();
  const { handleSubmit } = useForm();
  const navigate = useNavigate();
  const submit = async (value: boolean) => {
    await saveSettings(request, {
      telemetry: value,
    });
    navigate(FULL_ROUTES.wallets);
  };

  if (
    globals?.settings &&
    Object.prototype.hasOwnProperty.call(globals.settings, 'telemetry') &&
    typeof globals.settings.telemetry === 'boolean'
  ) {
    return <Navigate to={FULL_ROUTES.wallets} />;
  }

  return (
    <OnboardingPage name="Help improve Vega Wallet">
      <>
        <p className="mb-6" data-testid={locators.description}>
          Improve Vega Wallet by automatically reporting bugs and crashes.
        </p>
        <Frame>
          <ul className="list-none" data-testid={locators.scopeContainer}>
            <li className="flex">
              <div>
                <Tick size={12} className="mr-2 text-vega-green-550" />
              </div>
              <p data-testid={locators.scope} className="text-white">
                Your identity and keys will remain anonymous
              </p>
            </li>
            <li className="flex">
              <div>
                <Tick size={12} className="mr-2 text-vega-green-550" />
              </div>
              <p data-testid={locators.scope} className="text-white">
                You can change this anytime via settings
              </p>
            </li>
          </ul>
        </Frame>
        {/* <ExternalLink
          data-testid={locators.userDataPolicy}
          className="text-white"
          href={config.userDataPolicy}
        >
          Read Vega Wallet's user data policy
        </ExternalLink> */}
        <form onSubmit={handleSubmit(() => submit(true))} className="mt-8">
          <Button
            autoFocus
            data-testid={locators.reportBugsAndCrashes}
            disabled={loading}
            fill={true}
            type="submit"
            variant="primary"
          >
            Opt into error reporting
          </Button>
        </form>
        <form onSubmit={handleSubmit(() => submit(false))} className="mt-4">
          <Button
            data-testid={locators.noThanks}
            disabled={loading}
            fill={true}
            type="submit"
          >
            No thanks
          </Button>
        </form>
      </>
    </OnboardingPage>
  );
};
