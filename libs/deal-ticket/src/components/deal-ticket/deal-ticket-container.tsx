import { useMemo } from 'react';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataUpdateFieldsFragment,
  MarketDealTicket,
} from '@vegaprotocol/market-list';
import { marketDealTicketProvider } from '@vegaprotocol/market-list';
import { DealTicketManager } from './deal-ticket-manager';

export interface DealTicketContainerProps {
  marketId: string;
}

export const DealTicketContainer = ({ marketId }: DealTicketContainerProps) => {
  const variables = useMemo(
    () => ({
      marketId: marketId || '',
    }),
    [marketId]
  );
  const { data, error, loading } = useDataProvider<
    MarketDealTicket,
    MarketDataUpdateFieldsFragment
  >({
    dataProvider: marketDealTicketProvider,
    variables,
    skip: !marketId,
  });

  return (
    <AsyncRenderer<MarketDealTicket>
      data={data || undefined}
      loading={loading}
      error={error}
    >
      {data ? (
        <DealTicketManager market={data} />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
