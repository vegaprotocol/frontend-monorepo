import { addHours, addMinutes, getTime } from 'date-fns';

// If proposalValidationDeadline is at its minimum of 0 hours, then we add
// 2 extra minutes to the validation timestamp to ensure that there's time
// to confirm in the wallet.

export const getValidationTimestamp = (proposalValidationDeadline: string) =>
  Math.floor(
    getTime(
      proposalValidationDeadline === '0'
        ? addHours(
            addMinutes(new Date(), 2),
            Number(proposalValidationDeadline)
          )
        : addHours(new Date(), Number(proposalValidationDeadline))
    ) / 1000
  );
