import { useQuery } from '@apollo/client';
import { t, volumePrefix } from '@vegaprotocol/react-helpers';
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
import type { MarketList_markets } from '../';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { Positions } from '@vegaprotocol/positions';
import { POSITIONS_QUERY } from '@vegaprotocol/positions';
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
      <Link href="/markets">{'Or view full market list'}</Link>
    </>
  );
};

export const SelectAllMarketsTableBody = ({
  data,
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
  if (!data) return null;
  return (
    <>
      <thead className="bg-neutral-50 dark:bg-neutral-800">
        <SelectMarketTableHeader detailed={true} headers={headers} />
      </thead>
      {/* Border styles required to create space between tbody elements margin/padding dont work */}
      <tbody className="border-b-[10px] border-transparent">
        {data?.map((market, i) => (
          <SelectMarketTableRow
            key={i}
            detailed={true}
            columns={tableColumns(market)}
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
  const triggerClasses = 'sm:text-lg md:text-xl lg:text-2xl font-medium flex items-center gap-4 whitespace-nowrap';
  const { keypair } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const { data, loading: marketsLoading } = useMarketList();
  const variables = useMemo(() => ({ partyId: keypair?.pub }), [keypair?.pub]);
  const { data: marketDataPositions, loading: positionsLoading } =
    useQuery<Positions>(POSITIONS_QUERY, {
      variables,
      skip: !keypair?.pub,
    });

  const positionMarkets = useMemo(
    () => ({
      markets:
        data
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
            {keypair &&
              positionMarkets?.markets &&
              positionMarkets.markets.length > 0 && (
                <table className="relative text-sm w-full whitespace-nowrap">
                  <TableTitle>{t('My markets')}</TableTitle>
                  <SelectAllMarketsTableBody
                    data={positionMarkets.markets}
                    onSelect={onSelectMarket}
                    headers={columnHeadersPositionMarkets}
                    tableColumns={(market) =>
                      columnsPositionMarkets(market, onSelectMarket)
                    }
                  />
                </table>
              )}
            <table className="relative text-sm w-full whitespace-nowrap">
              <TableTitle>{t('All markets')}</TableTitle>
              <SelectAllMarketsTableBody
                data={data}
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

  return <SelectMarketLandingTable data={data} onSelect={onSelect} />;
};
