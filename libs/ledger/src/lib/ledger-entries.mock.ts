import type {
  LedgerEntriesQuery,
  LedgerEntryFragment,
} from './__generated__/LedgerEntries';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';

export const ledgerEntriesQuery = (
  override?: PartialDeep<LedgerEntriesQuery>
): LedgerEntriesQuery => {
  const defaultResult: LedgerEntriesQuery = {
    __typename: 'Query',
    ledgerEntries: {
      __typename: 'AggregatedLedgerEntriesConnection',
      edges: ledgerEntries.map((node) => ({
        __typename: 'AggregatedLedgerEntriesEdge',
        node,
        cursor: 'cursor-1',
      })),
      pageInfo: {
        startCursor:
          'eyJ2ZWdhX3RpbWUiOiIyMDIyLTExLTIzVDE3OjI3OjU2LjczNDM2NFoifQ==',
        endCursor:
          'eyJ2ZWdhX3RpbWUiOiIyMDIyLTExLTIzVDEzOjExOjE2LjU0NjM2M1oifQ==',
        hasNextPage: false,
        hasPreviousPage: false,
        __typename: 'PageInfo',
      },
    },
  };
  return merge(defaultResult, override);
};

export const ledgerEntries: LedgerEntryFragment[] = [
  {
    vegaTime: '1669224476734364000',
    quantity: '0',
    assetId: 'asset-id',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: 'market-1',
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: 'market-0',
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669221452175594000',
    quantity: '0',
    assetId: 'asset-id-2',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: 'market-0',
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: 'market-2',
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209347054198000',
    quantity: '0',
    assetId: 'asset-id',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: 'market-3',
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: 'market-2',
    fromAccountPartyId: 'sender party id',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209345512806000',
    quantity: '0',
    assetId: 'asset-id',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209316163397000',
    quantity: '0',
    assetId: 'asset-id-2',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209299051286000',
    quantity: '1326783',
    assetId: 'asset-id-2',
    transferType: Schema.TransferType.TRANSFER_TYPE_MTM_WIN,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209151328614000',
    quantity: '0',
    assetId: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209117655380000',
    quantity: '0',
    assetId: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209082788024000',
    quantity: '1326783',
    assetId: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    transferType: Schema.TransferType.TRANSFER_TYPE_MTM_WIN,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '1669209076546363000',
    quantity: '0',
    assetId: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_HIGH,
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '2022-11-24T13:36:42.13989Z',
    quantity: '9078407730948615',
    assetId: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_LOW,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    toAccountMarketId: null,
    toAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    fromAccountMarketId:
      '0942d767cb2cb5a795e14216e8e53c2b6f75e46dc1732c5aeda8a5aba4ad193d',
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },

  {
    vegaTime: '2022-11-24T13:35:49.257039Z',
    quantity: '263142253070974',
    assetId: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
    transferType: Schema.TransferType.TRANSFER_TYPE_MARGIN_LOW,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    toAccountMarketId: null,
    toAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    fromAccountMarketId:
      '0942d767cb2cb5a795e14216e8e53c2b6f75e46dc1732c5aeda8a5aba4ad193d',
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '2022-11-24T12:41:22.054428Z',
    quantity: '1000000000',
    assetId: '4e4e80abff30cab933b8c4ac6befc618372eb76b2cbddc337eff0b4a3a4d25b8',
    transferType: Schema.TransferType.TRANSFER_TYPE_DEPOSIT,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: null,
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: null,
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '2022-11-24T12:39:11.516154Z',
    quantity: '1000000000000',
    assetId: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
    transferType: Schema.TransferType.TRANSFER_TYPE_DEPOSIT,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: null,
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: null,
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '2022-11-24T12:37:26.832226Z',
    quantity: '10000000000000000000000',
    assetId: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
    transferType: Schema.TransferType.TRANSFER_TYPE_DEPOSIT,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: null,
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: null,
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
  {
    vegaTime: '2022-11-24T12:24:52.844901Z',
    quantity: '49390000000000000000000',
    assetId: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
    transferType: Schema.TransferType.TRANSFER_TYPE_DEPOSIT,
    toAccountType: Schema.AccountType.ACCOUNT_TYPE_EXTERNAL,
    toAccountMarketId: null,
    toAccountPartyId: 'network',
    fromAccountType: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    fromAccountMarketId: null,
    fromAccountPartyId:
      '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
    __typename: 'AggregatedLedgerEntry',
    toAccountBalance: '0',
    fromAccountBalance: '0',
  },
];
