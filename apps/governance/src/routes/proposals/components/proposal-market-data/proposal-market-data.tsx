import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InstrumentInfoPanel,
  KeyDetailsInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  LiquidityPriceRangeInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  PriceMonitoringBoundsInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  RiskParametersInfoPanel,
  SettlementAssetInfoPanel,
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
import type { MarketInfo } from '@vegaprotocol/markets';
import type { DataSourceDefinition } from '@vegaprotocol/types';
import { create } from 'zustand';

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

export const ProposalMarketData = ({
  marketData,
  parentMarketData,
}: {
  marketData: MarketInfo;
  parentMarketData?: MarketInfo;
}) => {
  const { t } = useTranslation();
  const { isOpen, open, close } = useMarketDataDialogStore();
  const [showDetails, setShowDetails] = useState(false);

  if (!marketData) {
    return null;
  }

  const settlementData = marketData.tradableInstrument.instrument.product
    .dataSourceSpecForSettlementData.data as DataSourceDefinition;
  const parentSettlementData =
    parentMarketData?.tradableInstrument.instrument?.product
      ?.dataSourceSpecForSettlementData?.data;
  const terminationData = marketData.tradableInstrument.instrument.product
    .dataSourceSpecForTradingTermination.data as DataSourceDefinition;
  const parentTerminationData =
    parentMarketData?.tradableInstrument.instrument?.product
      ?.dataSourceSpecForTradingTermination?.data;

  const isParentSettlementDataEqual =
    parentSettlementData !== undefined &&
    isEqual(settlementData, parentSettlementData);
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

  const getSigners = (data: DataSourceDefinition) => {
    if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
      const signers = data.sourceType.sourceType.signers || [];

      return signers.map(({ signer }) => {
        return (
          (signer.__typename === 'ETHAddress' && signer.address) ||
          (signer.__typename === 'PubKey' && signer.key)
        );
      });
    }
    return [];
  };

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
              parentMarket={parentMarketData}
            />

            <h2 className={marketDataHeaderStyles}>{t('Instrument')}</h2>
            <InstrumentInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            {isEqual(
              getSigners(settlementData),
              getSigners(terminationData)
            ) ? (
              <>
                <h2 className={marketDataHeaderStyles}>{t('Oracle')}</h2>

                <OracleInfoPanel
                  market={marketData}
                  type="settlementData"
                  parentMarket={
                    isParentSettlementDataEqual ? undefined : parentMarketData
                  }
                />
              </>
            ) : (
              <>
                <h2 className={marketDataHeaderStyles}>
                  {t('Settlement Oracle')}
                </h2>
                <OracleInfoPanel
                  market={marketData}
                  type="settlementData"
                  parentMarket={
                    isParentSettlementDataEqual ? undefined : parentMarketData
                  }
                />

                <h2 className={marketDataHeaderStyles}>
                  {t('Termination Oracle')}
                </h2>
                <OracleInfoPanel
                  market={marketData}
                  type="termination"
                  parentMarket={
                    isParentTerminationDataEqual ? undefined : parentMarketData
                  }
                />
              </>
            )}

            {/*Note: successor markets will not differ in their settlement*/}
            {/*assets, so no need to pass in parent market data for comparison.*/}

            <h2 className={marketDataHeaderStyles}>{t('Settlement assets')}</h2>
            <SettlementAssetInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            <h2 className={marketDataHeaderStyles}>{t('Metadata')}</h2>
            <MetadataInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            <h2 className={marketDataHeaderStyles}>{t('Risk model')}</h2>
            <RiskModelInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            <h2 className={marketDataHeaderStyles}>{t('Risk parameters')}</h2>
            <RiskParametersInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            <h2 className={marketDataHeaderStyles}>{t('Risk factors')}</h2>
            <RiskFactorsInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            {showParentPriceMonitoringBounds &&
              (
                parentMarketData?.priceMonitoringSettings?.parameters
                  ?.triggers || []
              ).map((_, triggerIndex) => (
                <>
                  <h2 className={marketDataHeaderStyles}>
                    {t(`Parent price monitoring bounds ${triggerIndex + 1}`)}
                  </h2>

                  <div className="text-vega-dark-300 line-through">
                    <PriceMonitoringBoundsInfoPanel
                      market={parentMarketData}
                      triggerIndex={triggerIndex}
                    />
                  </div>
                </>
              ))}

            {(
              marketData.priceMonitoringSettings?.parameters?.triggers || []
            ).map((_, triggerIndex) => (
              <>
                <h2 className={marketDataHeaderStyles}>
                  {t(`Price monitoring bounds ${triggerIndex + 1}`)}
                </h2>

                <PriceMonitoringBoundsInfoPanel
                  market={marketData}
                  triggerIndex={triggerIndex}
                />
              </>
            ))}

            <h2 className={marketDataHeaderStyles}>
              {t('Liquidity monitoring parameters')}
            </h2>
            <LiquidityMonitoringParametersInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
            />

            <h2 className={marketDataHeaderStyles}>
              {t('Liquidity price range')}
            </h2>
            <LiquidityPriceRangeInfoPanel
              market={marketData}
              parentMarket={parentMarketData}
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
