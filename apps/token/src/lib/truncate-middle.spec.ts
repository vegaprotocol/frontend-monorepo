import { truncateMiddle } from './truncate-middle';

describe('truncateMiddle', () => {
  it.each([
    { i: '1234567890134567890', o: '123456\u20267890' },
    { i: '12345678901', o: '123456\u20268901' },
    { i: '1234567890', o: '1234567890' },
    { i: '123456', o: '123456' },
  ])(
    'truncates the middle section of any long string (address)',
    ({ i, o }) => {
      expect(truncateMiddle(i)).toStrictEqual(o);
    }
  );
});
