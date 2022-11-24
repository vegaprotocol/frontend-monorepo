import { fromNanoSeconds, t } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import compact from 'lodash/compact';
import { extent } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { useMemo, useState } from 'react';
import type { AccountHistoryQuery } from './__generated___/AccountHistory';
import { useAccountHistoryQuery } from './__generated___/AccountHistory';
import { Schema } from '@vegaprotocol/types';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';

export const AccountHistoryContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: assets } = useAssetsDataProvider();

  if (!pubKey) {
    return <div>Connect wallet</div>;
  }

  if (!assets) {
    return <div>Loading..</div>;
  }

  return <AccountHistoryManager pubKey={pubKey} assets={assets} />;
};

const AccountHistoryManager = ({
  pubKey,
  assets,
}: {
  pubKey: string;
  assets: AssetFieldsFragment[];
}) => {
  const [asset, setAsset] = useState(() => {
    return assets.find(
      (a) =>
        a.id ===
        'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663'
    );
  });
  const [accountType, setAccountType] = useState<Schema.AccountType>();

  const { data } = useAccountHistoryQuery({
    variables: {
      partyId: pubKey,
      assetId: asset?.id || '',
      accountTypes: accountType ? [accountType] : undefined,
    },
    skip: !asset,
  });

  return (
    <div>
      <div className="flex gap-2">
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
        <DropdownMenu>
          <DropdownMenuTrigger>
            {accountType ? accountType : t('Select account type')}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.keys(Schema.AccountType).map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setAccountType(type as Schema.AccountType)}
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div>TODO: Date range</div>
      </div>
      <AccountHistoryChart data={data} />
    </div>
  );
};

const AccountHistoryChart = ({
  data,
}: {
  data: AccountHistoryQuery | undefined;
}) => {
  const values = useMemo(() => {
    if (!data?.balanceChanges.edges.length) {
      return [];
    }

    return compact(data.balanceChanges.edges)
      .filter((edge) => {
        return (
          edge.node.accountType === Schema.AccountType.ACCOUNT_TYPE_GENERAL
        );
      })
      .map((edge) => {
        return {
          datetime: fromNanoSeconds(edge.node.timestamp), // Date
          balance: Number(edge.node.balance), // number
        };
      });
    // return [
    //   // ...res,
    //   { datetime: new Date('2022-11-20'), balance: 200 },
    //   { datetime: new Date('2022-11-21'), balance: 300 },
    //   { datetime: new Date('2022-11-22'), balance: 250 },
    //   { datetime: new Date('2022-11-23'), balance: 250 },
    //   { datetime: new Date('2022-11-24'), balance: 650 },
    //   { datetime: new Date('2022-11-25'), balance: 250 },
    // ];
  }, [data]);
  if (!values.length) {
    return <div>{t('No data')}</div>;
  }

  const pathProps = {
    className: '[vector-effect:non-scaling-stroke] stroke-vega-green',
    stroke: 'strokeCurrent',
    strokeWidth: 1,
    fill: 'transparent',
  };

  const width = 500;
  const height = 300;
  const xExtents = extent(values, (d) => d.datetime) as [Date, Date];
  const yExtents = extent(values, (d) => d.balance) as [number, number];
  const xScale = scaleTime().domain(xExtents).range([0, width]);
  const yScale = scaleLinear().domain(yExtents).range([height, 0]);

  console.log(xExtents, yExtents);

  const lineSeries = line()
    // @ts-ignore dunno why d3 dont work here
    .x((d) => xScale(d.datetime))
    // @ts-ignore dunno why d3 dont work here
    .y((d) => yScale(d.balance));

  const path = lineSeries(values as any);

  return (
    <div>
      <svg
        className="bg-neutral-100"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {path && <path {...pathProps} d={path} />}
      </svg>
    </div>
  );
};
