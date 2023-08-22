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
  Accordion,
  AccordionItem,
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

  const settlementData =
    'dataSourceSpecForSettlementData' in
      marketData.tradableInstrument.instrument.product &&
    (marketData.tradableInstrument.instrument.product
      .dataSourceSpecForSettlementData.data as DataSourceDefinition);
  const parentSettlementData =
    parentMarketData &&
    'dataSourceSpecForSettlementData' in
      parentMarketData.tradableInstrument.instrument.product &&
    parentMarketData?.tradableInstrument.instrument?.product
      ?.dataSourceSpecForSettlementData?.data;

  const terminationData =
    'dataSourceSpecForTradingTermination' in
      marketData.tradableInstrument.instrument.product &&
    (marketData.tradableInstrument.instrument.product
      .dataSourceSpecForTradingTermination.data as DataSourceDefinition);
  const parentTerminationData =
    parentMarketData &&
    'dataSourceSpecForTradingTermination' in
      parentMarketData.tradableInstrument.instrument.product &&
    parentMarketData?.tradableInstrument.instrument?.product
      ?.dataSourceSpecForTradingTermination?.data;

  // TODO add settlementScheduleData for Perp Proposal

  const isParentSettlementDataEqual =
    parentSettlementData !== undefined &&
    isEqual(settlementData, parentSettlementData);

  const isParentTerminationDataEqual =
    parentTerminationData !== undefined &&
    isEqual(terminationData, parentTerminationData);

  const getSigners = (data: DataSourceDefinition) => {
    if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
      const signers =
        ('signers' in data.sourceType.sourceType &&
          data.sourceType.sourceType.signers) ||
        [];

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
            <Accordion>
              <AccordionItem
                itemId="key-details"
                title={t('Key details')}
                content={
                  <KeyDetailsInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              <AccordionItem
                itemId="instrument"
                title={t('Instrument')}
                content={
                  <InstrumentInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              {settlementData &&
              terminationData &&
              isEqual(
                getSigners(settlementData),
                getSigners(terminationData)
              ) ? (
                <AccordionItem
                  itemId="oracles"
                  title={t('Oracle')}
                  content={
                    <OracleInfoPanel
                      market={marketData}
                      type="settlementData"
                      parentMarket={
                        isParentSettlementDataEqual
                          ? undefined
                          : parentMarketData
                      }
                    />
                  }
                />
              ) : (
                <>
                  <AccordionItem
                    itemId="settlement-oracle"
                    title={t('Settlement Oracle')}
                    content={
                      <OracleInfoPanel
                        market={marketData}
                        type="settlementData"
                        parentMarket={
                          isParentSettlementDataEqual
                            ? undefined
                            : parentMarketData
                        }
                      />
                    }
                  />

                  <AccordionItem
                    itemId="termination-oracle"
                    title={t('Termination Oracle')}
                    content={
                      <OracleInfoPanel
                        market={marketData}
                        type="termination"
                        parentMarket={
                          isParentTerminationDataEqual
                            ? undefined
                            : parentMarketData
                        }
                      />
                    }
                  />
                </>
              )}
              {/*Note: successor markets will not differ in their settlement*/}
              {/*assets, so no need to pass in parent market data for comparison.*/}
              <AccordionItem
                itemId="settlement-asset"
                title={t('Settlement asset')}
                content={<SettlementAssetInfoPanel market={marketData} />}
              />
              <AccordionItem
                itemId="metadata"
                title={t('Metadata')}
                content={
                  <MetadataInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              <AccordionItem
                itemId="risk-model"
                title={t('Risk model')}
                content={
                  <RiskModelInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              <AccordionItem
                itemId="risk-parameters"
                title={t('Risk parameters')}
                content={
                  <RiskParametersInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              <AccordionItem
                itemId="risk-factors"
                title={t('Risk factors')}
                content={
                  <RiskFactorsInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              {(
                marketData.priceMonitoringSettings?.parameters?.triggers || []
              ).map((_, triggerIndex) => (
                <AccordionItem
                  itemId={`trigger-${triggerIndex}`}
                  title={t(`Price monitoring bounds ${triggerIndex + 1}`)}
                  content={
                    <PriceMonitoringBoundsInfoPanel
                      market={marketData}
                      parentMarket={parentMarketData}
                      triggerIndex={triggerIndex}
                    />
                  }
                />
              ))}
              <AccordionItem
                itemId="liquidity-monitoring-parameters"
                title={t('Liquidity monitoring parameters')}
                content={
                  <LiquidityMonitoringParametersInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
              <AccordionItem
                itemId="liquidity-price-range"
                title={t('Liquidity price range')}
                content={
                  <LiquidityPriceRangeInfoPanel
                    market={marketData}
                    parentMarket={parentMarketData}
                  />
                }
              />
            </Accordion>
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
