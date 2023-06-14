import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { create } from 'zustand';
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
import { collapsibleToggleStyles } from '../../../../lib/collapsible-toggle-styles';
import type { MarketInfoWithData } from '@vegaprotocol/markets';
import type { DataSourceDefinition } from '@vegaprotocol/types';

type MarketDataDialogState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const useMarketDataDialogStore = create<MarketDataDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const ProposalMarketData = ({
  marketData,
}: {
  marketData: MarketInfoWithData;
}) => {
  const { t } = useTranslation();
  const { isOpen, open, close } = useMarketDataDialogStore();
  const [showDetails, setShowDetails] = useState(false);

  if (!marketData) {
    return null;
  }

  const settlementData = marketData.tradableInstrument.instrument.product
    .dataSourceSpecForSettlementData.data as DataSourceDefinition;
  const terminationData = marketData.tradableInstrument.instrument.product
    .dataSourceSpecForTradingTermination.data as DataSourceDefinition;

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
      <button
        onClick={() => setShowDetails(!showDetails)}
        data-testid="proposal-market-data-toggle"
      >
        <div className="flex items-center gap-3">
          <SubHeading title={t('marketSpecification')} />
          <div className={collapsibleToggleStyles(showDetails)}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {showDetails && (
        <>
          <div className="float-right">
            <Button onClick={open}>{t('viewMarketJson')}</Button>
          </div>
          <div className="mb-10">
            <Accordion>
              <AccordionItem
                itemId="key-details"
                title={t('Key details')}
                content={<KeyDetailsInfoPanel market={marketData} />}
              />
              <AccordionItem
                itemId="instrument"
                title={t('Instrument')}
                content={<InstrumentInfoPanel market={marketData} />}
              />
              {isEqual(
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
                      />
                    }
                  />

                  <AccordionItem
                    itemId="termination-oracle"
                    title={t('Termination Oracle')}
                    content={
                      <OracleInfoPanel market={marketData} type="termination" />
                    }
                  />
                </>
              )}
              <AccordionItem
                itemId="settlement-asset"
                title={t('Settlement asset')}
                content={<SettlementAssetInfoPanel market={marketData} />}
              />
              <AccordionItem
                itemId="metadata"
                title={t('Metadata')}
                content={<MetadataInfoPanel market={marketData} />}
              />
              <AccordionItem
                itemId="risk-model"
                title={t('Risk model')}
                content={<RiskModelInfoPanel market={marketData} />}
              />
              <AccordionItem
                itemId="risk-parameters"
                title={t('Risk parameters')}
                content={<RiskParametersInfoPanel market={marketData} />}
              />
              <AccordionItem
                itemId="risk-factors"
                title={t('Risk factors')}
                content={<RiskFactorsInfoPanel market={marketData} />}
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
                      triggerIndex={triggerIndex}
                    />
                  }
                />
              ))}
              <AccordionItem
                itemId="liqudity-monitoring-parameters"
                title={t('Liquidity monitoring parameters')}
                content={
                  <LiquidityMonitoringParametersInfoPanel market={marketData} />
                }
              />
              <AccordionItem
                itemId="liquidity-price-range"
                title={t('Liquidity price range')}
                content={<LiquidityPriceRangeInfoPanel market={marketData} />}
              />
            </Accordion>
          </div>
        </>
      )}

      <Dialog
        title={marketData.tradableInstrument.instrument.code}
        open={isOpen}
        onChange={(isOpen) => (isOpen ? open() : close())}
        size="medium"
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
