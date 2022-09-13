// test getValidationTimestamp

import { addHours, addMinutes, getTime } from 'date-fns';
import { getValidationTimestamp } from './get-validation-timestamp';

describe('getValidationTimestamp', () => {
  it('should return the correct timestamp if the proposalValidationDeadline is 0 (when 2 mins are added)', () => {
    const proposalValidationDeadline = 0;
    const expected = Math.floor(
      getTime(
        addHours(
          addMinutes(new Date(Date.now()), 2),
          proposalValidationDeadline
        )
      ) / 1000
    );
    const actual = getValidationTimestamp(proposalValidationDeadline);
    expect(actual).toEqual(expected);
  });

  it('should return the correct timestamp if the proposalValidationDeadline is 1 (when no extra mins are added)', () => {
    const proposalValidationDeadline = 1;
    const expected = Math.floor(
      getTime(addHours(new Date(Date.now()), proposalValidationDeadline)) / 1000
    );
    const actual = getValidationTimestamp(proposalValidationDeadline);
    expect(actual).toEqual(expected);
  });
});
