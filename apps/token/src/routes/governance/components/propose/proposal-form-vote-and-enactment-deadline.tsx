import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { parse as ISO8601Parse, toSeconds } from 'iso8601-duration';
import {
  ButtonLink,
  FormGroup,
  Input,
  InputError,
} from '@vegaprotocol/ui-toolkit';
import { addHours } from 'date-fns';
import { ProposalFormSubheader } from './proposal-form-subheader';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface ProposalFormVoteAndEnactmentDeadlineProps {
  voteRegister: UseFormRegisterReturn<'proposalVoteDeadline'>;
  voteErrorMessage: string | undefined;
  voteMinClose: string;
  voteMaxClose: string;
  enactmentRegister?: UseFormRegisterReturn<'proposalEnactmentDeadline'>;
  enactmentErrorMessage?: string;
  enactmentMinClose?: string;
  enactmentMaxClose?: string;
}

export const ProposalFormVoteAndEnactmentDeadline = function ({
  voteRegister,
  voteErrorMessage,
  voteMinClose,
  voteMaxClose,
  enactmentRegister,
  enactmentErrorMessage,
  enactmentMinClose,
  enactmentMaxClose,
}: ProposalFormVoteAndEnactmentDeadlineProps) {
  const {
    minVoteSeconds,
    maxVoteSeconds,
    minEnactmentSeconds,
    maxEnactmentSeconds,
  } = useMemo(
    () => ({
      minVoteSeconds: toSeconds(
        ISO8601Parse(`PT${voteMinClose.toUpperCase()}`)
      ),
      maxVoteSeconds: toSeconds(
        ISO8601Parse(`PT${voteMaxClose.toUpperCase()}`)
      ),
      minEnactmentSeconds:
        enactmentMinClose &&
        toSeconds(ISO8601Parse(`PT${enactmentMinClose.toUpperCase()}`)),
      maxEnactmentSeconds:
        enactmentMaxClose &&
        toSeconds(ISO8601Parse(`PT${enactmentMaxClose.toUpperCase()}`)),
    }),
    [voteMinClose, voteMaxClose, enactmentMinClose, enactmentMaxClose]
  );

  // As we're rounding to hours for the simplified deadline ui presently, if vote deadline
  // is less than one hour, make it one hour.
  const { minVoteHours, maxVoteHours, minEnactmentHours, maxEnactmentHours } =
    useMemo(
      () => ({
        minVoteHours:
          Math.floor(minVoteSeconds / 3600) > 1
            ? Math.floor(minVoteSeconds / 3600)
            : 1,
        maxVoteHours: Math.floor(maxVoteSeconds / 3600),
        minEnactmentHours:
          minEnactmentSeconds && Math.floor(minEnactmentSeconds / 3600) > 1
            ? Math.floor(minEnactmentSeconds / 3600)
            : 1,
        maxEnactmentHours:
          maxEnactmentSeconds && Math.floor(maxEnactmentSeconds / 3600),
      }),
      [minVoteSeconds, maxVoteSeconds, minEnactmentSeconds, maxEnactmentSeconds]
    );

  const [voteDeadline, setVoteDeadline] = useState<number>(minVoteHours);
  const [enactmentDeadline, setEnactmentDeadline] =
    useState<number>(minEnactmentHours);
  const [voteDeadlineDate, setVoteDeadlineDate] = useState<Date>(
    addHours(new Date(), voteDeadline)
  );
  const [enactmentDeadlineDate, setEnactmentDeadlineDate] = useState<Date>(
    addHours(new Date(), voteDeadline + enactmentDeadline)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setVoteDeadlineDate(addHours(new Date(), voteDeadline));
      setEnactmentDeadlineDate(
        addHours(new Date(), voteDeadline + enactmentDeadline)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [voteDeadline, enactmentDeadline]);

  const updateVoteDeadlineAndDate = (hours: number) => {
    setVoteDeadline(hours);
    setVoteDeadlineDate(addHours(new Date(), hours));
    // Amending the vote deadline also changes the enactment deadline date
    if (enactmentDeadlineDate) {
      setEnactmentDeadlineDate(addHours(new Date(), hours + enactmentDeadline));
    }
  };

  const updateEnactmentDeadlineAndDate = (hours: number) => {
    setEnactmentDeadline(hours);
    setEnactmentDeadlineDate(addHours(voteDeadlineDate, hours));
  };

  const { t } = useTranslation();
  return (
    <>
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
              value={voteDeadline}
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
            <ButtonLink onClick={() => updateVoteDeadlineAndDate(minVoteHours)}>
              {t('UseMin')}
            </ButtonLink>
            <ButtonLink onClick={() => updateVoteDeadlineAndDate(maxVoteHours)}>
              {t('UseMax')}
            </ButtonLink>
          </div>
        </div>
        {voteErrorMessage && (
          <InputError intent="danger">{voteErrorMessage}</InputError>
        )}

        {voteDeadlineDate && (
          <p className="mt-2 text-sm text-white">
            <span className="font-light">
              {t('ThisWillSetVotingDeadlineTo')}
            </span>
            <span className="pl-2">{voteDeadlineDate?.toLocaleString()}</span>
          </p>
        )}
      </FormGroup>

      {enactmentRegister && minEnactmentHours && maxEnactmentHours && (
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
                value={enactmentDeadline}
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
                onClick={() =>
                  updateEnactmentDeadlineAndDate(minEnactmentHours)
                }
              >
                {t('UseMin')}
              </ButtonLink>
              <ButtonLink
                onClick={() =>
                  updateEnactmentDeadlineAndDate(maxEnactmentHours)
                }
              >
                {t('UseMax')}
              </ButtonLink>
            </div>
          </div>
          {enactmentErrorMessage && (
            <InputError intent="danger">{enactmentErrorMessage}</InputError>
          )}

          {enactmentDeadlineDate && (
            <p className="mt-2 text-sm text-white">
              <span className="font-light">
                {t('ThisWillSetEnactmentDeadlineTo')}
              </span>
              <span className="pl-2">
                {enactmentDeadlineDate?.toLocaleString()}
              </span>
            </p>
          )}
        </FormGroup>
      )}
    </>
  );
};
