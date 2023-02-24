import { useMemo } from 'react';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/utils';
import { useThrottledDataProvider } from '@vegaprotocol/utils';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { useMarket, marketDataProvider } from '@vegaprotocol/market-list';
import { DealTicket } from './deal-ticket';

export interface DealTicketContainerProps {
  marketId: string;
  onClickCollateral?: () => void;
}

export const DealTicketContainer = ({
  marketId,
  onClickCollateral,
}: DealTicketContainerProps) => {
  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useMarket(marketId);

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
    reload,
  } = useThrottledDataProvider(
    {
      dataProvider: marketDataProvider,
      variables: useMemo(() => ({ marketId }), [marketId]),
    },
    1000
  );
  const create = useVegaTransactionStore((state) => state.create);

  return (
    <AsyncRenderer
      data={market && marketData}
      loading={marketLoading || marketDataLoading}
      error={marketError || marketDataError}
      reload={reload}
    >
      {market && marketData ? (
        <DealTicket
          market={market}
          marketData={marketData}
          submit={(orderSubmission) => create({ orderSubmission })}
          onClickCollateral={onClickCollateral || (() => null)}
        />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
