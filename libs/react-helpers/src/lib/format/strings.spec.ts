import { truncateByChars, ELLIPSIS, shorten, titlefy } from './strings';

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
  ])('should truncate given string by specific chars', ({ i, s, e, o }) => {
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
  ])('should shorten given string by specific limit', ({ i, l, o }) => {
    const output = shorten(i, l);
    expect(output).toStrictEqual(o);
  });
});

describe('titlefy', () => {
  it.each([
    { words: [], o: 'Vega' },
    { words: ['one'], o: 'one - Vega' },
    { words: ['one'], o: 'one - Vega' },
    {
      words: ['one', 'two', 'three'],
      o: 'one - two - three - Vega',
    },
    {
      words: ['one', null, undefined, 'two'],
      o: 'one - two - Vega',
    },
    {
      words: ['VEGAUSD', '123.22'],
      o: 'VEGAUSD - 123.22 - Vega',
    },
  ])('should convert to title-like string', ({ words, o }) => {
    expect(titlefy(words)).toEqual(o);
  });
});
