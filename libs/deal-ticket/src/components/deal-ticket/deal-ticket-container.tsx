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
  getProductType,
} from '@vegaprotocol/markets';
import { AsyncRendererInline } from '@vegaprotocol/ui-toolkit';
import { DealTicket } from './deal-ticket';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { useT } from '../../use-t';
import { MarginModeSelector } from './margin-mode-selector';
import { useDataProvider } from '@vegaprotocol/data-provider';

interface DealTicketContainerProps {
  marketId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onDeposit: (assetId: string) => void;
}

export const DealTicketContainer = ({
  marketId,
  ...props
}: DealTicketContainerProps) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const t = useT();
  const showStopOrder = useDealTicketFormValues((state) =>
    isStopOrderType(state.formValues[marketId]?.type)
  );
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
  const create = useVegaTransactionStore((state) => state.create);

  const productType = market && getProductType(market);

  return (
    <AsyncRendererInline
      data={market && marketData}
      loading={marketLoading || marketDataLoading}
      error={marketError || marketDataError}
      reload={reload}
    >
      {market && marketData ? (
        <>
          {featureFlags.ISOLATED_MARGIN && productType !== 'Spot' && (
            <>
              <MarginModeSelector marketId={marketId} />
              <hr className="border-vega-clight-500 dark:border-vega-cdark-500 mb-4" />
            </>
          )}
          {featureFlags.STOP_ORDERS && showStopOrder ? (
            <StopOrder
              market={market}
              marketPrice={marketPrice}
              submit={(stopOrdersSubmission) =>
                create({ stopOrdersSubmission })
              }
            />
          ) : (
            <DealTicket
              {...props}
              riskFactors={market.riskFactors}
              scalingFactors={
                market.tradableInstrument.marginCalculator?.scalingFactors
              }
              market={market}
              marketPrice={marketPrice}
              markPrice={markPrice}
              marketData={marketData}
              submit={(transaction) => create(transaction)}
            />
          )}
        </>
      ) : (
        <p>{t('Could not load market')}</p>
      )}
    </AsyncRendererInline>
  );
};
