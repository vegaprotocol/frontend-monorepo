import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parse as ISO8601Parse, toSeconds } from 'iso8601-duration';
import {
  ButtonLink,
  FormGroup,
  Input,
  InputError,
} from '@vegaprotocol/ui-toolkit';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface ProposalFormVoteDeadlineProps {
  register: UseFormRegisterReturn<'proposalVoteDeadline'>;
  errorMessage: string | undefined;
  minClose: string;
  maxClose: string;
}

export const ProposalFormVoteDeadline = function ({
  register,
  errorMessage,
  minClose,
  maxClose,
}: ProposalFormVoteDeadlineProps) {
  const minVoteSeconds = toSeconds(ISO8601Parse(`PT${minClose.toUpperCase()}`));
  const maxVoteSeconds = toSeconds(ISO8601Parse(`PT${maxClose.toUpperCase()}`));

  // As we're rounding to hours for the simplified deadline ui presently, if deadline
  // is less than one hour, make it one hour.
  const minVoteHours =
    Math.floor(minVoteSeconds / 3600) > 1
      ? Math.floor(minVoteSeconds / 3600)
      : 1;
  const maxVoteHours = Math.floor(maxVoteSeconds / 3600);

  const [inputValue, setInputValue] = useState<number>(minVoteHours);

  const { t } = useTranslation();
  return (
    <FormGroup
      label={t('ProposalVoteDeadline')}
      labelFor="proposal-vote-deadline"
    >
      <div className="flex items-center gap-2">
        <div className="relative w-28">
          <Input
            {...register}
            id="proposal-vote-deadline"
            type="number"
            value={inputValue}
            min={minVoteHours}
            max={maxVoteHours}
            onChange={(e) => setInputValue(Number(e.target.value))}
            data-testid="proposal-vote-deadline"
            className="pr-12"
          />
          <span className="absolute right-2 bottom-1/2 translate-y-1/2 text-sm">
            {t('Hours')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <ButtonLink onClick={() => setInputValue(minVoteHours)}>
            {t('UseMin')}
          </ButtonLink>
          <ButtonLink onClick={() => setInputValue(maxVoteHours)}>
            {t('UseMax')}
          </ButtonLink>
        </div>
      </div>
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};
