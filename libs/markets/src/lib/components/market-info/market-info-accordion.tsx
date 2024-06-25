import {
  useFeatureFlags,
  TokenStaticLinks,
  useEnvironment,
} from '@vegaprotocol/environment';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import {
  Accordion,
  AsyncRenderer,
  ExternalLink,
  Link as UILink,
  Splash,
  AccordionItem,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { generatePath, Link } from 'react-router-dom';

import { marketInfoProvider } from './market-info-data-provider';

import type { MarketInfo } from './market-info-data-provider';
import {
  BaseAssetInfoPanel,
  CurrentFeesInfoPanel,
  FundingInfoPanel,
  InstrumentInfoPanel,
  InsurancePoolInfoPanel,
  KeyDetailsInfoPanel,
  LiquidationStrategyInfoPanel,
  LiquidityFeesSettings,
  LiquidityInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  LiquidityPriceRangeInfoPanel,
  LiquiditySLAParametersInfoPanel,
  MarginScalingFactorsPanel,
  MarketPriceInfoPanel,
  MarketVolumeInfoPanel,
  MetadataInfoPanel,
  PriceConfigurationPanel,
  PriceMonitoringBoundsInfoPanel,
  QuoteAssetInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  SettlementAssetInfoPanel,
  SuccessionLineInfoPanel,
  TerminationAndSettlementPanel,
} from './market-info-panels';
import {
  getDataSourceSpecForSettlementSchedule,
  isPerpetual,
  isFuture,
  isSpot,
} from '../../product';
import { useT } from '../../use-t';

export interface MarketInfoAccordionProps {
  market: MarketInfo;
  onSelect?: (id: string, metaKey?: boolean) => void;
}

export interface MarketInfoContainerProps {
  marketId: string;
  onSelect?: (id: string, metaKey?: boolean) => void;
}
export const MarketInfoAccordionContainer = ({
  marketId,
  onSelect,
}: MarketInfoContainerProps) => {
  const t = useT();
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: marketInfoProvider,
    skipUpdates: true,
    variables: { marketId },
  });

  return (
    <AsyncRenderer data={data} loading={loading} error={error} reload={reload}>
      {data ? (
        <MarketInfoAccordion market={data} onSelect={onSelect} />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};

export const MarketInfoAccordion = ({
  market,
  onSelect,
}: MarketInfoAccordionProps) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const t = useT();
  const { VEGA_TOKEN_URL } = useEnvironment();
  const headerClassName = 'uppercase text-lg';

  if (!market) return null;

  const marketAccounts = removePaginationWrapper(
    market.accountsConnection?.edges
  );

  const { product } = market.tradableInstrument.instrument;
  const settlementScheduleDataSource =
    getDataSourceSpecForSettlementSchedule(product);

  return (
    <div data-testid="market-info-accordion">
      <div className="mb-8">
        <h3 className={headerClassName}>{t('Market data')}</h3>
        <Accordion>
          <AccordionItem
            itemId="current-fees"
            title={t('Current fees')}
            content={<CurrentFeesInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="market-price"
            title={t('Market price')}
            content={<MarketPriceInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="market-volume"
            title={t('Market volume')}
            content={<MarketVolumeInfoPanel market={market} />}
          />
          {marketAccounts
            .filter((a) => a.type === Schema.AccountType.ACCOUNT_TYPE_INSURANCE)
            .map((a) => {
              const id = `${a.type}:${a.asset.id}`;
              return (
                <AccordionItem
                  key={id}
                  itemId={id}
                  title={t('Liquidations')}
                  content={
                    <InsurancePoolInfoPanel market={market} account={a} />
                  }
                />
              );
            })}
        </Accordion>
      </div>
      <div className="mb-8">
        <h3 className={headerClassName}>{t('Market specification')}</h3>
        <Accordion>
          <AccordionItem
            itemId="key-details"
            title={t('Key details')}
            content={<KeyDetailsInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="instrument"
            title={t('Instrument')}
            content={<InstrumentInfoPanel market={market} />}
          />
          {!isSpot(product) && (
            <AccordionItem
              itemId="mark-price"
              title={t('Mark price')}
              content={
                <PriceConfigurationPanel
                  market={market}
                  priceConfiguration={market.markPriceConfiguration}
                />
              }
            />
          )}
          {!isSpot(product) && settlementScheduleDataSource && (
            <AccordionItem
              itemId="funding"
              title={t('Funding')}
              content={
                <FundingInfoPanel
                  dataSource={settlementScheduleDataSource}
                  market={market}
                />
              }
            />
          )}
          {isPerpetual(product) && product.internalCompositePriceConfig && (
            <AccordionItem
              itemId="internal-composite-price"
              title={t('Internal composite price')}
              content={
                <PriceConfigurationPanel
                  market={market}
                  priceConfiguration={product.internalCompositePriceConfig}
                />
              }
            />
          )}
          {isFuture(product) && (
            <AccordionItem
              itemId="termination-and-settlement"
              title={t('Termination & Settlement')}
              content={<TerminationAndSettlementPanel market={market} />}
            />
          )}
          {!isSpot(product) && (
            <AccordionItem
              itemId="settlement-asset"
              title={t('Settlement asset')}
              content={<SettlementAssetInfoPanel market={market} />}
            />
          )}
          {isSpot(product) && (
            <>
              <AccordionItem
                itemId="base-asset"
                title={t('Base asset')}
                content={<BaseAssetInfoPanel market={market} />}
              />
              <AccordionItem
                itemId="quote-asset"
                title={t('Quote asset')}
                content={<QuoteAssetInfoPanel market={market} />}
              />
            </>
          )}
          <AccordionItem
            itemId="metadata"
            title={t('Metadata')}
            content={<MetadataInfoPanel market={market} />}
          />
          {!isSpot(product) && (
            <>
              <AccordionItem
                itemId="risk-model"
                title={t('Risk model')}
                content={<RiskModelInfoPanel market={market} />}
              />
              <AccordionItem
                itemId="margin-scaling-factors"
                title={t('Margin scaling factors')}
                content={<MarginScalingFactorsPanel market={market} />}
              />
              <AccordionItem
                itemId="risk-factors"
                title={t('Risk factors')}
                content={<RiskFactorsInfoPanel market={market} />}
              />
            </>
          )}
          <AccordionItem
            itemId="trigger"
            title={t('Price monitoring bounds')}
            content={<PriceMonitoringBoundsInfoPanel market={market} />}
          />
          {!isSpot(product) && (
            <AccordionItem
              itemId="liquidation-strategy"
              title={t('Liquidation strategy')}
              content={<LiquidationStrategyInfoPanel market={market} />}
            />
          )}
          <AccordionItem
            itemId="liquidity-monitoring-parameters"
            title={t('Liquidity monitoring parameters')}
            content={<LiquidityMonitoringParametersInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="liquidity-price-range"
            title={t('Liquidity price range')}
            content={<LiquidityPriceRangeInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="liquidity-sla-parameters"
            title={
              <span>
                <Tooltip
                  description={t(
                    'SLA protocol = a part of the Vega protocol that creates similar incentives within the decentralised system to those achieved by a Service Level Agreement between parties in traditional finance. The SLA protocol involves no discussion, agreement, or contracts between parties but instead relies upon rules and an economic mechanism implemented in code running on the network'
                  )}
                >
                  <span>{t('Liquidity SLA protocol')}</span>
                </Tooltip>
              </span>
            }
            content={<LiquiditySLAParametersInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="lp-fee-settings"
            title={t('Liquidity fee settings')}
            content={<LiquidityFeesSettings market={market} />}
          />
          <AccordionItem
            itemId="liquidity"
            title={t('Liquidity')}
            content={
              <LiquidityInfoPanel market={market}>
                <div className="mt-2">
                  <Link
                    to={`/liquidity/${market.id}`}
                    onClick={(ev) =>
                      onSelect?.(market.id, ev.metaKey || ev.ctrlKey)
                    }
                    data-testid="view-liquidity-link"
                  >
                    <UILink>{t('View liquidity provision table')}</UILink>
                  </Link>
                </div>
              </LiquidityInfoPanel>
            }
          />
        </Accordion>
      </div>
      {VEGA_TOKEN_URL &&
        market.marketProposal?.__typename === 'Proposal' &&
        market.marketProposal.id && (
          <div>
            <h3 className={headerClassName}>{t('Market governance')}</h3>

            <Accordion>
              <AccordionItem
                itemId="proposal"
                title={t('Proposal')}
                content={
                  <>
                    <ExternalLink
                      className="mb-2 w-full"
                      href={generatePath(TokenStaticLinks.PROPOSAL_PAGE, {
                        tokenUrl: VEGA_TOKEN_URL,
                        proposalId: market.marketProposal.id,
                      })}
                      title={
                        market.marketProposal.rationale.title ||
                        market.marketProposal.rationale.description ||
                        ''
                      }
                    >
                      {t('View governance proposal')}
                    </ExternalLink>
                    <ExternalLink
                      className="w-full"
                      href={generatePath(
                        TokenStaticLinks.UPDATE_PROPOSAL_PAGE,
                        {
                          tokenUrl: VEGA_TOKEN_URL,
                        }
                      )}
                      title={
                        market.marketProposal.rationale.title ||
                        market.marketProposal.rationale.description ||
                        ''
                      }
                    >
                      {t('Propose a change to market')}
                    </ExternalLink>
                  </>
                }
              />
              {featureFlags.SUCCESSOR_MARKETS && !isSpot(product) && (
                <AccordionItem
                  itemId="succession-line"
                  title={t('Succession line')}
                  content={<SuccessionLineInfoPanel market={market} />}
                />
              )}
            </Accordion>
          </div>
        )}
    </div>
  );
};
