import { chooseLogos, getLogoPaths } from './market-emblem';

describe('chooseLogos', () => {
  it('should return correct logo options when selected is BASE', () => {
    const selected = 'BASE';
    const expected = {
      showBase: true,
      showQuote: false,
      logoCount: 1,
    };

    const result = chooseLogos(selected);

    expect(result).toEqual(expected);
  });

  it('should return correct logo options when selected is QUOTE', () => {
    const selected = 'QUOTE';
    const expected = {
      showBase: false,
      showQuote: true,
      logoCount: 1,
    };

    const result = chooseLogos(selected);

    expect(result).toEqual(expected);
  });

  it('should return correct logo options when selected is BOTH', () => {
    const selected = 'BOTH';
    const expected = {
      showBase: true,
      showQuote: true,
      logoCount: 2,
    };

    const result = chooseLogos(selected);

    expect(result).toEqual(expected);
  });

  it('should return correct logo options when selected is undefined', () => {
    const selected = undefined;
    const expected = {
      showBase: true,
      showQuote: true,
      logoCount: 2,
    };

    const result = chooseLogos(selected);

    expect(result).toEqual(expected);
  });
});

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
      quote: 'https://icon.vega.xyz/missing.svg',
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });

  it('should return correct logo paths when baseLogo is undefined and quoteLogo is provided', () => {
    const baseLogo = undefined;
    const quoteLogo = '/logo2.svg';
    const expected = {
      base: 'https://icon.vega.xyz/missing.svg',
      quote: 'https://icon.vega.xyz/logo2.svg',
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });

  it('should return correct logo paths when baseLogo and quoteLogo are undefined', () => {
    const baseLogo = undefined;
    const quoteLogo = undefined;
    const expected = {
      base: 'https://icon.vega.xyz/missing.svg',
      quote: 'https://icon.vega.xyz/missing.svg',
    };

    const result = getLogoPaths(baseLogo, quoteLogo);

    expect(result).toEqual(expected);
  });
});
