import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import {
  DealTicketType,
  useDealTicketTypeStore,
} from '../../hooks/use-type-store';
import { StopOrder } from './deal-ticket-stop-order';
import {
  useStaticMarketData,
  useMarket,
  useMarketPrice,
} from '@vegaprotocol/markets';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { DealTicket } from './deal-ticket';
import { FLAGS } from '@vegaprotocol/environment';

interface DealTicketContainerProps {
  marketId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onClickCollateral?: () => void;
  onDeposit: (assetId: string) => void;
}

export const DealTicketContainer = ({
  marketId,
  ...props
}: DealTicketContainerProps) => {
  const type = useDealTicketTypeStore((state) => state.type[marketId]);
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
    <AsyncRenderer
      data={market && marketData}
      loading={marketLoading || marketDataLoading}
      error={marketError || marketDataError}
      reload={reload}
    >
      {market && marketData ? (
        FLAGS.STOP_ORDERS &&
        (type === DealTicketType.StopLimit ||
          type === DealTicketType.StopMarket) ? (
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
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
