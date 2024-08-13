import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { HiddenContainer } from '@/components/hidden-container';
import { OnboardingPage } from '@/components/pages/onboarding-page';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useSuggestMnemonic } from '@/hooks/suggest-mnemonic';
import { createWallet } from '@/lib/create-wallet';

import { FULL_ROUTES } from '../../route-names';
import { SaveMnemonicForm } from './save-mnemonic-form';
import { WalletCreated } from './wallet-created';

export const locators = {
  saveMnemonicDescription: 'save-mnemonic-description',
};

export const SaveMnemonic = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { request } = useJsonRpcClient();
  const navigate = useNavigate();
  const [mnemonicShown, setMnemonicShown] = useState<boolean>(false);
  const { mnemonic } = useSuggestMnemonic();
  const submit = async () => {
    try {
      setLoading(true);
      await createWallet(mnemonic as string, request);
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };
  // While loading, render nothing
  if (!mnemonic) return null;
  if (showSuccess) {
    return (
      <WalletCreated
        onClose={() => {
          navigate(FULL_ROUTES.wallets);
          setShowSuccess(false);
        }}
      />
    );
  }
  return (
    <OnboardingPage
      name="Secure your wallet"
      backLocation={FULL_ROUTES.createWallet}
    >
      <>
        <p data-testid={locators.saveMnemonicDescription} className="pb-6">
          Write down or save this recovery phrase to a safe place. You'll need
          it to recover your wallet. Never share this with anyone else.
        </p>
        <HiddenContainer
          text="Reveal recovery phrase"
          hiddenInformation={mnemonic}
          onChange={setMnemonicShown}
        />
        <SaveMnemonicForm
          onSubmit={submit}
          loading={loading}
          disabled={!mnemonicShown}
        />
      </>
    </OnboardingPage>
  );
};
