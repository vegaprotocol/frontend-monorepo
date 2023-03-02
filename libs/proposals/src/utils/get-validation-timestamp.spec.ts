import { addHours, addMinutes, getTime, subSeconds } from 'date-fns';
import { getValidationTimestamp } from './get-validation-timestamp';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getValidationTimestamp', () => {
  it('should return the correct timestamp if the proposalValidationDeadline is 0 (when 2 mins are added)', () => {
    const proposalValidationDeadline = '0';
    const isMaximumDeadlineSelected = false;
    const expected = Math.floor(
      getTime(
        addHours(addMinutes(new Date(), 2), Number(proposalValidationDeadline))
      ) / 1000
    );
    const actual = getValidationTimestamp(
      proposalValidationDeadline,
      isMaximumDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalValidationDeadline is neither maximum nor minimum (when no extra mins are added)', () => {
    const proposalValidationDeadline = '1';
    const isMaximumDeadlineSelected = false;
    const expected = Math.floor(
      getTime(addHours(new Date(), Number(proposalValidationDeadline))) / 1000
    );
    const actual = getValidationTimestamp(
      proposalValidationDeadline,
      isMaximumDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalValidationDeadline is maximum (when 2 secs are subtracted)', () => {
    const proposalValidationDeadline = '2';
    const isMaximumDeadlineSelected = true;
    const expected = Math.floor(
      getTime(
        addHours(subSeconds(new Date(), 2), Number(proposalValidationDeadline))
      ) / 1000
    );
    const actual = getValidationTimestamp(
      proposalValidationDeadline,
      isMaximumDeadlineSelected
    );
    expect(actual).toEqual(expected);
  });
});
