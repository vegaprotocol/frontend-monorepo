import {
  Input,
  InputError,
  Loader,
  Dialog,
  Intent,
  Button,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { cn } from '@vegaprotocol/ui-toolkit';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import type { ButtonHTMLAttributes, MouseEventHandler } from 'react';
import { useCallback, useState } from 'react';
import {
  useSimpleTransaction,
  useVegaWallet,
  useDialogStore,
  TxStatus,
} from '@vegaprotocol/wallet-react';
import { Links, Routes } from '../../lib/links';
import { useReferralProgram } from './hooks/use-referral-program';
import { ns, useT } from '../../lib/use-t';
import { useFundsAvailable } from './hooks/use-funds-available';
import { QUSDTooltip } from './qusd-tooltip';
import { Trans } from 'react-i18next';
import { PreviewRefereeStatistics } from './referee-statistics';
import {
  useReferralSet,
  useIsInReferralSet,
} from './hooks/use-find-referral-set';
import minBy from 'lodash/minBy';
import { TransactionSteps } from '../../components/transaction-dialog/transaction-steps';

const RELOAD_DELAY = 3000;

const SPAM_PROTECTION_ERR = 'SPAM_PROTECTION_ERR';
const SpamProtectionErr = ({
  requiredFunds,
}: {
  requiredFunds?: string | number | bigint;
}) => {
  if (!requiredFunds) return null;
  // eslint-disable-next-line react/jsx-no-undef
  return (
    <Trans
      defaults="To protect the network from spam, you must have at least {{requiredFunds}} <0>qUSD</0> of any asset on the network to proceed."
      values={{
        requiredFunds,
      }}
      components={[<QUSDTooltip key="qusd" />]}
      ns={ns}
    />
  );
};

const validateCode = (value: string, t: ReturnType<typeof useT>) => {
  const number = +`0x${value}`;
  if (!value || value.length !== 64) {
    return t('Code must be 64 characters in length');
  } else if (Number.isNaN(number)) {
    return t('Code must be be valid hex');
  }
  return true;
};

export const ApplyCodeFormContainer = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const { pubKey } = useVegaWallet();
  const isInReferralSet = useIsInReferralSet(pubKey);

  // Navigate to the index page when already in the referral set.
  if (isInReferralSet) {
    return <Navigate to={Routes.REFERRALS} />;
  }

  return <ApplyCodeForm onSuccess={onSuccess} />;
};

type FormFields = {
  code: string;
};

export const ApplyCodeForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const t = useT();
  const program = useReferralProgram();
  const navigate = useNavigate();
  const openWalletDialog = useDialogStore((store) => store.open);

  const { isReadOnly, pubKey } = useVegaWallet();
  const { isEligible, requiredFunds } = useFundsAvailable();

  const [params] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<FormFields>({
    defaultValues: {
      code: params.get('code') || '',
    },
  });

  const codeField = watch('code');

  const {
    data: previewData,
    loading: previewLoading,
    isEligible: isPreviewEligible,
  } = useReferralSet(validateCode(codeField, t) ? codeField : undefined);

  const { send, result, error, status, reset } = useSimpleTransaction({
    onSuccess: () => {
      // go to main page when successfully applied
      setTimeout(() => {
        if (onSuccess) onSuccess();
        navigate(Routes.REFERRALS);
      }, RELOAD_DELAY);
    },
    onError: (msg) => {
      setError('code', {
        type: 'required',
        message: msg,
      });
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Validates if a connected party can apply a code (min funds span protection)
   */
  const validateFundsAvailable = useCallback(() => {
    if (requiredFunds && !isEligible) {
      const err = SPAM_PROTECTION_ERR;
      return err;
    }
    return true;
  }, [isEligible, requiredFunds]);

  /**
   * Validates the set a user tries to apply to.
   */
  const validateSet = useCallback(() => {
    if (codeField && !previewLoading && previewData && !isPreviewEligible) {
      return t('The code is no longer valid.');
    }
    if (codeField && !previewLoading && !previewData) {
      return t('The code is invalid');
    }
    return true;
  }, [codeField, isPreviewEligible, previewData, previewLoading, t]);

  const noFunds = validateFundsAvailable() !== true ? true : false;

  const onSubmit = ({ code }: FormFields) => {
    if (isReadOnly || !pubKey || !code || code.length === 0) {
      return;
    }

    setDialogOpen(true);
    send({
      applyReferralCode: {
        id: code as string,
      },
    });
  };

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

    if (noFunds) {
      return {
        disabled: false,
        children: t('Deposit funds'),
        type: 'button' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
        onClick: ((event) => {
          event.preventDefault();
          navigate(Links.DEPOSIT());
        }) as MouseEventHandler,
      };
    }

    if (status === TxStatus.Requested) {
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

  // calculate minimum amount of epochs a referee has to be in a set in order
  // to benefit from it
  const firstBenefitTier = minBy(program.benefitTiers, (bt) => bt.epochs);
  const minEpochs = firstBenefitTier ? firstBenefitTier.epochs : 0;

  return (
    <>
      <div
        data-testid="referral-apply-code-form"
        className="bg-surface-1 mx-auto md:w-2/3 max-w-md rounded-lg p-8"
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
          className={cn('flex w-full flex-col gap-4', {
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
                  const codeErr = validateCode(value, t);
                  if (codeErr !== true) return codeErr;
                  const fundsErr = validateFundsAvailable();
                  if (fundsErr !== true) return fundsErr;
                  return validateSet();
                },
              })}
              placeholder="Enter a code"
              className="mb-2"
            />
          </label>
          <Button intent={Intent.Primary} {...getButtonProps()} />
        </form>
        {noFunds ? (
          <InputError intent="warning" className="overflow-auto break-words">
            <span>
              <SpamProtectionErr requiredFunds={requiredFunds?.toString()} />
            </span>
          </InputError>
        ) : (
          errors.code && (
            <InputError intent="warning" className="overflow-auto break-words">
              {errors.code.message === SPAM_PROTECTION_ERR ? (
                <span>
                  <SpamProtectionErr
                    requiredFunds={requiredFunds?.toString()}
                  />
                </span>
              ) : (
                errors.code.message?.toString()
              )}
            </InputError>
          )
        )}
      </div>
      {validateCode(codeField, t) === true && previewLoading && !previewData ? (
        <div className="mt-10">
          <Loader />
        </div>
      ) : null}

      {previewData && isPreviewEligible ? (
        <div className="mt-10">
          <h2 className="mb-5 text-2xl">
            {t(
              'youAreJoiningTheGroup',
              'You are joining the group shown, but will not have access to benefits until you have completed at least {{count}} epochs.',
              { count: minEpochs }
            )}
          </h2>
          <PreviewRefereeStatistics setId={codeField} />
        </div>
      ) : null}

      <Dialog
        title={t('Apply a referral code')}
        open={dialogOpen}
        onChange={(open) => {
          setDialogOpen(open);
        }}
      >
        <TransactionSteps
          status={status}
          result={result}
          error={error}
          confirmedLabel={t('Code applied')}
          reset={() => {
            reset();
            setDialogOpen(false);
          }}
          resetLabel={t('Back to referrals')}
        />
      </Dialog>
    </>
  );
};
