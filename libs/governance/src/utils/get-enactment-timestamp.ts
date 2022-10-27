import { addHours, fromUnixTime, getTime } from 'date-fns';
import { getClosingTimestamp } from './get-closing-timestamp';

export const getEnactmentTimestamp = (
  proposalVoteDeadline: string,
  enactmentDeadline: string,
  minimumVoteDeadlineSelected: boolean
) =>
  Math.floor(
    getTime(
      addHours(
        new Date(
          fromUnixTime(
            getClosingTimestamp(
              proposalVoteDeadline,
              minimumVoteDeadlineSelected
            )
          )
        ),
        Number(enactmentDeadline)
      )
    ) / 1000
  );
