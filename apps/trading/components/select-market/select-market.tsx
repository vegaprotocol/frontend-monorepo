import { useMarketList } from '@vegaprotocol/market-list';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import {
  Dialog,
  ExternalLink,
  Icon,
  Intent,
  Link as UILink,
  Loader,
  Popover,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  columnHeaders,
  columnHeadersPositionMarkets,
  columns,
  columnsPositionMarkets,
} from './select-market-columns';
import {
  SelectMarketTableHeader,
  SelectMarketTableRow,
  SelectMarketTableRowSplash,
} from './select-market-table';

import type { ReactNode } from 'react';
import type {
  MarketWithCandles,
  MarketWithData,
} from '@vegaprotocol/market-list';
import type { PositionFieldsFragment } from '@vegaprotocol/positions';
import type { Column, OnCellClickHandler } from './select-market-columns';
import { Link } from 'react-router-dom';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';

type Market = MarketWithCandles & MarketWithData;

export const SelectMarketLandingTable = ({
  markets,
  onSelect,
  onCellClick,
}: {
  markets: Market[] | null;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
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
                marketId={market.id}
                key={i}
                detailed={false}
                onSelect={onSelect}
                columns={columns(market, onSelect, onCellClick)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-md">
        <Link to="/markets" data-testid="view-market-list-link">
          <UILink>{'Or view full market list'} </UILink>
        </Link>
      </div>
    </>
  );
};

export const SelectAllMarketsTableBody = ({
  markets,
  positions,
  onSelect,
  onCellClick,
  headers = columnHeaders,
  tableColumns = (market) => columns(market, onSelect, onCellClick),
}: {
  markets?: Market[] | null;
  positions?: PositionFieldsFragment[];
  title?: string;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
  headers?: Column[];
  tableColumns?: (market: Market, openVolume?: string) => Column[];
}) => {
  const tokenLink = useLinks(DApp.Token);
  if (!markets) return null;
  return (
    <>
      <thead className="bg-neutral-100 dark:bg-neutral-800">
        <SelectMarketTableHeader detailed={true} headers={headers} />
      </thead>
      {/* Border styles required to create space between tbody elements margin/padding don't work */}
      <tbody className="border-b-[10px] border-transparent">
        {markets.length > 0 ? (
          markets?.map((market, i) => (
            <SelectMarketTableRow
              marketId={market.id}
              key={i}
              detailed
              onSelect={onSelect}
              columns={tableColumns(
                market,
                positions &&
                  positions.find((p) => p.market.id === market.id)?.openVolume
              )}
            />
          ))
        ) : (
          <SelectMarketTableRowSplash colSpan={12}>
            {t('No markets ')}
            <ExternalLink href={tokenLink(TOKEN_NEW_MARKET_PROPOSAL)}>
              {t('Propose a new market')}
            </ExternalLink>
          </SelectMarketTableRowSplash>
        )}
      </tbody>
    </>
  );
};

export const SelectMarketPopover = ({
  marketName,
  onSelect,
  onCellClick,
}: {
  marketName: string;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
}) => {
  const triggerClasses =
    'sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2 whitespace-nowrap hover:text-neutral-500 dark:hover:text-neutral-300 mt-1';
  const { pubKey } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const {
    data,
    loading: marketsLoading,
    reload: marketListReload,
  } = useMarketList();
  const variables = useMemo(() => ({ partyId: pubKey }), [pubKey]);
  const {
    data: party,
    loading: positionsLoading,
    reload,
  } = useDataProvider({
    dataProvider: positionsDataProvider,
    variables,
    skip: !pubKey,
  });
  const onSelectMarket = useCallback(
    (marketId: string) => {
      onSelect(marketId);
      setOpen(false);
    },
    [onSelect]
  );

  const iconClass = open ? 'rotate-180' : '';
  const markets = useMemo(
    () =>
      data?.filter((market) =>
        party?.positionsConnection?.edges?.find(
          (edge) => edge.node.market.id === market.id
        )
      ),
    [data, party]
  );

  useEffect(() => {
    if (open) {
      reload();
      marketListReload();
    }
  }, [open, marketListReload, reload]);

  return (
    <Popover
      open={open}
      onChange={setOpen}
      trigger={
        <span className={triggerClasses}>
          {marketName}
          <Icon name="chevron-down" className={iconClass} size={6} />
        </span>
      }
    >
      <div
        className="w-[90vw] max-h-[80vh] overflow-y-auto"
        data-testid="select-market-list"
      >
        {marketsLoading || (pubKey && positionsLoading) ? (
          <div className="flex items-center gap-4">
            <Loader size="small" />
            {t('Loading market data')}
          </div>
        ) : (
          <table className="relative text-sm w-full whitespace-nowrap">
            {pubKey && (party?.positionsConnection?.edges?.length ?? 0) > 0 ? (
              <>
                <TableTitle>{t('My markets')}</TableTitle>
                <SelectAllMarketsTableBody
                  markets={markets}
                  positions={party?.positionsConnection?.edges
                    ?.filter((edge) => edge.node)
                    .map((edge) => edge.node)}
                  onSelect={onSelectMarket}
                  onCellClick={onCellClick}
                  headers={columnHeadersPositionMarkets}
                  tableColumns={(market, openVolume) =>
                    columnsPositionMarkets(
                      market,
                      onSelectMarket,
                      openVolume,
                      onCellClick
                    )
                  }
                />
              </>
            ) : null}
            <TableTitle>{t('All markets')}</TableTitle>
            <SelectAllMarketsTableBody
              markets={data}
              onSelect={onSelectMarket}
              onCellClick={onCellClick}
            />
          </table>
        )}
      </div>
    </Popover>
  );
};

const TableTitle = ({ children }: { children: ReactNode }) => {
  return (
    <thead>
      <tr>
        <th className="font-normal text-left">
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
  onCellClick,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
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
      <LandingDialogContainer
        onSelect={onSelectMarket}
        onCellClick={onCellClick}
      />
    </Dialog>
  );
};

interface LandingDialogContainerProps {
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
}

const LandingDialogContainer = ({
  onSelect,
  onCellClick,
}: LandingDialogContainerProps) => {
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
      markets={data}
      onSelect={onSelect}
      onCellClick={onCellClick}
    />
  );
};
