import {
  truncateByChars,
  ELLIPSIS,
  shorten,
  titlefy,
  stripFullStops,
  ensureSuffix,
  fromCamelCase,
} from './strings';

describe('truncateByChars', () => {
  it.each([
    {
      i: '12345678901234567890',
      s: undefined,
      e: undefined,
      o: `123456${ELLIPSIS}567890`,
    },
    { i: '12345678901234567890', s: 0, e: 10, o: `${ELLIPSIS}1234567890` },
    { i: '123', s: 0, e: 4, o: '123' },
    { i: '12345678901234567890', s: 3, e: 0, o: `123${ELLIPSIS}` },
  ])('should truncate given string by specific chars: %s', ({ i, s, e, o }) => {
    expect(truncateByChars(i, s, e)).toStrictEqual(o);
  });
});

describe('shorten', () => {
  it.each([
    { i: '12345678901234567890', l: undefined, o: '12345678901234567890' },
    { i: '12345678901234567890', l: 0, o: `12345678901234567890` },
    { i: '12345678901234567890', l: 10, o: `123456789${ELLIPSIS}` },
    { i: '12345678901234567890', l: 20, o: `1234567890123456789${ELLIPSIS}` },
    { i: '12345678901234567890', l: 30, o: `12345678901234567890` },
  ])('should shorten given string by specific limit: %s', ({ i, l, o }) => {
    const output = shorten(i, l);
    expect(output).toStrictEqual(o);
  });
});

describe('titlefy', () => {
  const appName = 'app';
  it.each([
    { words: [], o: appName },
    { words: ['one'], o: `one - ${appName}` },
    { words: ['one'], o: `one - ${appName}` },
    {
      words: ['one', 'two', 'three'],
      o: `one - two - three - ${appName}`,
    },
    {
      words: ['one', null, undefined, 'two'],
      o: `one - two - ${appName}`,
    },
    {
      words: ['VEGAUSD', '123.22'],
      o: `VEGAUSD - 123.22 - ${appName}`,
    },
  ])('should convert to title-like string: %s', ({ words, o }) => {
    expect(titlefy(appName, words)).toEqual(o);
  });
});

describe('stripFullStops', () => {
  describe('stripFullStops', () => {
    it('removes full stops from a version string', () => {
      const input = 'v0.70.0-12075-8fa496c8';
      const expectedResult = 'v0700-12075-8fa496c8';
      expect(stripFullStops(input)).toBe(expectedResult);
    });

    it('does not alter a string without full stops', () => {
      const input = 'v0700-12075-8fa496c8';
      expect(stripFullStops(input)).toBe(input);
    });

    it('removes full stops from a string with consecutive full stops', () => {
      const input = 'v0..70...0-12075-8fa496c8';
      const expectedResult = 'v0700-12075-8fa496c8';
      expect(stripFullStops(input)).toBe(expectedResult);
    });

    it('removes full stops from a string with only full stops', () => {
      const input = '..........';
      const expectedResult = '';
      expect(stripFullStops(input)).toBe(expectedResult);
    });

    it('does not alter an empty string', () => {
      const input = '';
      expect(stripFullStops(input)).toBe(input);
    });
  });
});

describe('ensureSuffix', () => {
  it.each([
    ['', 'abc', 'abc'],
    ['abc', '', 'abc'],
    ['def', 'abc', 'abcdef'],
    ['ąę', 'ae', 'aeąę'],
    ['🥪', '🍞+🔪=', '🍞+🔪=🥪'],
  ])('ensures "%s" at the end of "%s": "%s"', (suffix, input, expected) => {
    expect(ensureSuffix(input, suffix)).toEqual(expected);
  });
});

describe('fromCamelCase', () => {
  it.each([
    ['camelCase', 'Camel case'],
    ['anotherCamelCaseString', 'Another camel case string'],
    ['mixedCase string abc', 'Mixed case string abc'],
    ['not camel case', 'Not camel case'],
    ['', ''],
  ])('converts camel case string "%s" to "%s"', (input, expected) => {
    expect(fromCamelCase(input)).toEqual(expected);
  });
});
