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

interface ProposalFormEnactmentDeadlineProps {
  register: UseFormRegisterReturn<'proposalEnactmentDeadline'>;
  errorMessage: string | undefined;
  minEnact: string;
  maxEnact: string;
}

export const ProposalFormEnactmentDeadline = function ({
  register,
  errorMessage,
  minEnact,
  maxEnact,
}: ProposalFormEnactmentDeadlineProps) {
  const minEnactSeconds = toSeconds(
    ISO8601Parse(`PT${minEnact.toUpperCase()}`)
  );
  const maxEnactSeconds = toSeconds(
    ISO8601Parse(`PT${maxEnact.toUpperCase()}`)
  );

  // As we're rounding to hours for the simplified deadline ui presently, if deadline
  // is less than one hour, make it one hour.
  const minEnactHours =
    Math.floor(minEnactSeconds / 3600) > 1
      ? Math.floor(minEnactSeconds / 3600)
      : 1;
  const maxEnactHours = Math.floor(maxEnactSeconds / 3600);

  const [inputValue, setInputValue] = useState<number>(minEnactHours);

  const { t } = useTranslation();
  return (
    <FormGroup
      label={t('ProposalEnactmentDeadline')}
      labelFor="proposal-enactment-deadline"
    >
      <div className="flex items-center gap-2">
        <div className="relative w-28">
          <Input
            {...register}
            id="proposal-enactment-deadline"
            type="number"
            value={inputValue}
            min={minEnactHours}
            max={maxEnactHours}
            onChange={(e) => setInputValue(Number(e.target.value))}
            data-testid="proposal-enactment-deadline"
            className="pr-12"
          />
          <span className="absolute right-2 bottom-1/2 translate-y-1/2 text-sm">
            {t('Hours')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <ButtonLink onClick={() => setInputValue(minEnactHours)}>
            Use min
          </ButtonLink>
          <ButtonLink onClick={() => setInputValue(maxEnactHours)}>
            Use max
          </ButtonLink>
        </div>
      </div>
      {errorMessage && <InputError intent="danger">{errorMessage}</InputError>}
    </FormGroup>
  );
};
