import { addDecimal, fromNanoSeconds } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useVegaWallet } from '@vegaprotocol/wallet';
import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AccountHistoryQuery } from './__generated__/AccountHistory';
import { useAccountHistoryQuery } from './__generated__/AccountHistory';
import * as Schema from '@vegaprotocol/types';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import {
  AsyncRenderer,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Splash,
  Toggle,
} from '@vegaprotocol/ui-toolkit';
import { AccountTypeMapping } from '@vegaprotocol/types';
import { PriceChart } from 'pennant';
import 'pennant/dist/style.css';
import type { Account } from '@vegaprotocol/accounts';
import { accountsDataProvider } from '@vegaprotocol/accounts';
import {
  useLocalStorageSnapshot,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { getAsset, type Market } from '@vegaprotocol/markets';

export const DateRange = {
  RANGE_1D: '1D',
  RANGE_7D: '7D',
  RANGE_1M: '1M',
  RANGE_3M: '3M',
  RANGE_1Y: '1Y',
  RANGE_YTD: 'YTD',
  RANGE_ALL: 'All',
};

const dateRangeToggleItems = Object.entries(DateRange).map(([_, value]) => ({
  label: t(value),
  value: value,
}));

export const calculateStartDate = (range: string): string | undefined => {
  const now = new Date();
  switch (range) {
    case DateRange.RANGE_1D:
      return new Date(now.setDate(now.getDate() - 1)).toISOString();
    case DateRange.RANGE_7D:
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case DateRange.RANGE_1M:
      return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    case DateRange.RANGE_3M:
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
    case DateRange.RANGE_1Y:
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    case DateRange.RANGE_YTD:
      return new Date(now.setMonth(0)).toISOString();
    default:
      return undefined;
  }
};

export const AccountHistoryContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: assets } = useAssetsDataProvider();

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <AsyncRenderer loading={!assets} error={undefined} data={assets}>
      {assets && <AccountHistoryManager pubKey={pubKey} assetData={assets} />}
    </AsyncRenderer>
  );
};

