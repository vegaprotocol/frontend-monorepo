import { FormGroup, InputError, TextArea } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { LoadingButton } from '@/components/loading-button';
import { OnboardingPage } from '@/components/pages/onboarding-page';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { importWallet } from '@/lib/create-wallet';
import { Validation } from '@/lib/form-validation';

import { PERMITTED_RECOVERY_PHRASE_LENGTH } from '../../../lib/constants';
import { FULL_ROUTES } from '../../route-names';
import { WalletImported } from './wallet-imported';

export const locators = {
  importMnemonic: 'import-mnemonic',
  importMnemonicSubmit: 'import-mnemonic-submit',
  importMnemonicDescription: 'import-mnemonic-description',
};

interface FormFields {
  mnemonic: string;
}

export const ImportWallet = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { request } = useJsonRpcClient();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'onChange',
  });
  const navigate = useNavigate();
  const submit = async (fields: FormFields) => {
    try {
      setLoading(true);
      await importWallet(fields.mnemonic, request, true);
      setShowSuccess(true);
    } catch (error) {
      setError('mnemonic', { message: error?.toString() });
    } finally {
      setLoading(false);
    }
  };
  const mnemonic = useWatch({ control, name: 'mnemonic' });
  if (showSuccess)
    return (
      <WalletImported
        onClose={() => {
          navigate(FULL_ROUTES.wallets);
          setShowSuccess(false);
        }}
      />
    );
  return (
    <OnboardingPage
      name="Import wallet"
      backLocation={FULL_ROUTES.createWallet}
    >
      <div>
        <p data-testid={locators.importMnemonicDescription} className="mb-6">
          Enter or paste in your Vega wallet's recovery phrase.
        </p>
        <form onSubmit={handleSubmit(submit)}>
          <FormGroup label="" labelFor="mnemonic" className="mb-6">
            <TextArea
              autoFocus
              data-testid={locators.importMnemonic}
              hasError={!!errors.mnemonic?.message}
              placeholder="Recovery phrase"
              {...register('mnemonic', {
                required: Validation.REQUIRED,
                validate: (value: string) => {
                  if (
                    !PERMITTED_RECOVERY_PHRASE_LENGTH.includes(
                      value.toString().split(' ').length
                    )
                  )
                    return 'Recovery phrase must be 12, 15, 18, 21 or 24 words';
                  return true;
                },
              })}
            />
            {errors.mnemonic?.message && (
              <InputError forInput="mnemonic">
                {errors.mnemonic.message}
              </InputError>
            )}
          </FormGroup>
          <LoadingButton
            data-testid={locators.importMnemonicSubmit}
            fill={true}
            className="mt-2"
            variant="primary"
            type="submit"
            loading={loading}
            disabled={!mnemonic || !!errors.mnemonic?.message}
            text="Import wallet"
            loadingText="Importing"
          />
        </form>
      </div>
    </OnboardingPage>
  );
};
