import { addHours, fromUnixTime, getTime } from 'date-fns';
import { getClosingTimestamp } from './get-closing-timestamp';

export const getEnactmentTimestamp = (
  proposalVoteDeadline: string,
  enactmentDeadline: string
) =>
  Math.floor(
    getTime(
      addHours(
        new Date(fromUnixTime(getClosingTimestamp(proposalVoteDeadline))),
        Number(enactmentDeadline)
      )
    ) / 1000
  );
