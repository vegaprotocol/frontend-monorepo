import { useCallback, useMemo, useState } from 'react';
import { useMarkets } from '@vegaprotocol/market-list';
import { positionsDataProvider } from '@vegaprotocol/positions';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { ExternalLink, Icon, Loader, Popover } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  columnHeaders,
  columnHeadersPositionMarkets,
  ColumnKind,
  columns,
  columnsPositionMarkets,
} from './select-market-columns';
import {
  SelectMarketTableHeader,
  SelectMarketTableRow,
  SelectMarketTableRowSplash,
} from './select-market-table';
import type { ReactNode } from 'react';
import type { MarketX } from '@vegaprotocol/market-list';
import type { PositionFieldsFragment } from '@vegaprotocol/positions';
import type { Column, OnCellClickHandler } from './select-market-columns';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { useGlobalStore } from '../../stores';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

export const SelectAllMarketsTableBody = ({
  markets,
  positions,
  onSelect,
  onCellClick,
  activeMarketId,
  headers = columnHeaders,
  tableColumns = (market) =>
    columns(market, onSelect, onCellClick, activeMarketId),
}: {
  markets?: MarketX[] | null;
  positions?: PositionFieldsFragment[];
  title?: string;
  onSelect: (id: string) => void;
  onCellClick: OnCellClickHandler;
  activeMarketId?: string | null;
  headers?: Column[];
  tableColumns?: (market: MarketX, openVolume?: string) => Column[];
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
}: {
  marketName: string;
  onSelect: (id: string) => void;
}) => {
  const triggerClasses =
    'sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2 whitespace-nowrap hover:text-neutral-500 dark:hover:text-neutral-300 mt-1';
  const [open, setOpen] = useState(false);
  const onSelectMarket = useCallback(
    (marketId: string) => {
      onSelect(marketId);
      setOpen(false);
    },
    [onSelect]
  );
  const iconClass = open ? 'rotate-180' : '';

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
      <Container onSelect={onSelectMarket} />
    </Popover>
  );
};

const Container = ({ onSelect }: { onSelect: (marketId: string) => void }) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const { activeMarketId } = useGlobalStore((store) => ({
    activeMarketId: store.marketId,
  }));
  const { pubKey } = useVegaWallet();
  const { markets, loading } = useMarkets();

  const variables = useMemo(() => ({ partyId: pubKey }), [pubKey]);
  const { data: party, loading: positionsLoading } = useDataProvider({
    dataProvider: positionsDataProvider,
    variables,
    skip: !pubKey,
  });

  const onCellClick: OnCellClickHandler = (e, kind, value) => {
    if (value && kind === ColumnKind.Asset) {
      openAssetDetailsDialog(value, e.target as HTMLElement);
    }
  };

  return (
    <div
      className="w-[90vw] max-h-[80vh] overflow-y-auto"
      data-testid="select-market-list"
    >
      {loading || (pubKey && positionsLoading) ? (
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
                onSelect={onSelect}
                onCellClick={onCellClick}
                headers={columnHeadersPositionMarkets}
                tableColumns={(market, openVolume) =>
                  columnsPositionMarkets(
                    market,
                    onSelect,
                    openVolume,
                    onCellClick,
                    activeMarketId
                  )
                }
              />
            </>
          ) : null}
          <TableTitle>{t('All markets')}</TableTitle>
          <SelectAllMarketsTableBody
            markets={markets}
            onSelect={onSelect}
            onCellClick={onCellClick}
            activeMarketId={activeMarketId}
          />
        </table>
      )}
    </div>
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
