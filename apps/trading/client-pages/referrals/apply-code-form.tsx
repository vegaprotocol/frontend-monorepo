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
import { useCallback, useEffect, useRef, useState } from 'react';
import { RainbowButton } from './buttons';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useReferral } from './hooks/use-referral';
import { Routes } from '../../lib/links';
import { useTransactionEventSubscription } from '@vegaprotocol/web3';
import { Statistics, useStats } from './referral-statistics';
import { useReferralProgram } from './hooks/use-referral-program';
import { useT } from '../../lib/use-t';

const RELOAD_DELAY = 3000;

const validateCode = (value: string, t: ReturnType<typeof useT>) => {
  const number = +`0x${value}`;
  if (!value || value.length !== 64) {
    return t('Code must be 64 characters in length');
  } else if (Number.isNaN(number)) {
    return t('Code must be be valid hex');
  }
  return true;
};

export const ApplyCodeFormContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: referee } = useReferral({ pubKey, role: 'referee' });
  const { data: referrer } = useReferral({ pubKey, role: 'referrer' });

  // go to main page if the current pubkey is already a referrer or referee
  if (referee || referrer) {
    return <Navigate to={Routes.REFERRALS} />;
  }

  return <ApplyCodeForm />;
};

export const ApplyCodeForm = () => {
  const t = useT();
  const program = useReferralProgram();
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

  const codeField = watch('code');
  const { data: previewData, loading: previewLoading } = useReferral({
    code: validateCode(codeField, t) ? codeField : undefined,
  });

  /**
   * Validates the set a user tries to apply to.
   */
  const validateSet = useCallback(() => {
    if (
      codeField &&
      !previewLoading &&
      previewData &&
      !previewData.isEligible
    ) {
      return t('The code is no longer valid.');
    }
    if (codeField && !previewLoading && !previewData) {
      return t('The code is invalid');
    }
    return true;
  }, [codeField, previewData, previewLoading, t]);

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
            message: t('The transaction could not be sent'),
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
                : t('Your code has been rejected'),
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

  const { epochsValue, nextBenefitTierValue } = useStats({ program });

  // go to main page when successfully applied
  useEffect(() => {
    if (status === 'successful') {
      setTimeout(() => {
        navigate(Routes.REFERRALS);
      }, RELOAD_DELAY);
    }
  }, [navigate, status]);

  // show "code applied" message when successfully applied
  if (status === 'successful') {
    return (
      <div className="mx-auto w-1/2">
        <h3 className="calt mb-5 flex flex-row items-center justify-center gap-2 text-center text-xl uppercase">
          <span className="text-vega-green-500">
            <VegaIcon name={VegaIconNames.TICK} size={20} />
          </span>{' '}
          <span className="pt-1">{t('Code applied')}</span>
        </h3>
      </div>
    );
  }

  const getButtonProps = () => {
    if (!pubKey) {
      return {
        disabled: false,
        children: t('Connect wallet'),
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
        children: t('Apply a code'),
        type: 'submit' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
      };
    }

    if (status === 'requested') {
      return {
        disabled: true,
        children: t('Confirm in wallet...'),
        type: 'submit' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
      };
    }

    return {
      disabled: false,
      children: t('Apply a code'),
      type: 'submit' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
    };
  };

  const nextBenefitTierEpochsValue = nextBenefitTierValue
    ? nextBenefitTierValue.epochs - epochsValue
    : 0;

  return (
    <>
      <div
        data-testid="referral-apply-code-form"
        className="bg-vega-clight-800 dark:bg-vega-cdark-800 mx-auto w-2/3 max-w-md rounded-lg p-8"
      >
        <h3 className="calt mb-4 text-center text-2xl">
          {t('Apply a referral code')}
        </h3>
        <p className="mb-4 text-center text-base">
          {t(
            'Apply a referral code to access the discount benefits of the current program.'
          )}
        </p>
        <form
          className={classNames('flex w-full flex-col gap-4', {
            'animate-shake': Boolean(errors.code),
          })}
          onSubmit={handleSubmit(onSubmit)}
        >
          <label>
            <span className="sr-only">{t('Your referral code')}</span>
            <Input
              hasError={Boolean(errors.code)}
              {...register('code', {
                required: t('You have to provide a code to apply it.'),
                validate: (value) => {
                  const err = validateCode(value, t);
                  if (err !== true) return err;
                  return validateSet();
                },
              })}
              placeholder="Enter a code"
              className="bg-vega-clight-900 dark:bg-vega-cdark-700 mb-2"
            />
          </label>
          <RainbowButton variant="border" {...getButtonProps()} />
        </form>
        {errors.code && (
          <InputError className="overflow-auto break-words">
            {errors.code.message?.toString()}
          </InputError>
        )}
      </div>
      {validateCode(codeField, t) === true && previewLoading && !previewData ? (
        <div className="mt-10">
          <Loader />
        </div>
      ) : null}
      {/* TODO: Re-check plural forms once i18n is updated */}
      {previewData && previewData.isEligible ? (
        <div className="mt-10">
          <h2 className="mb-5 text-2xl">
            {t(
              'youAreJoiningTheGroup',
              'You are joining the group shown, but will not have access to benefits until you have completed at least {{count}} epochs.',
              { count: nextBenefitTierEpochsValue }
            )}
          </h2>
          <Statistics data={previewData} program={program} as="referee" />
        </div>
      ) : null}
    </>
  );
};
