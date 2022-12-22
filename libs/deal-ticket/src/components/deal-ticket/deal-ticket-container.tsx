import { useMemo } from 'react';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataUpdateFieldsFragment,
  MarketDealTicket,
} from '@vegaprotocol/market-list';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { marketDealTicketProvider } from '@vegaprotocol/market-list';
import { DealTicket } from './deal-ticket';

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
  const create = useVegaTransactionStore((state) => state.create);

  return (
    <AsyncRenderer<MarketDealTicket>
      data={data || undefined}
      loading={loading}
      error={error}
    >
      {data ? (
        <DealTicket
          market={data}
          submit={(orderSubmission) => create({ orderSubmission })}
        />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
