import { t, volumePrefix, useDataProvider } from '@vegaprotocol/react-helpers';
import {
  Dialog,
  Icon,
  Intent,
  Loader,
  Link,
  Popover,
} from '@vegaprotocol/ui-toolkit';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { Column } from './select-market-columns';
import {
  columnHeadersPositionMarkets,
  columnsPositionMarkets,
} from './select-market-columns';
import { columnHeaders } from './select-market-columns';
import { columns } from './select-market-columns';
import type { Market, MarketData, MarketCandles, Candle } from '../';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type {
  Positions_party,
  PositionsSubscription_positions,
  Positions_party_positionsConnection_edges_node,
} from '@vegaprotocol/positions';
import { positionsDataProvider } from '@vegaprotocol/positions';
import {
  SelectMarketTableHeader,
  SelectMarketTableRow,
} from './select-market-table';
import { useMarketList } from '../markets-provider';

export const SelectMarketLandingTable = ({
  markets,
  marketsData,
  marketsCandles,
  onSelect,
}: {
  markets: Market[] | undefined;
  marketsData: MarketData[] | undefined;
  marketsCandles: MarketCandles[] | undefined;
  onSelect: (id: string) => void;
}) => {
  return (
    <>
      <div
        className="max-h-[60vh] overflow-x-auto"
        data-testid="select-market-list"
      >
        <table className="text-sm relative h-full min-w-full whitespace-nowrap">
          <thead className="sticky top-0 z-10 bg-white dark:bg-black">
            <SelectMarketTableHeader />
          </thead>
          <tbody>
            {markets?.map((market, i) => (
              <SelectMarketTableRow
                key={i}
                detailed={false}
                columns={columns(
                  market,
                  marketsData?.find(
                    (marketData) => marketData.market.id === market.id
                  ),
                  marketsCandles?.find(
                    (marketCandles) => marketCandles.marketId === market.id
                  )?.candles,
                  onSelect
                )}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/markets">{'Or view full market list'}</Link>
    </>
  );
};

export const SelectAllMarketsTableBody = ({
  markets,
  marketsData,
  marketsCandles,
  positions,
  onSelect,
  headers = columnHeaders,
  tableColumns = (market, marketData, candles) =>
    columns(market, marketData, candles, onSelect),
}: {
  markets: Market[] | undefined;
  marketsData: MarketData[] | undefined;
  marketsCandles: MarketCandles[] | undefined;
  positions?: Positions_party_positionsConnection_edges_node[];
  title?: string;
  onSelect: (id: string) => void;
  headers?: Column[];
  tableColumns?: (
    market: Market,
    marketData: MarketData | undefined,
    candles: Candle[] | undefined,
    openVolume?: string
  ) => Column[];
}) => {
  if (!markets) return null;
  return (
    <>
      <thead className="bg-neutral-200 dark:bg-neutral-800">
        <SelectMarketTableHeader detailed={true} headers={headers} />
      </thead>
      {/* Border styles required to create space between tbody elements margin/padding don't work */}
      <tbody className="border-b-[10px] border-transparent">
        {markets?.map((market, i) => (
          <SelectMarketTableRow
            key={i}
            detailed={true}
            columns={tableColumns(
              market,
              marketsData?.find(
                (marketData) => marketData.market.id === market.id
              ),
              marketsCandles?.find(
                (marketCandles) => marketCandles.marketId === market.id
              )?.candles,
              positions &&
                positions.find((p) => p.market.id === market.id)?.openVolume
            )}
          />
        ))}
      </tbody>
    </>
  );
};

export const SelectMarketPopover = ({
  marketName,
  onSelect,
}: {
  marketName: string;
  onSelect: (id: string) => void;
}) => {
  const triggerClasses =
    'sm:text-lg md:text-xl lg:text-2xl flex items-center gap-4 whitespace-nowrap';
  const { keypair } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const { data, loading: marketsLoading } = useMarketList();
  const variables = useMemo(() => ({ partyId: keypair?.pub }), [keypair?.pub]);
  const { data: party, loading: positionsLoading } = useDataProvider<
    Positions_party,
    PositionsSubscription_positions
  >({
    dataProvider: positionsDataProvider,
    update: () => false,
    variables,
  });

  const onSelectMarket = (marketId: string) => {
    onSelect(marketId);
    setOpen(false);
  };

  const iconClass = open ? 'rotate-180' : '';
  const markets = useMemo(
    () =>
      data?.markets?.filter((market) =>
        party?.positionsConnection.edges?.find(
          (edge) => edge.node.market.id === market.id
        )
      ),
    [data, party]
  );

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
      <div
        className="w-[90vw] max-h-[80vh] overflow-y-auto"
        data-testid="select-market-list"
      >
        {marketsLoading || (keypair?.pub && positionsLoading) ? (
          <div className="flex items-center gap-4">
            <Loader size="small" />
            Loading market data
          </div>
        ) : (
          <>
            {keypair && (party?.positionsConnection.edges?.length ?? 0) > 0 ? (
              <table className="relative text-sm w-full whitespace-nowrap -mx-2">
                <TableTitle>{t('My markets')}</TableTitle>
                <SelectAllMarketsTableBody
                  markets={markets}
                  marketsData={data?.marketsData}
                  marketsCandles={data?.marketsCandles}
                  positions={party?.positionsConnection.edges
                    ?.filter((edge) => edge.node)
                    .map((edge) => edge.node)}
                  onSelect={onSelectMarket}
                  headers={columnHeadersPositionMarkets}
                  tableColumns={(market, marketData, candles, openVolume) =>
                    columnsPositionMarkets(
                      market,
                      marketData,
                      candles,
                      onSelectMarket,
                      openVolume
                    )
                  }
                />
              </table>
            ) : null}
            <table className="relative text-sm w-full whitespace-nowrap -mx-2">
              <TableTitle>{t('All markets')}</TableTitle>
              <SelectAllMarketsTableBody
                markets={data?.markets}
                marketsData={data?.marketsData}
                marketsCandles={data?.marketsCandles}
                onSelect={onSelectMarket}
              />
            </table>
          </>
        )}
      </div>
    </Popover>
  );
};

const TableTitle = ({ children }: { children: ReactNode }) => {
  return (
    <thead>
      <tr>
        <th className="font-normal px-2 text-left">
          <h3 className="text-lg">{children}</h3>
        </th>
      </tr>
    </thead>
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
  const { data, loading, error } = useMarketList();
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

  return (
    <SelectMarketLandingTable
      markets={data?.markets}
      marketsData={data?.marketsData}
      marketsCandles={data?.marketsCandles}
      onSelect={onSelect}
    />
  );
};
