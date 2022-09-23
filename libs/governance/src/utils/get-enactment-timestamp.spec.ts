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
      enactmentDeadline
    );
    expect(actual).toEqual(expected);
  });
});
