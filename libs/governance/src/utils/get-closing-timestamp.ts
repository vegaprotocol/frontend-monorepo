import { addHours, getTime } from 'date-fns';

export const getClosingTimestamp = (proposalVoteDeadline: number) => {
  return getTime(addHours(new Date(Date.now()), proposalVoteDeadline));
};
