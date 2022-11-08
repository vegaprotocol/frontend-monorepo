import { addHours, addMinutes, getTime, subSeconds } from 'date-fns';

// If proposaVoteDeadline is at its minimum, then we add
// 2 extra minutes to the closing timestamp to ensure that there's time
// to confirm in the wallet. Also, remove a couple of seconds to ensure
// communication delays don't cause the proposal deadline to be slightly later
// than the API can accept.

export const getClosingTimestamp = (
  proposalVoteDeadline: string,
  minimumDeadlineSelected: boolean
) =>
  Math.floor(
    getTime(
      minimumDeadlineSelected
        ? addHours(
            addMinutes(subSeconds(new Date(), 2), 2),
            Number(proposalVoteDeadline)
          )
        : addHours(subSeconds(new Date(), 2), Number(proposalVoteDeadline))
    ) / 1000
  );
