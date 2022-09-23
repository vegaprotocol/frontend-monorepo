import { addHours, addMinutes, getTime } from 'date-fns';
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
    const expected = Math.floor(
      getTime(
        addHours(addMinutes(new Date(), 2), Number(proposalValidationDeadline))
      ) / 1000
    );
    const actual = getValidationTimestamp(proposalValidationDeadline);
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalValidationDeadline is 1 (when no extra mins are added)', () => {
    const proposalValidationDeadline = '1';
    const expected = Math.floor(
      getTime(addHours(new Date(), Number(proposalValidationDeadline))) / 1000
    );
    const actual = getValidationTimestamp(proposalValidationDeadline);
    expect(actual).toEqual(expected);
  });
});
