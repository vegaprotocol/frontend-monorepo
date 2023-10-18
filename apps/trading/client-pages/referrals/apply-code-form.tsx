import {
  Input,
  InputError,
  Loader,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import type { ButtonHTMLAttributes, MouseEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
import { RainbowButton } from './buttons';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useReferral } from './hooks/use-referral';
import { Routes } from '../../lib/links';
import { useTransactionEventSubscription } from '@vegaprotocol/web3';
import { clearTimeout } from 'timers';
import { t } from '@vegaprotocol/i18n';
import { Statistics } from './referral-statistics';

const RELOAD_DELAY = 3000;

const validateCode = (value: string) => {
  const number = +`0x${value}`;
  if (!value || value.length !== 64) {
    return t('Code must be 64 characters in length');
  } else if (Number.isNaN(number)) {
    return t('Code must be be valid hex');
  }
  return true;
};

export const ApplyCodeForm = () => {
  const navigate = useNavigate();
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  const [status, setStatus] = useState<
    'requested' | 'failed' | 'successful' | null
  >(null);
  const txHash = useRef<string | null>(null);
  const { isReadOnly, pubKey, sendTx } = useVegaWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm();
  const [params] = useSearchParams();

  const { data: referee } = useReferral({ pubKey, role: 'referee' });
  const { data: referrer } = useReferral({ pubKey, role: 'referrer' });

  const codeField = watch('code');
  const { data: previewData, loading: previewLoading } = useReferral({
    code: validateCode(codeField) ? codeField : undefined,
  });

  useEffect(() => {
    const code = params.get('code');
    if (code) setValue('code', code);
  }, [params, setValue]);

  const onSubmit = ({ code }: FieldValues) => {
    if (isReadOnly || !pubKey || !code || code.length === 0) {
      return;
    }

    setStatus('requested');

    sendTx(pubKey, {
      applyReferralCode: {
        id: code as string,
      },
    })
      .then((res) => {
        if (!res) {
          setError('code', {
            type: 'required',
            message: 'The transaction could not be sent',
          });
        }
        if (res) {
          txHash.current = res.transactionHash.toLowerCase();
        }
      })
      .catch((err) => {
        if (err.message.includes('user rejected')) {
          setStatus(null);
        } else {
          setStatus(null);
          setError('code', {
            type: 'required',
            message:
              err instanceof Error
                ? err.message
                : 'Your code has been rejected',
          });
        }
      });
  };

  useTransactionEventSubscription({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
    fetchPolicy: 'no-cache',
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (event.event.__typename === 'TransactionResult') {
          const hash = event.event.hash.toLowerCase();
          if (txHash.current && txHash.current === hash) {
            const err = event.event.error;
            const status = event.event.status;
            if (err) {
              setStatus(null);
              setError('code', {
                type: 'required',
                message: err,
              });
            }
            if (status && !err) {
              setStatus('successful');
            }
          }
        }
      }),
  });

  // go to main page when successfully applied
  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    if (status === 'successful') {
      to = setTimeout(() => {
        navigate(Routes.REFERRALS);
      }, RELOAD_DELAY);
    }
    return () => {
      if (to) clearTimeout(to);
    };
  }, [navigate, status]);

  // go to main page if the current pubkey is already a referrer or referee
  if (referee || referrer) {
    return <Navigate to={Routes.REFERRALS} />;
  }

  // show "code applied" message when successfully applied
  if (status === 'successful') {
    return (
      <div className="w-1/2 mx-auto">
        <h3 className="mb-5 text-xl text-center uppercase calt flex flex-row gap-2 justify-center items-center">
          <span className="text-vega-green-500">
            <VegaIcon name={VegaIconNames.TICK} size={20} />
          </span>{' '}
          <span className="pt-1">Code applied</span>
        </h3>
      </div>
    );
  }

  const getButtonProps = () => {
    if (!pubKey) {
      return {
        disabled: false,
        children: 'Connect wallet',
        type: 'button' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
        onClick: ((event) => {
          event.preventDefault();
          openWalletDialog();
        }) as MouseEventHandler,
      };
    }

    if (isReadOnly) {
      return {
        disabled: true,
        children: 'Apply a code',
        type: 'submit' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
      };
    }

    if (status === 'requested') {
      return {
        disabled: true,
        children: 'Confirm in wallet...',
        type: 'submit' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
      };
    }

    return {
      disabled: false,
      children: 'Apply a code',
      type: 'submit' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
    };
  };

  return (
    <>
      <div className="w-2/3 max-w-md mx-auto bg-vega-clight-800 dark:bg-vega-cdark-800 p-8 rounded-lg">
        <h3 className="mb-4 text-2xl text-center calt">
          Apply a referral code
        </h3>
        <p className="mb-4 text-center text-base">
          Enter a referral code to get trading discounts.
        </p>
        <form
          className={classNames('w-full flex flex-col gap-4', {
            'animate-shake': Boolean(errors.code),
          })}
          onSubmit={handleSubmit(onSubmit)}
        >
          <label>
            <span className="sr-only">Your referral code</span>
            <Input
              hasError={Boolean(errors.code)}
              {...register('code', {
                required: 'You have to provide a code to apply it.',
                validate: validateCode,
              })}
              placeholder="Enter a code"
              className="mb-2 bg-vega-clight-900 dark:bg-vega-cdark-700"
            />
          </label>
          <RainbowButton variant="border" {...getButtonProps()} />
        </form>
        {errors.code && (
          <InputError className="break-words overflow-auto">
            {errors.code.message?.toString()}
          </InputError>
        )}
      </div>
      {previewLoading && !previewData ? (
        <div className="mt-10">
          <Loader />
        </div>
      ) : null}
      {previewData ? (
        <div className="mt-10">
          <h2 className="text-2xl mb-5">You are joining</h2>
          <Statistics data={previewData} as="referee" />
        </div>
      ) : null}
    </>
  );
};
