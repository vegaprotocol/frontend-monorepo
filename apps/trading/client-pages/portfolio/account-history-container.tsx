import {
  addDecimal,
  fromNanoSeconds,
  t,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import compact from 'lodash/compact';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import type { AccountHistoryQuery } from './__generated__/AccountHistory';
import { useAccountsWithBalanceQuery } from './__generated__/AccountHistory';
import { useAccountHistoryQuery } from './__generated__/AccountHistory';
import * as Schema from '@vegaprotocol/types';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Toggle,
} from '@vegaprotocol/ui-toolkit';
import { AccountTypeMapping } from '@vegaprotocol/types';
import { PriceChart } from 'pennant';
import 'pennant/dist/style.css';

const calculateStartDate = (range: string): string | undefined => {
  const now = new Date();
  switch (range) {
    case '1D':
      return new Date(now.setDate(now.getDate() - 1)).toISOString();
    case '7D':
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case '1M':
      return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    case '3M':
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
    case '1Y':
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    case 'YTD':
      return new Date(now.setMonth(0)).toISOString();
    default:
      return undefined;
  }
};

const dateRangeToggleItems = [
  {
    label: t('1D'),
    value: '1D',
  },
  {
    label: t('7D'),
    value: '7D',
  },
  {
    label: t('1M'),
    value: '1M',
  },
  {
    label: t('3M'),
    value: '3M',
  },
  {
    label: t('1Y'),
    value: '1Y',
  },
  {
    label: t('YTD'),
    value: 'YTD',
  },
  {
    label: t('All'),
    value: 'All',
  },
];

export const AccountHistoryContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: assets } = useAssetsDataProvider();

  if (!pubKey) {
    return <div>Connect wallet</div>;
  }

  if (!assets) {
    return <div>Loading...</div>;
  }

  return <AccountHistoryManager pubKey={pubKey} assetData={assets} />;
};

const AccountHistoryManager = ({
  pubKey,
  assetData,
}: {
  pubKey: string;
  assetData: AssetFieldsFragment[];
}) => {
  const [range, setRange] = useState<string>('All');
  const [asset, setAsset] = useState<AssetFieldsFragment>();
  const [accountType, setAccountType] = useState<Schema.AccountType>(
    Schema.AccountType.ACCOUNT_TYPE_GENERAL
  );

  const variablesForOneTimeQuery = useMemo(
    () => ({
      partyId: pubKey,
      dateRange:
        range === 'All' ? undefined : { start: calculateStartDate(range) },
    }),
    [pubKey, range]
  );

  const assetsWithBalanceHistory = useAccountsWithBalanceQuery({
    variables: variablesForOneTimeQuery,
    skip: !pubKey,
  });

  const assetsWithBalance = useMemo(
    () =>
      assetsWithBalanceHistory.data?.balanceChanges.edges.map(
        (e) => e?.node.assetId
      ) || [],
    [assetsWithBalanceHistory.data?.balanceChanges.edges]
  );

  const assets = useMemo(
    () => assetData.filter((a) => assetsWithBalance.includes(a.id)),
    [assetData, assetsWithBalance]
  );

  const variables = useMemo(
    () => ({
      partyId: pubKey,
      assetId: asset?.id || '',
      accountTypes: accountType ? [accountType] : undefined,
      dateRange:
        range === 'All' ? undefined : { start: calculateStartDate(range) },
    }),
    [pubKey, asset, accountType, range]
  );

  console.log({ variables });

  const { data } = useAccountHistoryQuery({
    variables,
    skip: !asset || !pubKey,
  });

  return (
    <div>
      <div className="flex w-full">
        <div className=" gap-2 m-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {accountType
                ? `${
                    AccountTypeMapping[
                      accountType as keyof typeof Schema.AccountType
                    ]
                  } Account`
                : t('Select account type')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(Schema.AccountType).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setAccountType(type as Schema.AccountType)}
                >
                  {AccountTypeMapping[type as keyof typeof Schema.AccountType]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger>
              {asset ? asset.symbol : t('Select asset')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {assets.map((a) => (
                <DropdownMenuItem key={a.id} onClick={() => setAsset(a)}>
                  {a.symbol}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="pt-1 justify-items-end">
          <Toggle
            id="account-history-date-range"
            name="account-history-date-range"
            toggles={dateRangeToggleItems}
            checkedValue={range}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRange(e.target.value)
            }
          />
        </div>
      </div>
      {asset && (
        <AccountHistoryChart
          data={data}
          accountType={accountType}
          asset={asset}
        />
      )}
    </div>
  );
};

export const AccountHistoryChart = ({
  data,
  accountType,
  asset,
}: {
  data: AccountHistoryQuery | undefined;
  accountType: Schema.AccountType;
  asset: AssetFieldsFragment;
}) => {
  const [theme] = useThemeSwitcher();
  const values = useMemo(() => {
    if (!data?.balanceChanges.edges.length) {
      return [];
    }

    return compact(data.balanceChanges.edges)
      .filter((edge) => {
        return edge.node.accountType === accountType;
      })
      .map((edge) => {
        return {
          datetime: fromNanoSeconds(edge.node.timestamp), // Date
          balance: Number(addDecimal(edge.node.balance, asset.decimals)), // number
        };
      });
  }, [accountType, asset.decimals, data?.balanceChanges.edges]);
  if (!values.length) {
    return <div>{t('No data')}</div>;
  }

  const chartData: { cols: string[]; rows: [Date, ...number[]][] } = {
    cols: ['Date', asset.symbol],
    rows: values.map((d) => [d.datetime, d.balance]),
  };

  console.log(chartData);
  return (
    <div className="w-200 h-200">
      <PriceChart data={chartData} theme={theme} />
    </div>
  );
};
