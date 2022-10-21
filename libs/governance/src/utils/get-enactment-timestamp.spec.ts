import { getEnactmentTimestamp } from './get-enactment-timestamp';
import { addHours, getTime } from 'date-fns';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getEnactmentTimestamp', () => {
  it('should return the correct timestamp', () => {
    const proposalVoteDeadline = '2';
    const isMinimumVoteDeadlineSelected = false;
    const enactmentDeadline = '1';
    const expected = Math.floor(
      getTime(
        addHours(
          new Date(),
          Number(proposalVoteDeadline) + Number(enactmentDeadline)
        )
      ) / 1000
    );
    const actual = getEnactmentTimestamp(
      proposalVoteDeadline,
      enactmentDeadline,
      isMinimumVoteDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });
});
