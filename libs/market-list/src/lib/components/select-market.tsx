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
import { SelectMarketList } from './select-market-list';
import type { MarketList } from '../__generated__';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { positionsDataProvider } from '@vegaprotocol/positions';

export const SelectMarketPopover = ({ marketName }: { marketName: string }) => {
  const { keypair } = useVegaWallet();
  const [open, setOpen] = useState(false);
  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });
  const headerTriggerButtonClassName =
    'flex items-center gap-8 shrink-0 p-8 font-medium text-h5 hover:bg-black/10 dark:hover:bg-white/20';
  const variables = useMemo(() => ({ partyId: keypair?.pub }), [keypair?.pub]);

  const { data: marketDataPositions } = useDataProvider({
    dataProvider: positionsDataProvider,
    variables,
  });
  const positionMarkets: MarketList = {
    markets:
      data?.markets?.filter((market) =>
        marketDataPositions?.find(
          (position) => position.market.id === market.id
        )
      ) || null,
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
      <div className="m-20">
        {keypair &&
          positionMarkets &&
          (positionMarkets?.markets ?? []).length > 0 && (
            <>
              <h1
                className={`text-h4 font-bold text-black-95 dark:text-white-95 mt-0 mb-6`}
                data-testid="dialog-title"
              >
                {t('My markets')}
              </h1>
              <SelectMarketList
                data={positionMarkets}
                onSelect={() => setOpen(false)}
                detailed={true}
              />
            </>
          )}
        <h1
          className={`text-h4 font-bold text-black-95 dark:text-white-95 mt-0 mb-6`}
          data-testid="dialog-title"
        >
          {t('All markets')}
        </h1>
        <SelectMarketList
          data={data}
          onSelect={() => setOpen(false)}
          detailed={true}
        />
      </div>
    </Popover>
  );
};

export interface SelectMarketDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
  detailed?: boolean;
  size?: 'small' | 'large';
}

export const SelectMarketDialog = ({
  dialogOpen,
  setDialogOpen,
  title = t('Select a market'),
  size,
}: SelectMarketDialogProps) => {
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
      size={size}
    >
      <SelectMarketList
        data={data}
        onSelect={() => setDialogOpen(false)}
        detailed={false}
      />
    </Dialog>
  );
};
