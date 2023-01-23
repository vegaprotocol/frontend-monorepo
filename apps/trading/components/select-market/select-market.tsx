import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import type { RefObject } from 'react';
import { useMarketList } from '@vegaprotocol/market-list';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { ExternalLink, Icon, Loader, Popover } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
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
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { HeaderTitle } from '../header';

export type Market = MarketWithCandles & MarketWithData;

export const SelectAllMarketsTableBody = ({
  markets,
  positions,
  onSelect,
  onCellClick,
  inViewRoot,
  headers = columnHeaders,
  tableColumns = (market) => columns(market, onSelect, onCellClick, inViewRoot),
}: {
  markets?: Market[] | null;
  positions?: PositionFieldsFragment[];
  title?: string;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
  headers?: Column[];
  tableColumns?: (
    market: Market,
    inViewRoot?: RefObject<HTMLDivElement>,
    openVolume?: string
  ) => Column[];
  inViewRoot?: RefObject<HTMLDivElement>;
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
                inViewRoot,
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
  marketCode,
  marketName,
  onSelect,
  onCellClick,
}: {
  marketCode: string;
  marketName: string;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
}) => {
  const { pubKey } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const inViewRoot = useRef<HTMLDivElement>(null);
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
        <div className="flex items-center gap-2">
          <HeaderTitle
            primaryContent={marketCode}
            secondaryContent={marketName}
          />
          <Icon name="chevron-down" className={iconClass} size={6} />
        </div>
      }
    >
      <div
        className="w-[90vw] max-h-[80vh] overflow-y-auto"
        data-testid="select-market-list"
        ref={inViewRoot}
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
                  inViewRoot={inViewRoot}
                  markets={markets}
                  positions={party?.positionsConnection?.edges
                    ?.filter((edge) => edge.node)
                    .map((edge) => edge.node)}
                  onSelect={onSelectMarket}
                  onCellClick={onCellClick}
                  headers={columnHeadersPositionMarkets}
                  tableColumns={(market, inViewRoot, openVolume) =>
                    columnsPositionMarkets(
                      market,
                      onSelectMarket,
                      inViewRoot,
                      openVolume,
                      onCellClick
                    )
                  }
                />
              </>
            ) : null}
            <TableTitle>{t('All markets')}</TableTitle>
            <SelectAllMarketsTableBody
              inViewRoot={inViewRoot}
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
