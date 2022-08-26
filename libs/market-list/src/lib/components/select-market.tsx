import { useQuery } from '@apollo/client';
import { t, volumePrefix } from '@vegaprotocol/react-helpers';
import {
  Dialog,
  Intent,
  Link,
  Popover,
  RotatingArrow,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import type { Column } from './select-market-columns';
import {
  columnHeadersPositionMarkets,
  columnsPositionMarkets,
} from './select-market-columns';
import { columnHeaders } from './select-market-columns';
import { columns } from './select-market-columns';
import type { MarketList_markets } from '../__generated__';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { Positions } from '@vegaprotocol/positions';
import { POSITION_QUERY } from '@vegaprotocol/positions';
import {
  SelectMarketTableHeader,
  SelectMarketTableRow,
} from './select-market-table';
import { useMarketList } from '../markets-data-provider';

export const SelectMarketLandingTable = ({
  data,
  onSelect,
}: {
  data: MarketList_markets[] | undefined;
  onSelect: (id: string) => void;
}) => {
  const textDecorationClassName = `px-8 underline font-sans leading-9 font-bold tracking-tight decoration-solid text-ui light:hover:text-black/80 dark:hover:text-white/80 text-black dark:text-white`;
  return (
    <>
      <div
        className="max-h-[50vh] overflow-x-auto"
        data-testid="select-market-list"
      >
        <table className="relative h-full min-w-full whitespace-nowrap">
          <thead className="sticky top-0 z-10 dark:bg-black bg-white">
            <SelectMarketTableHeader />
          </thead>
          <tbody>
            {data?.map((market, i) => (
              <SelectMarketTableRow
                key={i}
                detailed={false}
                columns={columns(market, onSelect)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Link className={textDecorationClassName} href="/markets">
        {'Or view full market list'}
      </Link>
    </>
  );
};

export const SelectAllMarketsTableBody = ({
  data,
  title = t('All markets'),
  onSelect,
  headers = columnHeaders,
  tableColumns = (market) => columns(market, onSelect),
}: {
  data?: MarketList_markets[];
  title?: string;
  onSelect: (id: string) => void;
  headers?: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableColumns?: (market: any) => Column[];
}) => {

  return data ? (
    <>
      <thead>
        <tr
          className={`text-h5 font-bold text-black-95 dark:text-white-95 mb-6`}
          data-testid="dialog-title"
        >
          <th>{title}</th>
        </tr>
        <SelectMarketTableHeader detailed={true} headers={headers} />
      </thead>

      <tbody>
        {data?.map((market, i) => (
          <SelectMarketTableRow
            key={i}
            detailed={true}
            columns={tableColumns(market)}
          />
        ))}
      </tbody>
    </>
  ) : (
    <thead>
      <tr>
        <td className="text-black dark:text-white text-ui">
          {t('Loading market data...')}
        </td>
      </tr>
    </thead>
  );
};

export const SelectMarketPopover = ({
  marketName,
  onSelect,
}: {
  marketName: string;
  onSelect: (id: string) => void;
}) => {
  const headerTriggerButtonClassName =
    'flex items-center gap-8 shrink-0 p-8 font-medium text-h5 hover:bg-black/10 dark:hover:bg-white/20';
  const { keypair } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const { data } = useMarketList();
  const variables = useMemo(() => ({ partyId: keypair?.pub }), [keypair?.pub]);
  const { data: marketDataPositions } = useQuery<Positions>(POSITION_QUERY, {
    variables,
    skip: !keypair?.pub,
  });

  const positionMarkets = useMemo(
    () => ({
      markets:
        data
          ?.filter((market) =>
            marketDataPositions?.party?.positions?.find(
              (position) => position.market.id === market.id
            )
          )
          .map((market) => {
            const position = marketDataPositions?.party?.positions?.find(
              (position) => position.market.id === market.id
            );
            return {
              ...market,
              openVolume:
                position?.openVolume && volumePrefix(position.openVolume),
            };
          }) || null,
    }),
    [data, marketDataPositions]
  );

  const onSelectMarket = (marketId: string) => {
    onSelect(marketId);
    setOpen(false);
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
          <RotatingArrow borderX={8} borderBottom={12} up={open} />
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
        <table className="relative h-full w-full whitespace-nowrap overflow-y-auto">
          {keypair &&
            positionMarkets?.markets &&
            positionMarkets.markets.length > 0 && (
              <SelectAllMarketsTableBody
                title={t('My markets')}
                data={positionMarkets.markets}
                onSelect={onSelectMarket}
                headers={columnHeadersPositionMarkets}
                tableColumns={(market) =>
                  columnsPositionMarkets(market, onSelectMarket)
                }
              />
            )}
          <SelectAllMarketsTableBody
            title={t('All markets')}
            data={data}
            onSelect={onSelectMarket}
          />
        </table>
      </div>
    </Popover>
  );
};

export const SelectMarketDialog = ({
  dialogOpen,
  setDialogOpen,
  onSelect,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
  onSelect: (id: string) => void;
}) => {
  const onSelectMarket = (id: string) => {
    onSelect(id);
    setDialogOpen(false);
  };

  return (
    <Dialog
      title={t('Select a market to get started')}
      intent={Intent.Primary}
      open={dialogOpen}
      onChange={() => setDialogOpen(false)}
      titleClassNames="font-bold font-sans text-3xl tracking-tight mb-0 pl-8"
      size="small"
    >
      <LandingDialogContainer onSelect={onSelectMarket} />
    </Dialog>
  );
};

interface LandingDialogContainerProps {
  onSelect: (id: string) => void;
}

const LandingDialogContainer = ({ onSelect }: LandingDialogContainerProps) => {
  const { data, loading, error } = useMarketList();
  if (error) {
    return (
      <div className="flex justify-center items-center">
        <p className="my-32">{t('Failed to load markets')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p className="my-32">{t('Loading...')}</p>
      </div>
    );
  }

  return <SelectMarketLandingTable data={data} onSelect={onSelect} />;
};

