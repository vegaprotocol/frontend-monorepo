import {
  FLAGS,
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
import { MarketProposalNotification } from '@vegaprotocol/proposals';
import {
  CurrentFeesInfoPanel,
  FundingInfoPanel,
  InstrumentInfoPanel,
  InsurancePoolInfoPanel,
  KeyDetailsInfoPanel,
  LiquidityInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  LiquidityPriceRangeInfoPanel,
  LiquiditySLAParametersInfoPanel,
  MarginScalingFactorsPanel,
  MarketPriceInfoPanel,
  MarketVolumeInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  PriceMonitoringBoundsInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  SettlementAssetInfoPanel,
  SuccessionLineInfoPanel,
} from './market-info-panels';
import isEqual from 'lodash/isEqual';
import {
  getDataSourceSpecForSettlementSchedule,
  getDataSourceSpecForSettlementData,
  getDataSourceSpecForTradingTermination,
  isPerpetual,
  isFuture,
  getSigners,
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
  const t = useT();
  const { VEGA_TOKEN_URL } = useEnvironment();
  const headerClassName = 'uppercase text-lg';

  if (!market) return null;

  const marketAccounts = removePaginationWrapper(
    market.accountsConnection?.edges
  );

  const { product } = market.tradableInstrument.instrument;
  const settlementDataSource = getDataSourceSpecForSettlementData(product);
  const terminationDataSource = getDataSourceSpecForTradingTermination(product);
  const settlementScheduleDataSource =
    getDataSourceSpecForSettlementSchedule(product);

  const showOneOracleSection =
    (isFuture(product) &&
      settlementDataSource &&
      terminationDataSource &&
      isEqual(
        getSigners(settlementDataSource),
        getSigners(terminationDataSource)
      )) ||
    (isPerpetual(product) &&
      settlementDataSource &&
      settlementScheduleDataSource &&
      isEqual(
        getSigners(settlementDataSource),
        getSigners(settlementScheduleDataSource)
      ));

  return (
    <div>
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
                  title={t('Insurance pool')}
                  content={
                    <InsurancePoolInfoPanel market={market} account={a} />
                  }
                />
              );
            })}
        </Accordion>
      </div>
      <div className="mb-8">
        <MarketProposalNotification marketId={market.id} />
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
          {settlementScheduleDataSource && (
            <AccordionItem
              itemId="funding"
              title={t('Funding')}
              content={
                <FundingInfoPanel dataSource={settlementScheduleDataSource} />
              }
            />
          )}
          {showOneOracleSection ? (
            <AccordionItem
              itemId="oracles"
              title={t('Oracle')}
              content={
                <OracleInfoPanel market={market} type="settlementData" />
              }
            />
          ) : (
            <>
              <AccordionItem
                itemId="settlement-oracle"
                title={t('Settlement oracle')}
                content={
                  <OracleInfoPanel market={market} type="settlementData" />
                }
              />
              {isPerpetual(product) && (
                <AccordionItem
                  itemId="settlement-schedule-oracle"
                  title={t('Settlement schedule oracle')}
                  content={
                    <OracleInfoPanel
                      market={market}
                      type="settlementSchedule"
                    />
                  }
                />
              )}
              {isFuture(product) && (
                <AccordionItem
                  itemId="termination-oracle"
                  title={t('Termination oracle')}
                  content={
                    <OracleInfoPanel market={market} type="termination" />
                  }
                />
              )}
            </>
          )}
          <AccordionItem
            itemId="settlement-asset"
            title={t('Settlement asset')}
            content={<SettlementAssetInfoPanel market={market} />}
          />
          <AccordionItem
            itemId="metadata"
            title={t('Metadata')}
            content={<MetadataInfoPanel market={market} />}
          />
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
          {(market.priceMonitoringSettings?.parameters?.triggers || []).map(
            (_, triggerIndex) => {
              const id = `trigger-${triggerIndex}`;
              return (
                <AccordionItem
                  key={id}
                  itemId={id}
                  title={t('Price monitoring bounds {{index}}', {
                    index: triggerIndex + 1,
                  })}
                  content={
                    <PriceMonitoringBoundsInfoPanel
                      market={market}
                      triggerIndex={triggerIndex}
                    />
                  }
                />
              );
            }
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
      {VEGA_TOKEN_URL && market.proposal?.id && (
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
                      proposalId: market.proposal?.id || '',
                    })}
                    title={
                      market.proposal?.rationale.title ||
                      market.proposal?.rationale.description ||
                      ''
                    }
                  >
                    {t('View governance proposal')}
                  </ExternalLink>
                  <ExternalLink
                    className="w-full"
                    href={generatePath(TokenStaticLinks.UPDATE_PROPOSAL_PAGE, {
                      tokenUrl: VEGA_TOKEN_URL,
                    })}
                    title={
                      market.proposal?.rationale.title ||
                      market.proposal?.rationale.description ||
                      ''
                    }
                  >
                    {t('Propose a change to market')}
                  </ExternalLink>
                </>
              }
            />
            {FLAGS.SUCCESSOR_MARKETS && (
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
