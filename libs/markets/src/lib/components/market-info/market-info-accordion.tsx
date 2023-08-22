import {
  FLAGS,
  TokenStaticLinks,
  useEnvironment,
} from '@vegaprotocol/environment';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import {
  Accordion,
  AsyncRenderer,
  ExternalLink,
  Link as UILink,
  Splash,
  AccordionItem,
} from '@vegaprotocol/ui-toolkit';
import { generatePath, Link } from 'react-router-dom';

import { marketInfoProvider } from './market-info-data-provider';

import type { MarketInfo } from './market-info-data-provider';
import { MarketProposalNotification } from '@vegaprotocol/proposals';
import {
  CurrentFeesInfoPanel,
  InstrumentInfoPanel,
  InsurancePoolInfoPanel,
  KeyDetailsInfoPanel,
  LiquidityInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  LiquidityPriceRangeInfoPanel,
  MarketPriceInfoPanel,
  MarketVolumeInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  PriceMonitoringBoundsInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  RiskParametersInfoPanel,
  SettlementAssetInfoPanel,
  SuccessionLineInfoPanel,
} from './market-info-panels';
import type { DataSourceDefinition } from '@vegaprotocol/types';
import isEqual from 'lodash/isEqual';

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
  const { VEGA_TOKEN_URL } = useEnvironment();
  const headerClassName = 'uppercase text-lg';

  if (!market) return null;

  const marketAccounts = removePaginationWrapper(
    market.accountsConnection?.edges
  );

  const settlementData =
    'dataSourceSpecForSettlementData' in
    market.tradableInstrument.instrument.product
      ? (market.tradableInstrument.instrument.product
          .dataSourceSpecForSettlementData.data as DataSourceDefinition)
      : undefined;
  const terminationData =
    'dataSourceSpecForTradingTermination' in
    market.tradableInstrument.instrument.product
      ? (market.tradableInstrument.instrument.product
          .dataSourceSpecForTradingTermination.data as DataSourceDefinition)
      : undefined;
  const settlementScheduleData =
    'dataSourceSpecForSettlementSchedule' in
    market.tradableInstrument.instrument.product
      ? (market.tradableInstrument.instrument.product
          .dataSourceSpecForSettlementSchedule.data as DataSourceDefinition)
      : undefined;

  const getSigners = (data: DataSourceDefinition) => {
    if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
      const signers =
        ('signers' in data.sourceType.sourceType &&
          data.sourceType.sourceType.signers) ||
        [];

      return signers.map(({ signer }, i) => {
        return (
          (signer.__typename === 'ETHAddress' && signer.address) ||
          (signer.__typename === 'PubKey' && signer.key)
        );
      });
    }
    return [];
  };

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
          {settlementData &&
          terminationData &&
          isEqual(getSigners(settlementData), getSigners(terminationData)) ? (
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
                title={t('Settlement Oracle')}
                content={
                  <OracleInfoPanel market={market} type="settlementData" />
                }
              />
              <AccordionItem
                itemId="termination-oracle"
                title={t('Termination Oracle')}
                content={<OracleInfoPanel market={market} type="termination" />}
              />
            </>
          )}
          {settlementData &&
          settlementScheduleData &&
          isEqual(
            getSigners(settlementData),
            getSigners(settlementScheduleData)
          ) ? (
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
                title={t('Settlement Oracle')}
                content={
                  <OracleInfoPanel market={market} type="settlementData" />
                }
              />
              <AccordionItem
                itemId="settlement-schedule-oracle"
                title={t('Settlement Schedule Oracle')}
                content={
                  <OracleInfoPanel market={market} type="settlementSchedule" />
                }
              />
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
            itemId="risk-parameters"
            title={t('Risk parameters')}
            content={<RiskParametersInfoPanel market={market} />}
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
                  title={t(`Price monitoring bounds ${triggerIndex + 1}`)}
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
          <AccordionItem
            itemId="liquidity-price-range"
            title={t('Liquidity price range')}
            content={<LiquidityPriceRangeInfoPanel market={market} />}
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
