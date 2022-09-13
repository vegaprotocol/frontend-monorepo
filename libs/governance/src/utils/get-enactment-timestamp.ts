import { addHours, fromUnixTime, getTime } from 'date-fns';
import { getClosingTimestamp } from './get-closing-timestamp';

export const getEnactmentTimestamp = (
  proposalVoteDeadline: number,
  enactmentDeadline: number
) =>
  Math.floor(
    getTime(
      addHours(
        new Date(fromUnixTime(getClosingTimestamp(proposalVoteDeadline))),
        enactmentDeadline
      )
    )
  ) / 1000;
