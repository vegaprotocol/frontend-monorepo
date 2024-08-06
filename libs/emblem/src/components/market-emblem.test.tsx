import { getLogoPaths } from './market-emblem';
import { LOADING } from '../config';
describe('getLogoPaths', () => {
  it('should return correct logo paths when baseLogo and quoteLogo are provided', () => {
    const baseLogo = '/logo1.svg';
    const quoteLogo = '/logo2.svg';
    const expected = {
      base: 'https://icon.vega.xyz/logo1.svg',
      quote: 'https://icon.vega.xyz/logo2.svg',
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });

  it('should return correct logo paths when baseLogo is provided and quoteLogo is undefined', () => {
    const baseLogo = '/logo1.svg';
    const quoteLogo = undefined;
    const expected = {
      base: 'https://icon.vega.xyz/logo1.svg',
      quote: LOADING,
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });

  it('should return correct logo paths when baseLogo is undefined and quoteLogo is provided', () => {
    const baseLogo = undefined;
    const quoteLogo = '/logo2.svg';
    const expected = {
      base: LOADING,
      quote: 'https://icon.vega.xyz/logo2.svg',
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });

  it('should return correct logo paths when baseLogo and quoteLogo are undefined', () => {
    const baseLogo = undefined;
    const quoteLogo = undefined;
    const expected = {
      base: LOADING,
      quote: LOADING,
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });
});
