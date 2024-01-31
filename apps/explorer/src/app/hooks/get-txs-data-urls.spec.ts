import { getTxsDataUrl } from './get-txs-data-url'; // import the function to be tested

describe('getTxsDataUrl', () => {
  it('should return the correct URL without filters and party', () => {
    const params = {
      count: 10,
      baseUrl: 'https://example.com/transactions',
    };
    const expectedUrl = 'https://example.com/transactions?first=10';

    expect(getTxsDataUrl(params)).toEqual(expectedUrl);
  });

  it('should return the correct URL with "before" in params', () => {
    const params = {
      count: 5,
      before: '100.1',
      baseUrl: 'https://example.com/transactions',
    };
    const expectedUrl = 'https://example.com/transactions?last=5&before=100.1';

    expect(getTxsDataUrl(params)).toEqual(expectedUrl);
  });

  it('should return the correct URL with "after" in params', () => {
    const params = {
      count: 5,
      after: '222.1',
      baseUrl: 'https://example.com/transactions',
    };
    const expectedUrl = 'https://example.com/transactions?first=5&after=222.1';

    expect(getTxsDataUrl(params)).toEqual(expectedUrl);
  });

  it('should return the correct URL with filters and party', () => {
    const params = {
      count: 10,
      filters: 'filters[cmd.type]=Made Up Transaction',
      party: '1234',
      baseUrl: 'https://example.com/transactions',
    };
    const expectedUrl =
      'https://example.com/transactions?first=10&filters[cmd.type]=Made%20Up%20Transaction&filters[tx.submitter]=1234';

    expect(getTxsDataUrl(params)).toEqual(expectedUrl);
  });
});
