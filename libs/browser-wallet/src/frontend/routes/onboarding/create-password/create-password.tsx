import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Checkbox } from '@/components/checkbox';
import { LoadingButton } from '@/components/loading-button';
import { OnboardingPage } from '@/components/pages/onboarding-page';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { Validation } from '@/lib/form-validation';

import { FULL_ROUTES } from '../../route-names';
import { PasswordFeedback } from './password-feedback';

export const locators = {
  passphraseInput: 'passphrase-input',
  confirmPassphraseInput: 'confirm-passphrase-input',
  submitPassphraseButton: 'submit-passphrase-button',
};

interface FormFields {
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export const CreatePassword = () => {
  const [loading, setLoading] = useState(false);
  const { request } = useJsonRpcClient();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      password: '',
    },
  });
  const navigate = useNavigate();
  const password = useWatch({ control, name: 'password' });
  const acceptedTerms = useWatch({ control, name: 'acceptedTerms' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });
  const submit = async ({ password }: FormFields) => {
    try {
      setLoading(true);
      await request(RpcMethods.CreatePassphrase, { passphrase: password });
      navigate(FULL_ROUTES.createWallet);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingPage
      name="Create Password"
      backLocation={FULL_ROUTES.getStarted}
    >
      <>
        <p className="mb-6">
          Set a password to protect and unlock your Vega Wallet. Your password
          can't be recovered or used to recover a wallet.
        </p>
        <form onSubmit={handleSubmit(submit)}>
          <FormGroup label="Password" labelFor="password" className="mb-6">
            <Input
              autoFocus
              id="password"
              placeholder="Enter a password"
              data-testid={locators.passphraseInput}
              type="password"
              {...register('password')}
            />
            <PasswordFeedback password={password} />
          </FormGroup>
          <FormGroup
            label="Confirm password"
            labelFor="confirmPassword"
            className="mb-6"
          >
            <Input
              id="confirmPassword"
              hasError={!!errors.confirmPassword?.message}
              placeholder="Enter password again"
              data-testid={locators.confirmPassphraseInput}
              type="password"
              {...register('confirmPassword', {
                required: Validation.REQUIRED,
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword?.message && (
              <InputError forInput="confirmPassword">
                {errors.confirmPassword.message}
              </InputError>
            )}
          </FormGroup>
          <Checkbox
            name="acceptedTerms"
            label="I understand that Vega Wallet cannot recover this password if I lose it"
            control={control}
          />
          <LoadingButton
            fill={true}
            data-testid={locators.submitPassphraseButton}
            className="mt-8"
            variant="primary"
            type="submit"
            disabled={
              !!errors.confirmPassword?.message ||
              !password ||
              !confirmPassword ||
              !acceptedTerms
            }
            loading={loading}
            loadingText="Creating password"
            text="Create password"
          />
        </form>
      </>
    </OnboardingPage>
  );
};
