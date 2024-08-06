// import { captureException } from '@sentry/browser'
import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { LoadingButton } from '@/components/loading-button';
import { StarsWrapper } from '@/components/stars-wrapper';
import { VegaHeader } from '@/components/vega-header';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { Validation } from '@/lib/form-validation';
import { REJECTION_ERROR_MESSAGE } from '@/lib/utils';
import { useGlobalsStore } from '@/stores/globals';

import { FULL_ROUTES } from '../route-names';

export const locators = {
  loginPassphrase: 'login-passphrase',
  loginButton: 'login-button',
};

interface FormFields {
  passphrase: string;
}

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { request } = useJsonRpcClient();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormFields>();
  const { loadGlobals } = useGlobalsStore((state) => ({
    loadGlobals: state.loadGlobals,
  }));
  const navigate = useNavigate();
  const passphrase = useWatch({ control, name: 'passphrase' });
  const submit = async (fields: { passphrase: string }) => {
    try {
      setLoading(true);
      await request(RpcMethods.Unlock, { passphrase: fields.passphrase }, true);
      await loadGlobals(request);
      navigate(FULL_ROUTES.home);
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
    <StarsWrapper>
      <VegaHeader />
      <form className="text-left" onSubmit={handleSubmit(submit)}>
        <FormGroup label="Password" labelFor="passphrase">
          <Input
            autoFocus
            hasError={!!errors.passphrase?.message}
            data-testid={locators.loginPassphrase}
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
          loadingText="Logging in"
          text="Login"
          data-testid={locators.loginButton}
          fill={true}
          className="mt-2"
          variant="primary"
          type="submit"
          disabled={!passphrase}
        />
      </form>
    </StarsWrapper>
  );
};
