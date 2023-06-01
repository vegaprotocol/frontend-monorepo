import { TokenStaticLinks, useEnvironment } from '@vegaprotocol/environment';
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
  TinyScroll,
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
        <TinyScroll className="h-full overflow-auto">
          <MarketInfoAccordion market={data} onSelect={onSelect} />
        </TinyScroll>
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

  const settlementData = market.tradableInstrument.instrument.product
    .dataSourceSpecForSettlementData.data as DataSourceDefinition;
  const terminationData = market.tradableInstrument.instrument.product
    .dataSourceSpecForTradingTermination.data as DataSourceDefinition;

  const getSigners = (data: DataSourceDefinition) => {
    if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
      const signers = data.sourceType.sourceType.signers || [];

      return signers.map(({ signer }, i) => {
        return (
          (signer.__typename === 'ETHAddress' && signer.address) ||
          (signer.__typename === 'PubKey' && signer.key)
        );
      });
    }
    return [];
  };

  const marketDataPanels = [
    {
      title: t('Current fees'),
      content: <CurrentFeesInfoPanel market={market} />,
    },
    {
      title: t('Market price'),
      content: <MarketPriceInfoPanel market={market} />,
    },
    {
      title: t('Market volume'),
      content: <MarketVolumeInfoPanel market={market} />,
    },
    ...marketAccounts
      .filter((a) => a.type === Schema.AccountType.ACCOUNT_TYPE_INSURANCE)
      .map((a) => ({
        title: t(`Insurance pool`),
        content: <InsurancePoolInfoPanel market={market} account={a} />,
      })),
  ];

  const oraclePanels = isEqual(
    getSigners(settlementData),
    getSigners(terminationData)
  )
    ? [
        {
          title: t('Oracle'),
          content: <OracleInfoPanel market={market} type="settlementData" />,
        },
      ]
    : [
        {
          title: t('Settlement Oracle'),
          content: <OracleInfoPanel market={market} type="settlementData" />,
        },
        {
          title: t('Termination Oracle'),
          content: <OracleInfoPanel market={market} type="termination" />,
        },
      ];
  const marketSpecPanels = [
    {
      title: t('Key details'),
      content: <KeyDetailsInfoPanel market={market} />,
    },
    {
      title: t('Instrument'),
      content: <InstrumentInfoPanel market={market} />,
    },
    ...oraclePanels,
    {
      title: t('Settlement asset'),
      content: <SettlementAssetInfoPanel market={market} />,
    },
    {
      title: t('Metadata'),
      content: <MetadataInfoPanel market={market} />,
    },
    {
      title: t('Risk model'),
      content: <RiskModelInfoPanel market={market} />,
    },
    {
      title: t('Risk parameters'),
      content: <RiskParametersInfoPanel market={market} />,
    },
    {
      title: t('Risk factors'),
      content: (
        <RiskFactorsInfoPanel market={{ riskFactors: market.riskFactors }} />
      ),
    },
    ...(market.priceMonitoringSettings?.parameters?.triggers || []).map(
      (_, triggerIndex) => ({
        title: t(`Price monitoring bounds ${triggerIndex + 1}`),
        content: (
          <PriceMonitoringBoundsInfoPanel
            market={market}
            triggerIndex={triggerIndex}
          />
        ),
      })
    ),
    {
      title: t('Liquidity monitoring parameters'),
      content: <LiquidityMonitoringParametersInfoPanel market={market} />,
    },
    {
      title: t('Liquidity'),
      content: (
        <LiquidityInfoPanel market={market}>
          <Link
            to={`/liquidity/${market.id}`}
            onClick={(ev) => onSelect?.(market.id, ev.metaKey || ev.ctrlKey)}
            data-testid="view-liquidity-link"
          >
            <UILink>{t('View liquidity provision table')}</UILink>
          </Link>
        </LiquidityInfoPanel>
      ),
    },
    {
      title: t('Liquidity price range'),
      content: <LiquidityPriceRangeInfoPanel market={market} />,
    },
  ];

  const marketGovPanels = [
    {
      title: t('Proposal'),
      content: (
        <div className="">
          {VEGA_TOKEN_URL && (
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
          )}
          {VEGA_TOKEN_URL && (
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
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-8">
        <h3 className={headerClassName}>{t('Market data')}</h3>
        <Accordion panels={marketDataPanels} />
      </div>
      <div className="mb-8">
        <MarketProposalNotification marketId={market.id} />
        <h3 className={headerClassName}>{t('Market specification')}</h3>
        <Accordion panels={marketSpecPanels} />
      </div>
      {VEGA_TOKEN_URL && marketGovPanels && market.proposal?.id && (
        <div>
          <h3 className={headerClassName}>{t('Market governance')}</h3>
          <Accordion panels={marketGovPanels} />
        </div>
      )}
    </div>
  );
};
