import { getEnactmentTimestamp } from './get-enactment-timestamp';
import { addHours, addMinutes, getTime, subSeconds } from 'date-fns';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getEnactmentTimestamp', () => {
  it('should return the correct timestamp', () => {
    const isMinimumVoteDeadlineSelected = false;
    const isMaximumVoteDeadlineSelected = false;
    const enactmentDeadline = '1';
    const expected = Math.floor(
      getTime(addHours(new Date(), Number(enactmentDeadline))) / 1000
    );
    const actual = getEnactmentTimestamp(
      enactmentDeadline,
      isMinimumVoteDeadlineSelected,
      isMaximumVoteDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp when minimum vote deadline is selected', () => {
    const isMinimumVoteDeadlineSelected = true;
    const isMaximumVoteDeadlineSelected = false;
    const enactmentDeadline = '1';
    const expected = Math.floor(
      getTime(addMinutes(addHours(new Date(), Number(enactmentDeadline)), 2)) /
        1000
    );
    const actual = getEnactmentTimestamp(
      enactmentDeadline,
      isMinimumVoteDeadlineSelected,
      isMaximumVoteDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp when maximum vote deadline is selected', () => {
    const isMinimumVoteDeadlineSelected = false;
    const isMaximumVoteDeadlineSelected = true;
    const enactmentDeadline = '1';
    const expected = Math.floor(
      getTime(subSeconds(addHours(new Date(), Number(enactmentDeadline)), 2)) /
        1000
    );
    const actual = getEnactmentTimestamp(
      enactmentDeadline,
      isMinimumVoteDeadlineSelected,
      isMaximumVoteDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });
});