const AccountHistoryManager = ({
  pubKey,
  assetData,
}: {
  pubKey: string;
  assetData: AssetFieldsFragment[];
}) => {
  const [accountType, setAccountType] = useState<Schema.AccountType>(
    Schema.AccountType.ACCOUNT_TYPE_GENERAL
  );

  const variablesForOneTimeQuery = useMemo(
    () => ({
      partyId: pubKey,
    }),
    [pubKey]
  );

  const { data: accounts } = useDataProvider({
    dataProvider: accountsDataProvider,
    variables: variablesForOneTimeQuery,
    skip: !pubKey,
  });

  const assetIds = useMemo(
    () => accounts?.map((e) => e?.asset?.id) || [],
    [accounts]
  );

  const assets = useMemo(
    () =>
      assetData
        .filter((a) => assetIds.includes(a.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [assetData, assetIds]
  );
  const [assetId, setAssetId] = useLocalStorageSnapshot(
    'account-history-active-asset-id'
  );

  const asset = useMemo(
    () => assets.find((a) => a.id === assetId) || assets[0],
    [assetId, assets]
  );

  const [range, setRange] = useState<typeof DateRange[keyof typeof DateRange]>(
    DateRange.RANGE_1M
  );
  const [market, setMarket] = useState<Market | null>(null);

  const marketFilterCb = useCallback(
    (item: Market) => {
      const itemAsset = getAsset(item);
      return !asset?.id || itemAsset?.id === asset?.id;
    },
    [asset?.id]
  );
  const markets = useMemo<Market[] | null>(() => {
    const arr =
      accounts
        ?.filter((item: Account) => Boolean(item && item.market))
        .map<Market>((item) => item.market as Market) ?? null;
    return arr
      ? uniqBy(arr.filter(marketFilterCb), 'id').sort((a, b) =>
          a.tradableInstrument.instrument.code.localeCompare(
            b.tradableInstrument.instrument.code
          )
        )
      : null;
  }, [accounts, marketFilterCb]);
  const resolveMarket = useCallback(
    (m: Market) => {
      setMarket(m);
      const itemAsset = getAsset(m);
      const newAssetId = itemAsset?.id;
      const newAsset = assets.find((item) => item.id === newAssetId);
      if ((!asset || (assets && newAssetId !== asset.id)) && newAsset) {
        setAssetId(newAsset.id);
      }
    },
    [asset, assets, setAssetId]
  );

  const variables = useMemo(
    () => ({
      partyId: pubKey,
      assetId: asset?.id || '',
      accountTypes: accountType ? [accountType] : undefined,
      dateRange:
        range === 'All' ? undefined : { start: calculateStartDate(range) },
      marketIds: market?.id ? [market.id] : undefined,
    }),
    [pubKey, asset, accountType, range, market?.id]
  );
  const { data } = useAccountHistoryQuery({
    variables,
    skip: !asset || !pubKey,
  });

  const accountTypeMenu = useMemo(() => {
    return (
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger>
            {accountType
              ? `${
                  AccountTypeMapping[
                    accountType as keyof typeof Schema.AccountType
                  ]
                } Account`
              : t('Select account type')}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent>
          {[
            Schema.AccountType.ACCOUNT_TYPE_GENERAL,
            Schema.AccountType.ACCOUNT_TYPE_BOND,
            Schema.AccountType.ACCOUNT_TYPE_MARGIN,
          ].map((type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => setAccountType(type as Schema.AccountType)}
            >
              {AccountTypeMapping[type as keyof typeof Schema.AccountType]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [accountType]);
  const assetsMenu = useMemo(() => {
    return (
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger>
            {asset ? asset.symbol : t('Select asset')}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent>
          {assets.map((a) => (
            <DropdownMenuItem key={a.id} onClick={() => setAssetId(a.id)}>
              {a.symbol}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [asset, assets, setAssetId]);
  const marketsMenu = useMemo(() => {
    return accountType === Schema.AccountType.ACCOUNT_TYPE_MARGIN &&
      markets?.length ? (
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger>
            {market
              ? market.tradableInstrument.instrument.code
              : t('Select market')}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent>
          {market && (
            <DropdownMenuItem key="0" onClick={() => setMarket(null)}>
              {t('All markets')}
            </DropdownMenuItem>
          )}
          {markets?.map((m) => (
            <DropdownMenuItem key={m.id} onClick={() => resolveMarket(m)}>
              {m.tradableInstrument.instrument.code}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;
  }, [markets, market, accountType, resolveMarket]);

  useEffect(() => {
    const itemAsset = market && getAsset(market);
    if (
      accountType !== Schema.AccountType.ACCOUNT_TYPE_MARGIN ||
      itemAsset?.id !== asset?.id
    ) {
      setMarket(null);
    }
  }, [accountType, asset?.id, market]);

  return (
    <div className="h-full w-full flex flex-col gap-8">
      <div className="w-full flex flex-col-reverse lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4 shrink-0">
          <>
            {accountTypeMenu}
            {assetsMenu}
            {marketsMenu}
          </>
        </div>
        <div className="pt-1 justify-items-end">
          <Toggle
            id="account-history-date-range"
            name="account-history-date-range"
            toggles={dateRangeToggleItems}
            checkedValue={range}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRange(e.target.value as keyof typeof DateRange)
            }
          />
        </div>
      </div>
      <div className="h-5/6 px-4">
        {asset && (
          <AccountHistoryChart
            data={data}
            accountType={accountType}
            asset={asset}
          />
        )}
      </div>
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
  const { theme } = useThemeSwitcher();
  const values: { cols: [string, string]; rows: [Date, number][] } | null =
    useMemo(() => {
      if (!data?.balanceChanges.edges.length) {
        return null;
      }

      const valuesData = compact(data.balanceChanges.edges)
        .reduce((acc, edge) => {
          if (edge.node.accountType === accountType) {
            acc?.push({
              datetime: fromNanoSeconds(edge.node.timestamp),
              balance: Number(addDecimal(edge.node.balance, asset.decimals)),
            });
          }
          return acc;
        }, [] as { datetime: Date; balance: number }[])
        .reverse();
      return {
        cols: ['Date', `${asset.symbol} account balance`],
        rows: compact(valuesData).map((d) => [d.datetime, d.balance]),
      };
    }, [accountType, asset.decimals, asset.symbol, data?.balanceChanges.edges]);

  if (!data || !values?.rows.length) {
    return <Splash> {t('No account history data')}</Splash>;
  }

  return <PriceChart data={values} theme={theme} />;
};
