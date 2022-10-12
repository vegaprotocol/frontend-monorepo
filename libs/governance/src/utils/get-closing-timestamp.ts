import { addHours, addMinutes, getTime } from 'date-fns';

// If proposaVoteDeadline is at its minimum, then we add
// 2 extra minutes to the closing timestamp to ensure that there's time
// to confirm in the wallet.

export const getClosingTimestamp = (
  proposalVoteDeadline: string,
  minimumDeadlineSelected: boolean
) =>
  Math.floor(
    getTime(
      minimumDeadlineSelected
        ? addHours(addMinutes(new Date(), 2), Number(proposalVoteDeadline))
        : addHours(new Date(), Number(proposalVoteDeadline))
    ) / 1000
  );
