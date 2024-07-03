import { useVegaTransactionStore } from '@vegaprotocol/web3';
import {
  isStopOrderType,
  useDealTicketFormValues,
} from '@vegaprotocol/react-helpers';
import { StopOrder } from './deal-ticket-stop-order';
import {
  useStaticMarketData,
  useMarketPrice,
  marketInfoProvider,
  useMarkPrice,
} from '@vegaprotocol/markets';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DealTicket } from './deal-ticket';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { useT } from '../../use-t';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type {
  Market,
  MarketInfo,
  StaticMarketData,
} from '@vegaprotocol/markets';

interface DealTicketContainerProps {
  marketId: string;
  onDeposit: (assetId: string) => void;
}

export const DealTicketContainer = ({
  marketId,
  onDeposit,
}: DealTicketContainerProps) => {
  const t = useT();
  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useDataProvider({
    dataProvider: marketInfoProvider,
    variables: { marketId },
  });

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
    reload,
  } = useStaticMarketData(marketId);
  const { data: marketPrice } = useMarketPrice(marketId);
  const { data: markPrice } = useMarkPrice(marketId);

  return (
    <AsyncRendererInline
      data={market && marketData}
      loading={marketLoading || marketDataLoading}
      error={marketError || marketDataError}
      reload={reload}
    >
      {market && marketData ? (
        <DealTicketSwitch
          onDeposit={onDeposit}
          riskFactors={market.riskFactors}
          scalingFactors={
            market.tradableInstrument.marginCalculator?.scalingFactors
          }
          market={market}
          marketPrice={marketPrice}
          markPrice={markPrice}
          marketData={marketData}
        />
      ) : (
        <p>{t('Could not load market')}</p>
      )}
    </AsyncRendererInline>
  );
};

const DealTicketSwitch = (props: {
  scalingFactors?: NonNullable<
    MarketInfo['tradableInstrument']['marginCalculator']
  >['scalingFactors'];
  riskFactors: MarketInfo['riskFactors'];
  market: Market;
  marketData: StaticMarketData;
  marketPrice?: string | null;
  markPrice?: string | null;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onDeposit: (assetId: string) => void;
}) => {
  const featureFlags = useFeatureFlags((state) => state.flags);

  const showStopOrder = useDealTicketFormValues((state) =>
    isStopOrderType(state.formValues[props.market.id]?.type)
  );

  const create = useVegaTransactionStore((state) => state.create);

  if (featureFlags.STOP_ORDERS && showStopOrder) {
    return (
      <StopOrder
        {...props}
        submit={(stopOrdersSubmission) => create({ stopOrdersSubmission })}
      />
    );
  }

  return (
    <DealTicket {...props} submit={(transaction) => create(transaction)} />
  );
};
