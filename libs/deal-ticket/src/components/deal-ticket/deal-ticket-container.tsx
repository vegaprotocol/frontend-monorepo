import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import type { OrderSubmission } from '@vegaprotocol/wallet';
import {
  useVegaTransactionStore,
  SideMap,
  TimeInForceMap,
  TypeMap,
} from '@vegaprotocol/wallet';
import { useMarket, marketDataProvider } from '@vegaprotocol/markets';
import { DealTicket } from './deal-ticket';
import type * as Schema from '@vegaprotocol/types';

export interface DealTicketOrderSubmission {
  marketId: string;
  reference?: string;
  type: Schema.OrderType;
  side: Schema.Side;
  timeInForce: Schema.OrderTimeInForce;
  size: string;
  price?: string;
  expiresAt?: string;
  postOnly?: boolean;
  reduceOnly?: boolean;
}

export const convertDealTicketToOrderSubmission = (
  dealTicketOrder: DealTicketOrderSubmission
) => {
  return {
    ...dealTicketOrder,
    expiresAt: dealTicketOrder.expiresAt
      ? BigInt(dealTicketOrder.expiresAt)
      : null,
    size: BigInt(dealTicketOrder.size),
    side: SideMap[dealTicketOrder.side],
    timeInForce: TimeInForceMap[dealTicketOrder.timeInForce],
    type: TypeMap[dealTicketOrder.type],
  } as OrderSubmission;
};

export interface DealTicketContainerProps {
  marketId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onClickCollateral?: () => void;
}

export const DealTicketContainer = ({
  marketId,
  onMarketClick,
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
      variables: { marketId },
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
          submit={(dealTicketOrder) =>
            create({
              orderSubmission:
                convertDealTicketToOrderSubmission(dealTicketOrder),
            })
          }
          onClickCollateral={onClickCollateral}
          onMarketClick={onMarketClick}
        />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};
