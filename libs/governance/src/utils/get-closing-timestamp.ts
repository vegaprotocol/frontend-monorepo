import { addMinutes, addHours, getTime } from 'date-fns';

export const getClosingTimestamp = (proposalVoteDeadline: number) => {
  // Add 5 minutes extra time to enable wallet confirmation without passing
  // proposal min vote deadline
  return getTime(
    addHours(addMinutes(new Date(Date.now()), 5), proposalVoteDeadline)
  );
};
