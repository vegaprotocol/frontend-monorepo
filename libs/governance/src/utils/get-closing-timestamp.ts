import { addHours, addMinutes, getTime } from 'date-fns';

export const getClosingTimestamp = (proposalVoteDeadline: number) =>
  Math.floor(
    getTime(
      proposalVoteDeadline === 1
        ? addHours(addMinutes(new Date(Date.now()), 2), proposalVoteDeadline)
        : addHours(new Date(Date.now()), proposalVoteDeadline)
    ) / 1000
  );
