import { useQuery } from '@apollo/client';
import { t, volumePrefix } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import { Dialog, Icon, Intent, Popover } from '@vegaprotocol/ui-toolkit';
import { useMemo, useState } from 'react';
import { MARKET_LIST_QUERY } from '../markets-data-provider';
import type { Column } from './select-market-columns';
import {
  columnHeadersPositionMarkets,
  columnsPositionMarkets,
} from './select-market-columns';
import { columnHeaders } from './select-market-columns';
import { columns } from './select-market-columns';
import type { MarketList } from '../__generated__';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { Positions } from '@vegaprotocol/positions';
import { POSITIONS_QUERY } from '@vegaprotocol/positions';
import { mapDataToMarketList } from '../utils/market-utils';
import {
  SelectMarketTableHeader,
  SelectMarketTableRow,
} from './select-market-table';
import classNames from 'classnames';

export const SelectMarketLandingTable = ({
  data,
  onSelect,
}: {
  data: MarketList | undefined;
  onSelect: (id: string) => void;
}) => {
  const marketList = data && mapDataToMarketList(data);
  return (
    <div
      className="max-h-[40rem] overflow-x-auto"
      data-testid="select-market-list"
    >
      <table className="text-sm relative h-full min-w-full whitespace-nowrap">
        <thead className="sticky top-0 z-10">
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
  onSelect,
  headers = columnHeaders,
  tableColumns = (market) => columns(market, onSelect),
}: {
  data?: MarketList;
  title?: string;
  onSelect: (id: string) => void;
  headers?: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableColumns?: (market: any) => Column[];
}) => {
  const marketList = useMemo(() => data && mapDataToMarketList(data), [data]);

  return marketList ? (
    <>
      <thead>
        <tr className="mb-2" data-testid="dialog-title">
          <th>{title}</th>
        </tr>
        <SelectMarketTableHeader detailed={true} headers={headers} />
      </thead>
      <tbody>
        {marketList?.map((market, i) => (
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
        <td>{t('Loading market data...')}</td>
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
  const triggerClasses = 'text-2xl flex items-center gap-4 shrink-0';
  const { keypair } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const { data } = useMarkets();
  const variables = useMemo(() => ({ partyId: keypair?.pub }), [keypair?.pub]);
  const { data: marketDataPositions } = useQuery<Positions>(POSITIONS_QUERY, {
    variables,
    skip: !keypair?.pub,
  });

  const positionMarkets = useMemo(
    () => ({
      markets:
        data?.markets
          ?.filter((market) =>
            marketDataPositions?.party?.positionsConnection.edges?.find(
              (edge) => edge.node.market.id === market.id
            )
          )
          .map((market) => {
            const position =
              marketDataPositions?.party?.positionsConnection.edges?.find(
                (edge) => edge.node.market.id === market.id
              )?.node;
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

  const iconClass = classNames('transition-transform duration-300', {
    'rotate-180': open,
  });

  return (
    <Popover
      open={open}
      onChange={setOpen}
      trigger={
        <span className={triggerClasses}>
          {marketName}
          <Icon name="chevron-down" className={iconClass} />
        </span>
      }
    >
      <div className="p-4 max-w-[90vw]" data-testid="select-market-list">
        <span data-testid="dialog-title">{t('Select a market')}</span>
        <table className="relative text-sm h-full w-full whitespace-nowrap overflow-y-auto">
          {keypair &&
            positionMarkets?.markets &&
            positionMarkets.markets.length > 0 && (
              <SelectAllMarketsTableBody
                title={t('My markets')}
                data={positionMarkets}
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
  const { data, loading, error } = useMarkets();
  if (error) {
    return (
      <div className="flex justify-center items-center">
        <p className="my-8">{t('Failed to load markets')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p className="my-8">{t('Loading...')}</p>
      </div>
    );
  }

  return <SelectMarketLandingTable data={data} onSelect={onSelect} />;
};

const useMarkets = () => {
  const since = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);
  const { data, loading, error } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.INTERVAL_I1H, since },
  });

  return { data, loading, error };
};
