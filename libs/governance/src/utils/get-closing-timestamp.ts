import { addHours, addMinutes, getTime } from 'date-fns';

// If proposaVoteDeadline is at its minimum of 1 hour, then we add
// 2 extra minutes to the closing timestamp to ensure that there's time
// to confirm in the wallet.

export const getClosingTimestamp = (proposalVoteDeadline: string) =>
  Math.floor(
    getTime(
      proposalVoteDeadline === '1'
        ? addHours(addMinutes(new Date(), 2), Number(proposalVoteDeadline))
        : addHours(new Date(), Number(proposalVoteDeadline))
    ) / 1000
  );
