import {
  determineType,
  isBlock,
  isNetworkParty,
  SearchTypes,
  isHash,
} from './detect-search';

global.fetch = jest.fn();

describe('Detect Search', () => {
  it.each([
    ['0000000000000000000000000000000000000000000000000000000000000000', true],
    ['0000000000000000000000000000000000000000000000000000000000000001', true],
    [
      'LOOONG0000000000000000000000000000000000000000000000000000000000000000',
      false,
    ],
    ['xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', false],
    ['something else', false],
  ])("should detect that it's a hash", (input, expected) => {
    expect(isHash(input)).toBe(expected);
  });

  it("should detect that it's a network party", () => {
    expect(isNetworkParty('network')).toBe(true);
    expect(isNetworkParty('web')).toBe(false);
  });

  it("should detect that it's a block", () => {
    expect(isBlock('123')).toBe(true);
    expect(isBlock('x123')).toBe(false);
  });

  it.each([
    [
      '0000000000000000000000000000000000000000000000000000000000000000',
      SearchTypes.Transaction,
    ],
    [
      '0000000000000000000000000000000000000000000000000000000000000001',
      SearchTypes.Party,
    ],
    ['123', SearchTypes.Block],
    ['network', SearchTypes.Party],
    ['something else', SearchTypes.Unknown],
  ])(
    "detectTypeByFetching should call fetch with non-hex query it's a transaction",
    async (input, type) => {
      // @ts-ignore issue related to polyfill
      fetch.mockImplementation(
        jest.fn(() =>
          Promise.resolve({
            ok:
              input ===
              '0000000000000000000000000000000000000000000000000000000000000000',
            json: () =>
              Promise.resolve({
                transaction: {
                  hash: input,
                },
              }),
          })
        )
      );
      const result = await determineType(input);
      expect(result).toBe(type);
    }
  );
});
