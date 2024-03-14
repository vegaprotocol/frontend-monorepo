import { determineId } from './utils';

describe('determineId', () => {
  it('produces a known result for an ID', () => {
    const res = determineId(
      'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909'
    );
    expect(res).toStrictEqual(
      '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50'
    );
  });
});
