import { processAccountType } from './convert-enum-to-text';

describe('ConvertEnumToText', () => {
  it('Should output the correct text for a text value', () => {
    const result = processAccountType('ACCOUNT_TYPE_SETTLEMENT');
    expect(result).toBe('ACCOUNT_TYPE_SETTLEMENT');
  });
  it('Should output the correct text for a number value', () => {
    const result = processAccountType(2);
    expect(result).toBe('ACCOUNT_TYPE_SETTLEMENT');
  });
  it('Should return undefined for an unknown number', () => {
    const result = processAccountType(-2);
    expect(result).toBeUndefined();
  });
  it('Should return undefined for an unknown string', () => {
    // @ts-expect-error
    const result = processAccountType('FOO');
    expect(result).toBeUndefined();
  });
});
