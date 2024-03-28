import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InstrumentInfoPanel,
  KeyDetailsInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  LiquidityPriceRangeInfoPanel,
  LiquiditySLAParametersInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  PriceMonitoringBoundsInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  SettlementAssetInfoPanel,
  getDataSourceSpecForSettlementSchedule,
  getDataSourceSpecForSettlementData,
  getDataSourceSpecForTradingTermination,
  getSigners,
  MarginScalingFactorsPanel,
  marketInfoProvider,
  PriceMonitoringSettingsInfoPanel,
} from '@vegaprotocol/markets';
import {
  Button,
  CopyWithTooltip,
  Dialog,
  Icon,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import { create } from 'zustand';
import { useDataProvider } from '@vegaprotocol/data-provider';

type MarketDataDialogState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useMarketDataDialogStore = create<MarketDataDialogState>(
  (set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  })
);

const marketDataHeaderStyles =
  'font-alpha calt text-base border-b border-vega-dark-200 mt-2 py-2';

export const ProposalMarketData = ({ marketId }: { marketId: string }) => {
  const { t } = useTranslation();
  const { isOpen, open, close } = useMarketDataDialogStore();
  const [showDetails, setShowDetails] = useState(false);

  const { data: marketData } = useDataProvider({
    dataProvider: marketInfoProvider,
    skipUpdates: true,
    variables: {
      marketId: marketId,
    },
  });

  const { data: parentMarketData } = useDataProvider({
    dataProvider: marketInfoProvider,
    skipUpdates: true,
    skip: !marketData?.parentMarketID,
    variables: {
      marketId: marketData?.parentMarketID || '',
    },
  });

  if (!marketData) {
    return null;
  }

  const { product } = marketData.tradableInstrument.instrument;

  const settlementData = getDataSourceSpecForSettlementData(product);
  const settlementScheduleData =
    getDataSourceSpecForSettlementSchedule(product);
  const terminationData = getDataSourceSpecForTradingTermination(product);

  const parentProduct = parentMarketData?.tradableInstrument.instrument.product;
  const parentSettlementData =
    parentProduct && getDataSourceSpecForSettlementData(parentProduct);
  const parentSettlementScheduleData =
    parentProduct && getDataSourceSpecForSettlementSchedule(parentProduct);
  const parentTerminationData =
    parentProduct && getDataSourceSpecForTradingTermination(parentProduct);

  // TODO add settlementScheduleData for Perp Proposal

  const isParentSettlementDataEqual =
    parentSettlementData !== undefined &&
    isEqual(settlementData, parentSettlementData);

  const isParentSettlementScheduleDataEqual =
    parentSettlementData !== undefined &&
    isEqual(settlementScheduleData, parentSettlementScheduleData);

  const isParentTerminationDataEqual =
    parentTerminationData !== undefined &&
    isEqual(terminationData, parentTerminationData);

  const showParentPriceMonitoringBounds =
    parentMarketData?.priceMonitoringSettings?.parameters?.triggers !==
      undefined &&
    !isEqual(
      marketData.priceMonitoringSettings?.parameters?.triggers,
      parentMarketData?.priceMonitoringSettings?.parameters?.triggers
    );

  return (
    <section className="relative" data-testid="proposal-market-data">
      <CollapsibleToggle
        toggleState={showDetails}
        setToggleState={setShowDetails}
        dataTestId="proposal-market-data-toggle"
      >
        <SubHeading title={t('marketSpecification')} />
      </CollapsibleToggle>

      {showDetails && (
        <>
          <div className="float-right">
            <Button onClick={open} data-testid="view-market-json">
              {t('viewMarketJson')}
            </Button>
          </div>
          <div className="mb-10">
            <h2 className={marketDataHeaderStyles}>{t('Key details')}</h2>
            <KeyDetailsInfoPanel
              market={marketData}
              parentMarket={parentMarketData ? parentMarketData : undefined}
            />

            <h2 className={marketDataHeaderStyles}>{t('Instrument')}</h2>
            <InstrumentInfoPanel
              market={marketData}
              parentMarket={parentMarketData ? parentMarketData : undefined}
            />

            {settlementData &&
            terminationData &&
            isEqual(getSigners(settlementData), getSigners(terminationData)) ? (
              <>
                <h2 className={marketDataHeaderStyles}>{t('Oracle')}</h2>

                <OracleInfoPanel
                  market={marketData}
                  type="settlementData"
                  parentMarket={
                    isParentSettlementDataEqual ||
                    isParentSettlementScheduleDataEqual
                      ? undefined
                      : parentMarketData || undefined
                  }
                />
              </>
            ) : (
              <>
                <h2 className={marketDataHeaderStyles}>
                  {t('Settlement oracle')}
                </h2>
                <OracleInfoPanel
                  market={marketData}
                  type="settlementData"
                  parentMarket={
                    isParentSettlementDataEqual
                      ? undefined
                      : parentMarketData || undefined
                  }
                />

                {marketData.tradableInstrument.instrument.product.__typename ===
                  'Future' && (
                  <div>
                    <h2 className={marketDataHeaderStyles}>
                      {t('Termination oracle')}
                    </h2>
                    <OracleInfoPanel
                      market={marketData}
                      type="termination"
                      parentMarket={
                        isParentTerminationDataEqual
                          ? undefined
                          : parentMarketData || undefined
                      }
                    />
                  </div>
                )}

                {marketData.tradableInstrument.instrument.product.__typename ===
                  'Perpetual' && (
                  <div>
                    <h2 className={marketDataHeaderStyles}>
                      {t('Settlement schedule oracle')}
                    </h2>
                    <OracleInfoPanel
                      market={marketData}
                      type="settlementSchedule"
                      parentMarket={
                        isParentSettlementScheduleDataEqual
                          ? undefined
                          : parentMarketData || undefined
                      }
                    />
                  </div>
                )}
              </>
            )}

            {/*Note: successor markets will not differ in their settlement*/}
            {/*assets, so no need to pass in parent market data for comparison.*/}

            <h2 className={marketDataHeaderStyles}>{t('Settlement assets')}</h2>
            <SettlementAssetInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />

            <h2 className={marketDataHeaderStyles}>{t('Metadata')}</h2>
            <MetadataInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />

            <h2 className={marketDataHeaderStyles}>{t('Risk model')}</h2>
            <RiskModelInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />

            <h2 className={marketDataHeaderStyles}>
              {t('Margin scaling factors')}
            </h2>
            <MarginScalingFactorsPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />

            <h2 className={marketDataHeaderStyles}>{t('Risk factors')}</h2>
            <RiskFactorsInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />

            {showParentPriceMonitoringBounds && (
              // shows bounds for parent market
              <>
                <h2 className={marketDataHeaderStyles}>
                  {t('Parent price monitoring bounds')}
                </h2>
                <div className="text-vega-dark-300 line-through">
                  <PriceMonitoringBoundsInfoPanel market={parentMarketData} />
                </div>
              </>
            )}

            <h2 className={marketDataHeaderStyles}>
              {t('Price monitoring settings')}
            </h2>
            <PriceMonitoringSettingsInfoPanel market={marketData} />

            <h2 className={marketDataHeaderStyles}>
              {t('Liquidity monitoring parameters')}
            </h2>
            <LiquidityMonitoringParametersInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />
            <h2 className={marketDataHeaderStyles}>
              {t('Liquidity price range')}
            </h2>
            <LiquidityPriceRangeInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />

            <h2 className={marketDataHeaderStyles}>
              {t('Liquidity SLA protocol')}
            </h2>
            <LiquiditySLAParametersInfoPanel
              market={marketData}
              parentMarket={parentMarketData || undefined}
            />
          </div>
        </>
      )}

      <Dialog
        title={marketData.tradableInstrument.instrument.code}
        open={isOpen}
        onChange={(isOpen) => (isOpen ? open() : close())}
        size="large"
        dataTestId="market-json-dialog"
      >
        <CopyWithTooltip text={JSON.stringify(marketData)}>
          <button className="bg-vega-dark-100 rounded-sm py-2 px-3 mb-4 text-white">
            <span>
              <Icon name="duplicate" />
            </span>
            <span className="ml-2">Copy</span>
          </button>
        </CopyWithTooltip>
        <SyntaxHighlighter data={marketData} />
      </Dialog>
    </section>
  );
};
