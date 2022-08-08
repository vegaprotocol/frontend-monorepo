import { useRouter } from 'next/router';
import { t } from '@vegaprotocol/react-helpers';
import type { MarketList } from '../../__generated__/MarketList';
import { Interval } from '@vegaprotocol/types';
import { MARKET_LIST_QUERY } from '../../markets-data-provider';
import { SelectAllMarketsTableBody } from '../select-market';
import { useQuery } from '@apollo/client';

export const MarketsContainer = () => {
  const { push } = useRouter();

  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.I1H, since: yTimestamp },
  });
  const onSelectMarket = (marketId: string) => {
    push(`/markets/${marketId}`);
  };

  return (
    <table className="m-20">
      <SelectAllMarketsTableBody
        title={t('All markets')}
        data={data}
        onSelect={onSelectMarket}
      />
    </table>
  );
};
