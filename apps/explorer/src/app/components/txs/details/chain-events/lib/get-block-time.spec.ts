import { getBlockTime } from './get-block-time';

describe('Lib: getBlockTime', () => {
  it('- gets returned if nothing is provided', () => {
    const res = getBlockTime();
    expect(res).toEqual('-');
  });

  it('Returns a known date string', () => {
    const mockBlockTime = '1669223762';
    const usRes = getBlockTime(mockBlockTime, 'en-US');
    expect(usRes).toContain('11/23/2022');
    expect(usRes).toContain('5:16:02');
    expect(usRes).toContain('PM');
  });
});
