import { useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import {
  ArrowDown,
  ArrowUp,
  Dialog,
  Intent,
  Popover,
} from '@vegaprotocol/ui-toolkit';
import isNil from 'lodash/isNil';
import { useState } from 'react';

import { MARKET_LIST_QUERY } from '../markets-data-provider';
import { SelectMarketList } from './select-market-list';

import type { MarketList } from '../__generated__';

export const SelectMarketPopover = ({ marketName }: { marketName: string }) => {
  const [open, setOpen] = useState(false);
  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });
  const isOpen = !isNil(data) && open;
  return (
    <Popover
      open={isOpen}
      onChange={setOpen}
      trigger={
        <button className="shrink-0 text-vega-pink dark:text-vega-yellow font-medium text-h5 flex items-center gap-8 hover:bg-black/10 dark:hover:bg-white/20">
          {isOpen ? (
            <>
              <span className="break-words p-5 text-left dark:text-white text-black">
                {t('Select a market')}
              </span>
              <ArrowUp borderX={8} borderBottom={12} />
            </>
          ) : (
            <>
              <span className="break-words text-left ml-5">{marketName}</span>
              <ArrowDown color="yellow" borderX={8} borderTop={12} />
            </>
          )}
        </button>
      }
    >
      <div className="m-20">
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
  size?: 'small' | 'large' | 'tall';
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
