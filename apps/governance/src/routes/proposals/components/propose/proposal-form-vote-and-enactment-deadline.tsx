import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ButtonLink,
  FormGroup,
  Input,
  InputError,
} from '@vegaprotocol/ui-toolkit';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { addHours } from 'date-fns';
import {
  addTwoMinutes,
  deadlineToSeconds,
  secondsToRoundedHours,
  subtractTwoSeconds,
} from '@vegaprotocol/proposals';
import { ProposalFormSubheader } from './proposal-form-subheader';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface DeadlineProps {
  vote: number;
  enactment: number | undefined;
  validation: number;
}

interface DeadlineDatesProps {
  vote: Date;
  enactment: Date | undefined;
  validation: Date;
}

interface ValidationFormProps {
  onValidationMinMax:
    | ((field: 'proposalValidationDeadline', value: string) => void)
    | undefined;
  validationRegister:
    | UseFormRegisterReturn<'proposalValidationDeadline'>
    | undefined;
  deadlines: DeadlineProps;
  deadlineDates: DeadlineDatesProps;
  updateValidationDeadlineAndDate: (hours: number) => void;
  validationErrorMessage: string | undefined;
}

const ValidationForm = ({
  onValidationMinMax,
  validationRegister,
  deadlines,
  deadlineDates,
  updateValidationDeadlineAndDate,
  validationErrorMessage,
}: ValidationFormProps) => {
  const { t } = useTranslation();

  return (
    <FormGroup
      label={t('ProposalValidationDeadline')}
      labelFor="proposal-validation-deadline"
    >
      <div className="flex items-center gap-2">
        <div className="relative w-28">
          <Input
            {...validationRegister}
            id="proposal-validation-deadline"
            type="number"
            value={deadlines.validation}
            min={0}
            max={deadlines.vote}
            onChange={(e) => {
              updateValidationDeadlineAndDate(Number(e.target.value));
            }}
            data-testid="proposal-validation-deadline"
            className="pr-12"
          />
          <span className="absolute right-2 bottom-1/2 translate-y-1/2 text-sm">
            {t('Hours')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <ButtonLink
            data-testid="min-validation"
            onClick={() => {
              onValidationMinMax &&
                onValidationMinMax('proposalValidationDeadline', '0');
              updateValidationDeadlineAndDate(0);
            }}
          >
            {t('UseMin')}
          </ButtonLink>
          <ButtonLink
            data-testid="max-validation"
            onClick={() => {
              onValidationMinMax &&
                onValidationMinMax(
                  'proposalValidationDeadline',
                  deadlines.vote.toString()
                );
              updateValidationDeadlineAndDate(deadlines.vote);
            }}
          >
            {t('UseMax')}
          </ButtonLink>
        </div>
      </div>
      {validationErrorMessage && (
        <InputError intent="danger">{validationErrorMessage}</InputError>
      )}

      {deadlineDates.validation && (
        <p className="mt-2 text-sm text-white">
          <span className="font-light">
            {t('ThisWillSetValidationDeadlineTo')}
          </span>
          <span data-testid="validation-date" className="pl-2">
            {getDateTimeFormat().format(deadlineDates.validation)}
          </span>
          {deadlines.validation === 0 && (
            <span
              data-testid="validation-2-mins-extra"
              className="block mt-4 font-light"
            >
              {t('ThisWillAdd2MinutesToAllowTimeToConfirmInWallet')}
            </span>
          )}
        </p>
      )}
    </FormGroup>
  );
};

interface EnactmentFormProps {
  onEnactMinMax:
    | ((field: 'proposalEnactmentDeadline', value: string) => void)
    | undefined;
  enactmentRegister:
    | UseFormRegisterReturn<'proposalEnactmentDeadline'>
    | undefined;
  deadlines: DeadlineProps;
  deadlineDates: DeadlineDatesProps;
  updateEnactmentDeadlineAndDate: (hours: number) => void;
  enactmentErrorMessage: string | undefined;
  minEnactmentHours: number;
  maxEnactmentHours: number;
}

const EnactmentForm = ({
  onEnactMinMax,
  enactmentRegister,
  deadlines,
  deadlineDates,
  updateEnactmentDeadlineAndDate,
  enactmentErrorMessage,
  minEnactmentHours,
  maxEnactmentHours,
}: EnactmentFormProps) => {
  const { t } = useTranslation();

  return (
    <FormGroup
      label={t('ProposalEnactmentDeadline')}
      labelFor="proposal-enactment-deadline"
    >
      <div className="flex items-center gap-2">
        <div className="relative w-28">
          <Input
            {...enactmentRegister}
            id="proposal-enactment-deadline"
            type="number"
            value={deadlines.enactment}
            min={minEnactmentHours}
            max={maxEnactmentHours}
            onChange={(e) => {
              updateEnactmentDeadlineAndDate(Number(e.target.value));
            }}
            data-testid="proposal-enactment-deadline"
            className="pr-12"
          />
          <span className="absolute right-2 bottom-1/2 translate-y-1/2 text-sm">
            {t('Hours')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <ButtonLink
            data-testid="min-enactment"
            onClick={() => {
              onEnactMinMax &&
                onEnactMinMax(
                  'proposalEnactmentDeadline',
                  minEnactmentHours.toString()
                );
              updateEnactmentDeadlineAndDate(minEnactmentHours);
            }}
          >
            {t('UseMin')}
          </ButtonLink>
          <ButtonLink
            data-testid="max-enactment"
            onClick={() => {
              onEnactMinMax &&
                onEnactMinMax(
                  'proposalEnactmentDeadline',
                  maxEnactmentHours.toString()
                );
              updateEnactmentDeadlineAndDate(maxEnactmentHours);
            }}
          >
            {t('UseMax')}
          </ButtonLink>
        </div>
      </div>
      {enactmentErrorMessage && (
        <InputError intent="danger">{enactmentErrorMessage}</InputError>
      )}

      {deadlineDates.enactment && (
        <p className="mt-2 text-sm text-white">
          <span className="font-light">
            {t('ThisWillSetEnactmentDeadlineTo')}
          </span>
          <span data-testid="enactment-date" className="pl-2">
            {getDateTimeFormat().format(deadlineDates.enactment)}
          </span>
          {deadlines.enactment && (
            <>
              {deadlines.enactment === minEnactmentHours && (
                <span
                  data-testid="enactment-2-mins-extra"
                  className="block mt-4 font-light"
                >
                  {t('ThisWillAdd2MinutesToAllowTimeToConfirmInWallet')}
                </span>
              )}
              {deadlines.enactment < deadlines.vote && (
                <span
                  data-testid="enactment-before-voting-deadline"
                  className="block mt-4 text-vega-pink"
                >
                  {t('ProposalWillFailIfEnactmentIsEarlierThanVotingDeadline')}
                </span>
              )}
              {deadlines.enactment < minEnactmentHours && (
                <span
                  data-testid="enactment-less-than-min"
                  className="block mt-4 text-vega-pink"
                >
                  {t('ProposalWillFailIfEnactmentIsBelowTheMinimumDeadline')}
                </span>
              )}
              {deadlines.enactment > maxEnactmentHours && (
                <span
                  data-testid="enactment-greater-than-max"
                  className="block mt-4 text-vega-pink"
                >
                  {t('ProposalWillFailIfEnactmentIsAboveTheMaximumDeadline')}
                </span>
              )}
            </>
          )}
        </p>
      )}
    </FormGroup>
  );
};

export interface ProposalFormVoteAndEnactmentDeadlineProps {
  onVoteMinMax: (field: 'proposalVoteDeadline', value: string) => void;
  voteRegister: UseFormRegisterReturn<'proposalVoteDeadline'>;
  voteErrorMessage: string | undefined;
  voteMinClose: string;
  voteMaxClose: string;
  enactmentRequired?: boolean;
  onEnactMinMax?: (field: 'proposalEnactmentDeadline', value: string) => void;
  enactmentRegister?: UseFormRegisterReturn<'proposalEnactmentDeadline'>;
  enactmentErrorMessage?: string;
  enactmentMinClose?: string;
  enactmentMaxClose?: string;
  validationRequired?: boolean;
  onValidationMinMax?: (
    field: 'proposalValidationDeadline',
    value: string
  ) => void;
  validationRegister?: UseFormRegisterReturn<'proposalValidationDeadline'>;
  validationErrorMessage?: string;
}

export function ProposalFormVoteAndEnactmentDeadline({
  onVoteMinMax,
  voteRegister,
  voteErrorMessage,
  voteMinClose,
  voteMaxClose,
  onEnactMinMax,
  enactmentRegister,
  enactmentErrorMessage,
  enactmentMinClose,
  enactmentMaxClose,
  validationRequired,
  onValidationMinMax,
  validationRegister,
  validationErrorMessage,
}: ProposalFormVoteAndEnactmentDeadlineProps) {
  const {
    minVoteSeconds,
    maxVoteSeconds,
    minEnactmentSeconds,
    maxEnactmentSeconds,
  } = useMemo(
    () => ({
      minVoteSeconds: deadlineToSeconds(voteMinClose),
      maxVoteSeconds: deadlineToSeconds(voteMaxClose),
      minEnactmentSeconds:
        enactmentMinClose && deadlineToSeconds(enactmentMinClose),
      maxEnactmentSeconds:
        enactmentMaxClose && deadlineToSeconds(enactmentMaxClose),
    }),
    [voteMinClose, voteMaxClose, enactmentMinClose, enactmentMaxClose]
  );

  // As we're rounding to hours for the simplified deadline ui presently, if vote deadline
  // is less than one hour, make it one hour.
  const { minVoteHours, maxVoteHours, minEnactmentHours, maxEnactmentHours } =
    useMemo(
      () => ({
        minVoteHours: secondsToRoundedHours(minVoteSeconds),
        maxVoteHours: secondsToRoundedHours(maxVoteSeconds),
        minEnactmentHours: minEnactmentSeconds
          ? secondsToRoundedHours(minEnactmentSeconds)
          : undefined,
        maxEnactmentHours: maxEnactmentSeconds
          ? secondsToRoundedHours(maxEnactmentSeconds)
          : undefined,
      }),
      [minVoteSeconds, maxVoteSeconds, minEnactmentSeconds, maxEnactmentSeconds]
    );

  const [deadlines, setDeadlines] = useState<DeadlineProps>({
    vote: minVoteHours,
    enactment: minEnactmentHours,
    validation: 0,
  });

  const [deadlineDates, setDeadlineDates] = useState<DeadlineDatesProps>({
    vote: addHours(addTwoMinutes(), deadlines.vote),
    enactment: deadlines.enactment
      ? addHours(addTwoMinutes(), deadlines.enactment)
      : undefined,
    validation:
      deadlines.validation === 0
        ? addHours(addTwoMinutes(), deadlines.validation)
        : addHours(new Date(), deadlines.validation),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDeadlineDates((prev) => ({
        ...prev,
        vote: addHours(
          (deadlines.vote === minVoteHours && addTwoMinutes()) ||
            (deadlines.vote === maxVoteHours && subtractTwoSeconds()) ||
            new Date(),
          deadlines.vote
        ),
        enactment: deadlines.enactment
          ? addHours(
              (deadlines.enactment === minEnactmentHours && addTwoMinutes()) ||
                (deadlines.enactment === maxEnactmentHours &&
                  subtractTwoSeconds()) ||
                new Date(),
              deadlines.enactment
            )
          : undefined,
        validation:
          deadlines.validation === 0
            ? addHours(addTwoMinutes(), deadlines.validation)
            : addHours(
                (deadlines.validation === maxVoteHours &&
                  subtractTwoSeconds()) ||
                  new Date(),
                deadlines.validation
              ),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [
    deadlines,
    maxEnactmentHours,
    maxVoteHours,
    minEnactmentHours,
    minVoteHours,
  ]);

  const updateVoteDeadlineAndDate = (hours: number) => {
    // Validation, when needed, can only happen within the voting period. Therefore, if the
    // vote deadline is changed, the validation deadline must be changed to be within the
    // new vote deadline.
    setDeadlines((prev) => ({
      ...prev,
      vote: hours,
      validation: prev.validation && Math.min(prev.validation, hours),
    }));

    // If the vote deadlines are set to minimum, add 2 mins to the date as we do
    // this on submission to allow time to confirm in the wallet. Amending the
    // vote deadline also changes the enactment date and potentially the validation
    // date.
    // The validation deadline date cannot be after the vote deadline date. Therefore,
    // if the vote deadline is changed, the validation deadline must potentially
    // be changed to be within the new vote deadline.
    // Whilst it's not ideal, currently enactment deadlines are uncoupled from
    // vote deadlines in the API. Therefore, the UI currently is too, so updating
    // the vote deadline does not update the enactment deadline.
    setDeadlineDates((prev) => ({
      ...prev,
      vote: addHours(
        (hours === minVoteHours && addTwoMinutes()) ||
          (hours === maxVoteHours && subtractTwoSeconds()) ||
          new Date(),
        hours
      ),
      validation: addHours(new Date(), Math.min(hours, deadlines.validation)),
    }));
  };

  const updateEnactmentDeadlineAndDate = (hours: number) => {
    setDeadlines((prev) => ({
      ...prev,
      enactment: hours,
    }));

    setDeadlineDates((prev) => ({
      ...prev,
      enactment: addHours(
        (hours === minEnactmentHours && addTwoMinutes()) ||
          (hours === maxEnactmentHours && subtractTwoSeconds()) ||
          new Date(),
        hours
      ),
    }));
  };

  const updateValidationDeadlineAndDate = (hours: number) => {
    setDeadlines((prev) => ({
      ...prev,
      validation: hours,
    }));

    setDeadlineDates((prev) => ({
      ...prev,
      validation: addHours(
        (hours === 0 && addTwoMinutes()) ||
          (hours === maxVoteHours && subtractTwoSeconds()) ||
          new Date(),
        hours
      ),
    }));
  };

  const { t } = useTranslation();
  return (
    <div className="mb-10">
      <ProposalFormSubheader>
        {enactmentRegister && enactmentMinClose && enactmentMaxClose
          ? t('ProposalVoteAndEnactmentTitle')
          : t('ProposalVoteTitle')}
      </ProposalFormSubheader>

      <FormGroup
        label={t('ProposalVoteDeadline')}
        labelFor="proposal-vote-deadline"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-28">
            <Input
              {...voteRegister}
              id="proposal-vote-deadline"
              type="number"
              value={deadlines.vote}
              min={minVoteHours}
              max={maxVoteHours}
              onChange={(e) => {
                updateVoteDeadlineAndDate(Number(e.target.value));
              }}
              data-testid="proposal-vote-deadline"
              className="pr-12"
            />
            <span className="absolute right-2 bottom-1/2 translate-y-1/2 text-sm">
              {t('Hours')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <ButtonLink
              data-testid="min-vote"
              onClick={() => {
                onVoteMinMax('proposalVoteDeadline', minVoteHours.toString());
                updateVoteDeadlineAndDate(minVoteHours);
              }}
            >
              {t('UseMin')}
            </ButtonLink>
            <ButtonLink
              data-testid="max-vote"
              onClick={() => {
                onVoteMinMax('proposalVoteDeadline', maxVoteHours.toString());
                updateVoteDeadlineAndDate(maxVoteHours);
              }}
            >
              {t('UseMax')}
            </ButtonLink>
          </div>
        </div>
        {voteErrorMessage && (
          <InputError intent="danger">{voteErrorMessage}</InputError>
        )}

        {deadlineDates.vote && (
          <p className="mt-2 text-sm text-white">
            <span className="font-light">
              {t('ThisWillSetVotingDeadlineTo')}
            </span>
            <span data-testid="voting-date" className="pl-2">
              {getDateTimeFormat().format(deadlineDates.vote)}
            </span>
            {deadlines.vote && (
              <>
                {deadlines.vote === minVoteHours && (
                  <span
                    data-testid="voting-2-mins-extra"
                    className="block mt-4 font-light"
                  >
                    {t('ThisWillAdd2MinutesToAllowTimeToConfirmInWallet')}
                  </span>
                )}
                {deadlines.vote < minVoteHours && (
                  <span
                    data-testid="voting-less-than-min"
                    className="block mt-4 text-vega-pink"
                  >
                    {t('ProposalWillFailIfVotingIsBelowTheMinimumDeadline')}
                  </span>
                )}
                {deadlines.vote > maxVoteHours && (
                  <span
                    data-testid="voting-greater-than-max"
                    className="block mt-4 text-vega-pink"
                  >
                    {t('ProposalWillFailIfVotingIsAboveTheMaximumDeadline')}
                  </span>
                )}
              </>
            )}
          </p>
        )}
      </FormGroup>

      {validationRequired && (
        <ValidationForm
          onValidationMinMax={onValidationMinMax}
          validationRegister={validationRegister}
          deadlines={deadlines}
          deadlineDates={deadlineDates}
          updateValidationDeadlineAndDate={updateValidationDeadlineAndDate}
          validationErrorMessage={validationErrorMessage}
        />
      )}

      {minEnactmentHours && maxEnactmentHours && (
        <EnactmentForm
          onEnactMinMax={onEnactMinMax}
          enactmentRegister={enactmentRegister}
          deadlines={deadlines}
          deadlineDates={deadlineDates}
          updateEnactmentDeadlineAndDate={updateEnactmentDeadlineAndDate}
          enactmentErrorMessage={enactmentErrorMessage}
          minEnactmentHours={minEnactmentHours}
          maxEnactmentHours={maxEnactmentHours}
        />
      )}
    </div>
  );
}
