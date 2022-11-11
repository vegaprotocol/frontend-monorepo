import { getClosingTimestamp } from './get-closing-timestamp';
import { addHours, addMinutes, getTime, subSeconds } from 'date-fns';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getClosingTimestamp', () => {
  it('should return the correct timestamp if the proposalVoteDeadline is set to minimum (when 2 mins are added)', () => {
    const proposalVoteDeadline = '1';
    const isMinimumDeadlineSelected = true;
    const isMaximumDeadlineSelected = false;
    const expected = Math.floor(
      getTime(
        addHours(addMinutes(new Date(), 2), Number(proposalVoteDeadline))
      ) / 1000
    );
    const actual = getClosingTimestamp(
      proposalVoteDeadline,
      isMinimumDeadlineSelected,
      isMaximumDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalVoteDeadline is not set to minimum or maximum (no extra time added or subtracted)', () => {
    const proposalVoteDeadline = '2';
    const isMinimumDeadlineSelected = false;
    const isMaximumDeadlineSelected = false;
    const expected = Math.floor(
      getTime(addHours(new Date(), Number(proposalVoteDeadline))) / 1000
    );
    const actual = getClosingTimestamp(
      proposalVoteDeadline,
      isMinimumDeadlineSelected,
      isMaximumDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalVoteDeadline is set to maximum (when 2 secs are subtracted)', () => {
    const proposalVoteDeadline = '3';
    const isMinimumDeadlineSelected = false;
    const isMaximumDeadlineSelected = true;
    const expected = Math.floor(
      getTime(
        addHours(subSeconds(new Date(), 2), Number(proposalVoteDeadline))
      ) / 1000
    );
    const actual = getClosingTimestamp(
      proposalVoteDeadline,
      isMinimumDeadlineSelected,
      isMaximumDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });
});
