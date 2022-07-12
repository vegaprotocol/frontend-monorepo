import { useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import { AsyncRenderer, Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { MARKET_LIST_QUERY } from '../markets-container/markets-data-provider';
import type { MarketList } from '../markets-container/__generated__/MarketList';

import { SelectMarketList } from './select-market-list';

interface LandingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const LandingDialog = ({ open, setOpen }: LandingDialogProps) => {
  const setClose = () => setOpen(false);

  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data, loading, error } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <Dialog
        title={t('Select a market to get started')}
        intent={Intent.Primary}
        open={open}
        onChange={setClose}
        titleClassNames="font-bold font-sans text-3xl tracking-tight mb-0 pl-8"
        contentClassNames="w-full lg:w-[520px]"
      >
        <SelectMarketList data={data} onSelect={setClose} />
      </Dialog>
    </AsyncRenderer>
  );
};
