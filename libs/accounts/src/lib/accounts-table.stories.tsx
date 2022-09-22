import type { Story, Meta } from '@storybook/react';
import { AccountType } from 'libs/types/src/__generated__/types';
import { getAccountData } from './accounts-data-provider';
import { AccountTable } from './accounts-table';

export default {
  component: AccountTable,
  title: 'AccountsTable',
} as Meta;

const Template: Story = (args) => (
  <AccountTable data={args.data} onClickAsset={() => null} />
);

export const Primary = Template.bind({});
Primary.args = {
  data: getAccountData([
    {
      __typename: 'Account',
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
      __typename: 'Account',
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
      __typename: 'Account',
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
      __typename: 'Account',
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
      __typename: 'Account',
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
      __typename: 'Account',
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
      __typename: 'Account',
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
  ]),
};
