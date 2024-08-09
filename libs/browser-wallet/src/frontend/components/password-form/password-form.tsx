// import { captureException } from '@sentry/browser'
import { FormGroup, Input, InputError, Intent } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { LoadingButton } from '@/components/loading-button';
import { Validation } from '@/lib/form-validation';
import { REJECTION_ERROR_MESSAGE } from '@/lib/utils';

export interface FormFields {
  passphrase: string;
}

export const locators = {
  passphraseForm: 'password-phrase-form',
  passphraseInput: 'export-recovery-phrase-form-modal-passphrase',
  passphraseSubmit: 'export-recovery-phrase-form-modal-submit',
};

export const PasswordForm = ({
  onSubmit,
  text,
  loadingText,
}: {
  onSubmit: (passphrase: string) => void;
  text: string;
  loadingText: string;
}) => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormFields>();
  const passphrase = useWatch({ control, name: 'passphrase' });

  const exportPrivateKey = async ({ passphrase }: FormFields) => {
    try {
      setLoading(true);
      await onSubmit(passphrase);
    } catch (error) {
      if (error instanceof Error && error.message === REJECTION_ERROR_MESSAGE) {
        setError('passphrase', { message: 'Incorrect passphrase' });
      } else {
        setError('passphrase', {
          message: `Unknown error occurred: ${(error as Error).message}`,
        });
        // captureException(error)
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      data-testid={locators.passphraseForm}
      className="text-left mt-3"
      onSubmit={handleSubmit(exportPrivateKey)}
    >
      <FormGroup label="Password" labelFor="passphrase">
        <Input
          autoFocus
          hasError={!!errors.passphrase?.message}
          data-testid={locators.passphraseInput}
          type="password"
          {...register('passphrase', {
            required: Validation.REQUIRED,
          })}
        />
        {errors.passphrase?.message && (
          <InputError forInput="passphrase">
            {errors.passphrase.message}
          </InputError>
        )}
      </FormGroup>
      <LoadingButton
        loading={loading}
        fill={true}
        loadingText={loadingText}
        text={text}
        data-testid={locators.passphraseSubmit}
        className="mt-2"
        intent={Intent.Secondary}
        type="submit"
        disabled={!passphrase}
      />
    </form>
  );
};
