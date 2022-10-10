import {
  detectTypeByFetching,
  detectTypeFromQuery,
  getSearchType,
  isBlock,
  isHexadecimal,
  isNetworkParty,
  isNonHex,
  SearchTypes,
  toHex,
  toNonHex,
} from './detect-search';
import { DATA_SOURCES } from '../../config';

global.fetch = jest.fn();

describe('Detect Search', () => {
  it("should detect that it's a hexadecimal", () => {
    const expected = true;
    const testString =
      '0x073ceaab59e5f2dd0561dec4883e7ee5bc7165cd4de34717a3ab8f2cbe3007f9';
    const actual = isHexadecimal(testString);
    expect(actual).toBe(expected);
  });

  it("should detect that it's not hexadecimal", () => {
    const expected = true;
    const testString =
      '073ceaab59e5f2dd0561dec4883e7ee5bc7165cd4de34717a3ab8f2cbe3007f9';
    const actual = isNonHex(testString);
    expect(actual).toBe(expected);
  });

  it("should detect that it's a network party", () => {
    const expected = true;
    const testString = 'network';
    const actual = isNetworkParty(testString);
    expect(actual).toBe(expected);
  });

  it("should detect that it's a block", () => {
    const expected = true;
    const testString = '3188';
    const actual = isBlock(testString);
    expect(actual).toBe(expected);
  });

  it('should convert from non-hex to hex', () => {
    const expected = '0x123';
    const testString = '123';
    const actual = toHex(testString);
    expect(actual).toBe(expected);
  });

  it('should convert from hex to non-hex', () => {
    const expected = '123';
    const testString = '0x123';
    const actual = toNonHex(testString);
    expect(actual).toBe(expected);
  });

  it("should detect type client side from query if it's a hexadecimal", () => {
    const expected = [SearchTypes.Party, SearchTypes.Transaction];
    const testString =
      '0x4624293CFE3D8B67A0AB448BAFF8FBCF1A1B770D9D5F263761D3D6CBEA94D97F';
    const actual = detectTypeFromQuery(testString);
    expect(actual).toStrictEqual(expected);
  });

  it("should detect type client side from query if it's a non hex", () => {
    const expected = [SearchTypes.Party, SearchTypes.Transaction];
    const testString =
      '4624293CFE3D8B67A0AB448BAFF8FBCF1A1B770D9D5F263761D3D6CBEA94D97F';
    const actual = detectTypeFromQuery(testString);
    expect(actual).toStrictEqual(expected);
  });

  it("should detect type client side from query if it's a network party", () => {
    const expected = [SearchTypes.Party];
    const testString = 'network';
    const actual = detectTypeFromQuery(testString);
    expect(actual).toStrictEqual(expected);
  });

  it("should detect type client side from query if it's a block (number)", () => {
    const expected = [SearchTypes.Block];
    const testString = '23432';
    const actual = detectTypeFromQuery(testString);
    expect(actual).toStrictEqual(expected);
  });

  it("detectTypeByFetching should call fetch with non-hex query it's a transaction", async () => {
    const query = '0xabc';
    const type = SearchTypes.Transaction;
    // @ts-ignore issue related to polyfill
    fetch.mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              transaction: {
                hash: query,
              },
            }),
        })
      )
    );
    const result = await detectTypeByFetching(query);
    expect(fetch).toHaveBeenCalledWith(
      `${DATA_SOURCES.blockExplorerUrl}/transactions/${toNonHex(query)}`
    );
    expect(result).toBe(type);
  });

  it("detectTypeByFetching should call fetch with non-hex query it's a party", async () => {
    const query = 'abc';
    const type = SearchTypes.Party;
    // @ts-ignore issue related to polyfill
    fetch.mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok: false,
        })
      )
    );
    const result = await detectTypeByFetching(query);
    expect(result).toBe(type);
  });

  it('getSearchType should return party from fetch response', async () => {
    const query =
      '0x4624293CFE3D8B67A0AB448BAFF8FBCF1A1B770D9D5F263761D3D6CBEA94D97F';
    const expected = SearchTypes.Party;
    // @ts-ignore issue related to polyfill
    fetch.mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok: false,
        })
      )
    );
    const result = await getSearchType(query);
    expect(result).toBe(expected);
  });

  it('getSearchType should return transaction from fetch response', async () => {
    const query =
      '4624293CFE3D8B67A0AB448BAFF8FBCF1A1B770D9D5F263761D3D6CBEA94D97F';
    const expected = SearchTypes.Transaction;
    // @ts-ignore issue related to polyfill
    fetch.mockImplementation(
      jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              transaction: {
                hash: query,
              },
            }),
        })
      )
    );
    const result = await getSearchType(query);
    expect(result).toBe(expected);
  });

  it('getSearchType should return undefined from transaction response', async () => {
    const query = 'u';
    const expected = undefined;
    const result = await getSearchType(query);
    expect(result).toBe(expected);
  });

  it('getSearchType should return block if query is number', async () => {
    const query = '123';
    const expected = SearchTypes.Block;
    const result = await getSearchType(query);
    expect(result).toBe(expected);
  });

  it('getSearchType should return party if query is network', async () => {
    const query = 'network';
    const expected = SearchTypes.Party;
    const result = await getSearchType(query);
    expect(result).toBe(expected);
  });
});
