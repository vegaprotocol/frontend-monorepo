import { getEnactmentTimestamp } from './get-enactment-timestamp';
import { addHours, getTime } from 'date-fns';

describe('getEnactmentTimestamp', () => {
  it('should return the correct timestamp', () => {
    const proposalVoteDeadline = 1;
    const enactmentDeadline = 1;
    const expected = Math.floor(
      getTime(addHours(new Date(), proposalVoteDeadline + enactmentDeadline)) /
        1000
    );
    const actual = getEnactmentTimestamp(
      proposalVoteDeadline,
      enactmentDeadline
    );
    expect(actual).toEqual(expected);
  });
});
