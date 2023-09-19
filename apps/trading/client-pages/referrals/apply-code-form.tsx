import { Input, InputError } from '@vegaprotocol/ui-toolkit';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from './buttons';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const ApplyCodeForm = () => {
  const { isReadOnly, pubKey, sendTx } = useVegaWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = useForm();
  const [params] = useSearchParams();

  useEffect(() => {
    const code = params.get('code');
    if (code) setValue('code', code);
  }, [params, setValue]);

  const onSubmit = ({ code }: FieldValues) => {
    if (isReadOnly || !pubKey || !code || code.length === 0) {
      return;
    }

    sendTx(pubKey, {
      applyReferralCode: {
        id: code as string,
      },
    })
      .then((res) => {
        // TODO: Do something with response
      })
      .catch((err) => {
        setError('code', {
          type: 'required',
          message: 'Your code has been rejected',
        });
      });
  };

  return (
    <div className="w-1/2 mx-auto">
      <h3 className="mb-5 text-xl text-center uppercase calt">
        Apply a referral code
      </h3>
      <p className="mb-6 text-center">Enter a referral code</p>
      <form
        className={classNames('w-full flex flex-col gap-3', {
          'animate-shake': Boolean(errors.code),
        })}
        onSubmit={handleSubmit(onSubmit)}
      >
        <label className="flex-grow">
          <span className="block mb-1 text-sm text-vega-clight-100 dark:text-vega-cdark-100">
            Your referral code
          </span>
          <Input
            hasError={Boolean(errors.code)}
            {...register('code', {
              required: 'You have to provide a code to apply it.',
            })}
          />
        </label>
        <Button
          disabled={isReadOnly || !pubKey}
          className="w-full"
          type="submit"
        >
          Apply
        </Button>
      </form>
      {errors.code && (
        <InputError>{errors.code.message?.toString()}</InputError>
      )}
    </div>
  );
};
