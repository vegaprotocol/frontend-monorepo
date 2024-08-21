import { type ReactNode } from 'react';
import { OnboardingPage } from '@/components/pages/onboarding-page';
import { FULL_ROUTES } from '@/routes/route-names';

export const CreateDerivedWalletPage = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <OnboardingPage
      name="Create derived wallet"
      backLocation={FULL_ROUTES.createWallet}
    >
      <>
        <p className="pb-6">
          You can use your Ethereum wallet to generate a wallet on Vega to use
          the network.
        </p>
        <p className="pb-6">
          The Vega wallet will have its own seed phrase, but can be regenerated
          from the initiating Ethereum wallet at any time.
        </p>
        <div>{children}</div>
      </>
    </OnboardingPage>
  );
};
