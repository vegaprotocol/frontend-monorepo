import * as Schema from '@vegaprotocol/types';
import type { AccountFields, Account } from './accounts-data-provider';
import { getAccountData, getId } from './accounts-data-provider';

const AccountType = Schema.AccountType;

describe('getAccountData', () => {
  it('should return the correct aggregated data', () => {
    const data = getAccountData(accounts);
    expect(data).toEqual(accountResult);
  });
});

describe('getId', () => {
  it('should return the correct string', () => {
    expect(
      getId({
        type: AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '1',
        asset: { id: 'assetId' },
        market: null,
      })
    ).toEqual(
      getId({
        type: AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '1',
        assetId: 'assetId',
        marketId: '',
        partyId: '',
      })
    );
    expect(
      getId({
        type: AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '1',
        asset: { id: 'assetId' },
        market: { id: 'testId' },
      })
    ).toEqual(
      getId({
        type: AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '1',
        assetId: 'assetId',
        marketId: 'testId',
        partyId: 'partyId',
      })
    );
  });
});

const accounts = [
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_MARGIN,
    balance: '2781397',
    market: {
      __typename: 'Market',
      id: 'd90fd7c746286625504d7a3f5f420a280875acd3cd611676d9e70acc675f4540',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'Tesla Quarterly (30 Jun 2022)',
        },
      },
    },
    asset: {
      __typename: 'Asset',
      id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
      symbol: 'tEURO',
      decimals: 5,
    },
  },
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_MARGIN,
    balance: '406922',
    market: {
      __typename: 'Market',
      id: '9c1ee71959e566c484fcea796513137f8a02219cca2e973b7ae72dc29d099581',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'AAVEDAI Monthly (30 Jun 2022)',
        },
      },
    },
    asset: {
      __typename: 'Asset',
      id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
      symbol: 'tDAI',
      decimals: 5,
    },
  },
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '10001000000',
    market: null,
    asset: {
      __typename: 'Asset',
      id: 'XYZalpha',
      symbol: 'XYZalpha',
      decimals: 5,
    },
  },
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '1990351587',
    market: null,
    asset: {
      __typename: 'Asset',
      id: '993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede',
      symbol: 'tUSDC',
      decimals: 5,
    },
  },
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '2996218603',
    market: null,
    asset: {
      __typename: 'Asset',
      id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
      symbol: 'tEURO',
      decimals: 5,
    },
  },
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '5000593078',
    market: null,
    asset: {
      __typename: 'Asset',
      id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
      symbol: 'tDAI',
      decimals: 5,
    },
  },
  {
    __typename: 'AccountBalance',
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '4000000000000001006031',
    market: null,
    asset: {
      __typename: 'Asset',
      id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
      symbol: 'tBTC',
      decimals: 5,
    },
  },
] as Account[];

const accountResult = [
  {
    asset: {
      __typename: 'Asset',
      id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
      symbol: 'tBTC',
      decimals: 5,
    },
    balance: '4000000000000001006031',
    type: 'ACCOUNT_TYPE_GENERAL',
    available: '4000000000000001006031',
    used: '0',
    total: '4000000000000001006031',
    breakdown: [
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_GENERAL',
        balance: '4000000000000001006031',
        market: null,
        asset: {
          __typename: 'Asset',
          id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
          symbol: 'tBTC',
          decimals: 5,
        },
        total: '4000000000000001006031',
        available: '4000000000000001006031',
        used: '4000000000000001006031',
      },
    ],
  },
  {
    asset: {
      __typename: 'Asset',
      id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
      symbol: 'tDAI',
      decimals: 5,
    },
    balance: '5000593078',
    type: 'ACCOUNT_TYPE_GENERAL',
    available: '5000593078',
    used: '406922',
    total: '5001000000',
    breakdown: [
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_GENERAL',
        balance: '5000593078',
        market: null,
        asset: {
          __typename: 'Asset',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          symbol: 'tDAI',
          decimals: 5,
        },
        total: '5001000000',
        available: '5000593078',
        used: '5000593078',
      },
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_MARGIN',
        balance: '406922',
        market: {
          __typename: 'Market',
          id: '9c1ee71959e566c484fcea796513137f8a02219cca2e973b7ae72dc29d099581',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              name: 'AAVEDAI Monthly (30 Jun 2022)',
            },
          },
        },
        asset: {
          __typename: 'Asset',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          symbol: 'tDAI',
          decimals: 5,
        },
        total: '5001000000',
        available: '5000593078',
        used: '406922',
      },
    ],
  },
  {
    asset: {
      __typename: 'Asset',
      id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
      symbol: 'tEURO',
      decimals: 5,
    },
    balance: '2996218603',
    type: 'ACCOUNT_TYPE_GENERAL',
    available: '2996218603',
    used: '2781397',
    total: '2999000000',
    breakdown: [
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_GENERAL',
        balance: '2996218603',
        market: null,
        asset: {
          __typename: 'Asset',
          id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
          symbol: 'tEURO',
          decimals: 5,
        },
        total: '2999000000',
        available: '2996218603',
        used: '2996218603',
      },
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_MARGIN',
        balance: '2781397',
        market: {
          __typename: 'Market',
          id: 'd90fd7c746286625504d7a3f5f420a280875acd3cd611676d9e70acc675f4540',
          tradableInstrument: {
            __typename: 'TradableInstrument',
            instrument: {
              __typename: 'Instrument',
              name: 'Tesla Quarterly (30 Jun 2022)',
            },
          },
        },
        asset: {
          __typename: 'Asset',
          id: '8b52d4a3a4b0ffe733cddbc2b67be273816cfeb6ca4c8b339bac03ffba08e4e4',
          symbol: 'tEURO',
          decimals: 5,
        },
        total: '2999000000',
        available: '2996218603',
        used: '2781397',
      },
    ],
  },
  {
    asset: {
      __typename: 'Asset',
      id: '993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede',
      symbol: 'tUSDC',
      decimals: 5,
    },
    balance: '1990351587',
    type: 'ACCOUNT_TYPE_GENERAL',
    available: '1990351587',
    used: '0',
    total: '1990351587',
    breakdown: [
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_GENERAL',
        balance: '1990351587',
        market: null,
        asset: {
          __typename: 'Asset',
          id: '993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede',
          symbol: 'tUSDC',
          decimals: 5,
        },
        total: '1990351587',
        available: '1990351587',
        used: '1990351587',
      },
    ],
  },
  {
    asset: {
      __typename: 'Asset',
      id: 'XYZalpha',
      symbol: 'XYZalpha',
      decimals: 5,
    },
    balance: '10001000000',
    type: 'ACCOUNT_TYPE_GENERAL',
    available: '10001000000',
    used: '0',
    total: '10001000000',
    breakdown: [
      {
        __typename: 'AccountBalance',
        type: 'ACCOUNT_TYPE_GENERAL',
        balance: '10001000000',
        market: null,
        asset: {
          __typename: 'Asset',
          id: 'XYZalpha',
          symbol: 'XYZalpha',
          decimals: 5,
        },
        total: '10001000000',
        available: '10001000000',
        used: '10001000000',
      },
    ],
  },
] as AccountFields[];
