import { addHours, getTime } from 'date-fns';
import { addTwoMinutes, subtractTwoSeconds } from './deadline-helpers';

// If the enactment deadline is at its minimum, then 2 extra minutes are added to the
// closing timestamp to ensure that there's time to confirm in the wallet.

// If it's at its maximum, remove a couple of seconds to ensure rounding errors
// and communication delays don't cause the deadline to be slightly
// later than the API can accept.

export const getEnactmentTimestamp = (
  enactmentDeadline: string,
  minimumDeadlineSelected: boolean,
  maximumDeadlineSelected: boolean
) =>
  Math.floor(
    getTime(
      addHours(
        (minimumDeadlineSelected && addTwoMinutes()) ||
          (maximumDeadlineSelected && subtractTwoSeconds()) ||
          new Date(),
        Number(enactmentDeadline)
      )
    ) / 1000
  );
