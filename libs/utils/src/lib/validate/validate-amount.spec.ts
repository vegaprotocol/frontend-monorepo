import { validateAgainstStep } from './validate-amount';

describe('validateAgainstStep', () => {
  it('fails when step is an empty string', () => {
    expect(validateAgainstStep('', '1234')).toEqual(false);
  });

  it.each([
    [0, 0],
    [1234567890, 0],
    [0.03, 0.03],
    [0.09, 0.03],
    [0.27, 0.03],
    [1, 1],
    [123, 1],
    [4, 2],
    [8, 2],
  ])(
    'checks whether given value (%s) IS a multiple of given step (%s)',
    (value, step) => {
      expect(validateAgainstStep(step, value)).toEqual(true);
    }
  );

  it.each([
    [1, 2],
    [0.1, 0.003],
    [1.11, 0.1],
    [123.1, 1],
    [222, 221],
    [NaN, 1],
  ])(
    'checks whether given value (%s) IS NOT a multiple of given step (%s)',
    (value, step) => {
      expect(validateAgainstStep(step, value)).toEqual(false);
    }
  );
});
