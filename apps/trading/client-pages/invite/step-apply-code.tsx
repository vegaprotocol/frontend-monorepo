import { ns, useT } from '../../lib/use-t';
import {
  Step,
  StepLinks,
  useDetermineCurrentStep,
  useDetermineStepProgression,
} from './step-utils';
import { StepHeader } from './step-header';
import {
  Button,
  Dialog,
  Input,
  InputError,
  Intent,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { Link, Navigate } from 'react-router-dom';
import { ProgressionChain } from './step-progression-chain';
import { APP_NAME } from '../../lib/constants';
import { Card } from '../../components/card';
import { Trans } from 'react-i18next';
import { useCurrentPrograms } from '../../lib/hooks/use-current-programs';
import { useOnboardStore } from '../../stores/onboard';
import { useForm } from 'react-hook-form';
import {
  useFindReferralSet,
  useReferralSet,
} from '../referrals/hooks/use-find-referral-set';
import { useCallback, useState } from 'react';
import {
  useSimpleTransaction,
  useVegaWallet,
} from '@vegaprotocol/wallet-react';
import { GradientText } from '../../components/gradient-text';
import { TransactionSteps } from '../../components/transaction-dialog/transaction-steps';
import minBy from 'lodash/minBy';
import { ExitInvite } from './exit-invite';
import BigNumber from 'bignumber.js';
import { Links } from '../../lib/links';

export const StepApplyCode = () => {
  const t = useT();
  const code = useOnboardStore((state) => state.code);
  const program = useCurrentPrograms();

  const { pubKey } = useVegaWallet();
  const { refetch } = useFindReferralSet(pubKey);

  const firstBenefitTier = minBy(
    program.referralProgram?.benefitTiers,
    (bt) => bt.epochs
  );

  const minEpochs = firstBenefitTier ? firstBenefitTier.epochs : 0;

  type formFields = { code: string };

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<formFields>({
    defaultValues: {
      code,
    },
  });

  const codeField = watch('code');

  const {
    data: previewData,
    loading: previewLoading,
    isEligible: isPreviewEligible,
  } = useReferralSet(
    codeField && codeField.length === 64 ? codeField : undefined
  );

  const validateSet = useCallback(() => {
    if (codeField && !previewLoading && previewData && !isPreviewEligible) {
      return t('The code is no longer valid.');
    }
    if (codeField && !previewLoading && !previewData) {
      return t('The code is invalid');
    }
    return true;
  }, [codeField, isPreviewEligible, previewData, previewLoading, t]);

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const { error, reset, result, send, status } = useSimpleTransaction();

  const dismiss = () => {
    refetch();
    reset();
    setTxDialogOpen(false);
  };

  const onSubmit = ({ code: codeField }: formFields) => {
    setTxDialogOpen(true);
    send({
      applyReferralCode: {
        id: codeField,
        do_not_join_team: true,
      },
    });
  };

  const progression = useDetermineStepProgression();
  const { step: currentStep, loading } = useDetermineCurrentStep(progression);

  if (loading) {
    return <Loader className="text-surface-0-fg" />;
  }
  if (!currentStep) return <ExitInvite />;
  if (currentStep !== Step.ApplyCode) {
    return <Navigate to={StepLinks[currentStep]} />;
  }

  return (
    <>
      <div className="md:w-7/12 mx-auto flex flex-col gap-10">
        <StepHeader title={t('ONBOARDING_HEADER', { appName: APP_NAME })} />
        <ProgressionChain currentStep={currentStep} progression={progression} />
        <Card className="p-8 flex flex-col gap-4 ">
          {firstBenefitTier ? (
            <dl className="flex flex-col gap-2 items-center border-b pb-4">
              <dt className="text-6xl">
                <GradientText>
                  {t('at least')}{' '}
                  {BigNumber(firstBenefitTier.discountFactor)
                    .times(100)
                    .toFixed(2)
                    .toString()}
                  %
                </GradientText>
              </dt>
              <dd className="flex flex-col gap-1 items-center">
                <span className="text-2xl">
                  {t('ONBOARDING_STEP_APPLY_CODE_DISCOUNT_DESCRIPTION')}
                </span>
                {minEpochs > 0 && (
                  <span>
                    <Trans
                      i18nKey={
                        'ONBOARDING_STEP_APPLY_CODE_DISCOUNT_REQUIREMENTS'
                      }
                      values={{ minEpochs }}
                      components={[
                        <GradientText key="min-epochs">
                          {minEpochs} epochs
                        </GradientText>,
                      ]}
                      ns={ns}
                    />
                  </span>
                )}
              </dd>
            </dl>
          ) : null}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <label className="flex flex-col gap-1">
              <span>{t('ONBOARDING_STEP_APPLY_CODE_FIELD')}</span>
              <Input
                readOnly={true}
                {...register('code', {
                  required: t('ONBOARDING_STEP_APPLY_CODE_FIELD_REQUIRED'),
                  minLength: {
                    value: 64,
                    message: t('ONBOARDING_STEP_APPLY_CODE_FIELD_MIN_LENGTH'),
                  },
                  validate: () => validateSet(),
                })}
              />
            </label>
            <Button intent={Intent.Primary} type="submit">
              {t('ONBOARDING_STEP_APPLY_CODE_SUBMIT')}
            </Button>
            {errors.code && <InputError>{errors.code.message}</InputError>}
          </form>
          <Dialog
            title={t('ONBOARDING_STEP_APPLY_CODE')}
            open={txDialogOpen}
            onChange={(open) => {
              setTxDialogOpen(open);
            }}
          >
            <TransactionSteps
              status={status}
              result={result}
              error={error}
              // TODO: If next is join team then diff label needed
              confirmedLabel={t('ONBOARDING_STEP_START_PLAYING')}
              reset={dismiss}
              resetLabel={t('Dismiss')}
            />
          </Dialog>
        </Card>
        <p className="flex gap-4 justify-center text-center">
          <Link to={Links.MARKETS()} className="underline underline-offset-4">
            {t('Take me to all markets')}
          </Link>
        </p>
      </div>
    </>
  );
};
