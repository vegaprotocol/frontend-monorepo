import { useVegaTransactionStore } from '@vegaprotocol/web3';
import {
  isStopOrderType,
  useDealTicketFormValues,
} from '../../hooks/use-form-values';
import { StopOrder } from './StopOrder';
import {
  useStaticMarketData,
  useMarket,
  useMarketPrice,
} from '@vegaprotocol/markets';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DealTicket } from './deal-ticket';
import { FLAGS } from '@vegaprotocol/environment';
import { useT } from '../../use-t';

interface DealTicketContainerProps {
  marketId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onDeposit: (assetId: string) => void;
}

export const DealTicketContainer = ({
  marketId,
  ...props
}: DealTicketContainerProps) => {
  const t = useT();
  const showStopOrder = useDealTicketFormValues((state) =>
    isStopOrderType(state.formValues[marketId]?.type)
  );
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
  } = useStaticMarketData(marketId);
  const { data: marketPrice } = useMarketPrice(market?.id);
  const create = useVegaTransactionStore((state) => state.create);
  return (
    <AsyncRendererInline
      data={market && marketData}
      loading={marketLoading || marketDataLoading}
      error={marketError || marketDataError}
      reload={reload}
    >
      {market && marketData ? (
        FLAGS.STOP_ORDERS && showStopOrder ? (
          <StopOrder
            market={market}
            marketPrice={marketPrice}
            submit={(stopOrdersSubmission) => create({ stopOrdersSubmission })}
          />
        ) : (
          <DealTicket
            {...props}
            market={market}
            marketPrice={marketPrice}
            marketData={marketData}
            submit={(orderSubmission) => create({ orderSubmission })}
          />
        )
      ) : (
        <p>{t('Could not load market')}</p>
      )}
    </AsyncRendererInline>
  );
};
