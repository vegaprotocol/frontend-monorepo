import { addHours, getTime } from 'date-fns';
import { addTwoMinutes, subtractTwoSeconds } from './deadline-helpers';

// If proposalValidationDeadline is at its minimum of 0 hours, then we add
// 2 extra minutes to the validation timestamp to ensure that there's time
// to confirm in the wallet.

// If it's at its maximum, remove a couple of seconds to ensure rounding errors
// and communication delays don't cause the proposal deadline to be slightly
// later than the API can accept.

export const getValidationTimestamp = (
  proposalValidationDeadline: string,
  maximumDeadlineSelected: boolean
) =>
  Math.floor(
    getTime(
      addHours(
        (proposalValidationDeadline === '0' && addTwoMinutes()) ||
          (maximumDeadlineSelected && subtractTwoSeconds()) ||
          new Date(),
        Number(proposalValidationDeadline)
      )
    ) / 1000
  );
