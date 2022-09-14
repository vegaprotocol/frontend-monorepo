import { getClosingTimestamp } from './get-closing-timestamp';
import { addHours, addMinutes, getTime } from 'date-fns';

describe('getClosingTimestamp', () => {
  it('should return the correct timestamp if the proposalVoteDeadline is 1 (when 2 mins are added)', () => {
    const proposalVoteDeadline = "1";
    const expected = Math.floor(
      getTime(addHours(addMinutes(new Date(), 2), Number(proposalVoteDeadline))) / 1000
    );
    const actual = getClosingTimestamp(proposalVoteDeadline);
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalVoteDeadline is 2 (when no extra mins are added)', () => {
    const proposalVoteDeadline = "2";
    const expected = Math.floor(
      getTime(addHours(new Date(), Number(proposalVoteDeadline))) / 1000
    );
    const actual = getClosingTimestamp(proposalVoteDeadline);
    expect(actual).toEqual(expected);
  });
});
