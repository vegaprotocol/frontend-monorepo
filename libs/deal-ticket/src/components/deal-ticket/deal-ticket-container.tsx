import { useMemo } from 'react';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataUpdateFieldsFragment,
  MarketDealTicket,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDealTicketProvider } from '@vegaprotocol/market-list';
import { DealTicketManager } from './deal-ticket-manager';

export interface DealTicketContainerProps {
  marketId: string;
  children?(props: SingleMarketFieldsFragment): JSX.Element;
}

export const DealTicketContainer = ({
  marketId,
  children,
}: DealTicketContainerProps) => {
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
        children ? (
          children(data)
        ) : (
          <DealTicketManager market={data} />
        )
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
