import { useQuery } from '@apollo/client';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import {
  Dialog,
  Intent,
  Popover,
  RotatingArrow,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import { useMemo, useState } from 'react';
import { MARKET_LIST_QUERY } from '../markets-data-provider';
import type { Column } from './select-market-columns';
import { columns } from './select-market-columns';
import type { MarketList } from '../__generated__';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { mapDataToMarketList } from '../utils/market-list.utils';
import { SelectMarketTableHeader, SelectMarketTableRow } from './select-market-table';

export const SelectMarketLandingTable = ({
  data,
  onSelect,
}: {
  data: MarketList | undefined;
  onSelect?: (id: string) => void;
}) => {
  const marketList = data && mapDataToMarketList(data);
  return (
    <div
      className="max-h-[40rem] overflow-x-auto"
      data-testid="select-market-list"
    >
      <table className="relative h-full min-w-full whitespace-nowrap">
        <thead className="sticky top-0 z-10 dark:bg-black bg-white">
          <SelectMarketTableHeader />
        </thead>
        <tbody>
          {marketList?.map((market, i) => (
            <SelectMarketTableRow
              key={i}
              detailed={false}
              columns={columns(market, onSelect)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SelectAllMarketsTableBody = ({
  data,
  title = t('All markets'),
  headers,
}: {
  data?: MarketList;
  title?: string;
  headers?: Column[];
}) => {
  const marketList = data && mapDataToMarketList(data);
  return data ? (
    <>
      <thead className="sticky top-0 z-10 dark:bg-black bg-white">
        <tr
          className={`text-h5 font-bold text-black-95 dark:text-white-95 mb-6`}
          data-testid="dialog-title"
        >
          <th>{title}</th>
        </tr>
        <SelectMarketTableHeader detailed={true} headers={headers} />
      </thead>

      <tbody>
        {data &&
          marketList?.map((market, i) => (
            <SelectMarketTableRow
              key={i}
              detailed={true}
              columns={columns(market)}
            />
          ))}
      </tbody>
    </>
  ) : (
    <thead>
      <tr>
        <td className="text-black dark:text-white text-h5">
          {t('Loading market data...')}
        </td>
      </tr>
    </thead>
  );
};

export const SelectMarketPopover = ({ marketName }: { marketName: string }) => {
  const headerTriggerButtonClassName =
    'flex items-center gap-8 shrink-0 p-8 font-medium text-h5 hover:bg-black/10 dark:hover:bg-white/20';

  const { keypair } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const variables = useMemo(() => ({ partyId: keypair?.pub }), [keypair?.pub]);
  const { data } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });
  const { data: marketDataPositions } = useDataProvider({
    dataProvider: positionsDataProvider,
    variables,
  });

  const positionMarkets: MarketList = {
    markets:
      data?.markets
        ?.filter((market) =>
          marketDataPositions?.find(
            (position) => position.market.id === market.id
          )
        )
        .map((market) => {
          const position = marketDataPositions?.find(
            (position) => position.market.id === market.id
          );
          return {
            ...market,
            size: position?.openVolume,
          };
        }) || null,
  };

  return (
    <Popover
      open={open}
      onChange={setOpen}
      trigger={
        <div
          className={classNames(
            'dark:text-vega-yellow text-vega-pink',
            headerTriggerButtonClassName
          )}
        >
          <span className="break-words text-left ml-5 ">{marketName}</span>
          <RotatingArrow
            color="yellow"
            borderX={8}
            borderBottom={12}
            up={open}
          />
        </div>
      }
    >
      <div
        className="max-h-[40rem] overflow-x-auto m-20"
        data-testid="select-market-list"
      >
        <span
          className="text-h4 font-bold text-black-95 dark:text-white-95 mt-0 mb-6"
          data-testid="dialog-title"
        >
          {t('Select a market')}
        </span>
        <table className="relative h-full min-w-full whitespace-nowrap">
          {keypair &&
            positionMarkets?.markets &&
            positionMarkets.markets.length > 0 && (
              <SelectAllMarketsTableBody
                title={t('My markets')}
                data={positionMarkets}
              />
            )}
          <SelectAllMarketsTableBody title={t('All markets')} data={data} />
        </table>
      </div>
    </Popover>
  );
};

export const SelectMarketDialog = ({
  dialogOpen,
  setDialogOpen,
  title = t('Select a market'),
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
  detailed?: boolean;
}) => {
  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });
  return (
    <Dialog
      title={title}
      intent={Intent.Primary}
      open={!isNil(data) && dialogOpen}
      onChange={() => setDialogOpen(false)}
      titleClassNames="font-bold font-sans text-3xl tracking-tight mb-0 pl-8"
      size="small"
    >
      <SelectMarketLandingTable
        data={data}
        onSelect={() => setDialogOpen(false)}
      />
    </Dialog>
  );
};
