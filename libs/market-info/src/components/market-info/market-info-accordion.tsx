import { useEnvironment } from '@vegaprotocol/environment';
import { removePaginationWrapper, TokenLinks } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/react-helpers';
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

const MarketInfoAccordion = ({
  market,
  onSelect,
}: MarketInfoAccordionProps) => {
  const { VEGA_TOKEN_URL } = useEnvironment();
  const headerClassName = 'uppercase text-lg';

  if (!market) return null;

  const marketAccounts = removePaginationWrapper(
    market.accountsConnection?.edges
  );

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
  const product = market.tradableInstrument.instrument.product;

  const marketSpecPanels = [
    {
      title: t('Key details'),
      content: <KeyDetailsInfoPanel market={market} />,
    },
    {
      title: t('Instrument'),
      content: <InstrumentInfoPanel market={market} />,
    },
    product.dataSourceSpecForSettlementData && {
      title: t('Settlement Oracle'),
      content: <OracleInfoPanel market={market} type="settlementData" />,
    },
    product.dataSourceSpecForTradingTermination && {
      title: t('Termination Oracle'),
      content: <OracleInfoPanel market={market} type="termination" />,
    },
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
      content: <RiskFactorsInfoPanel market={market} />,
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
          <ExternalLink
            className="mb-2 w-full"
            href={generatePath(TokenLinks.PROPOSAL_PAGE, {
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
            href={generatePath(TokenLinks.UPDATE_PROPOSAL_PAGE, {
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
      {VEGA_TOKEN_URL && market.proposal?.id && (
        <div>
          <h3 className={headerClassName}>{t('Market governance')}</h3>
          <Accordion panels={marketGovPanels} />
        </div>
      )}
    </div>
  );
};
