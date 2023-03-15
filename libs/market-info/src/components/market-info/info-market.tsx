import { useEnvironment } from '@vegaprotocol/environment';
import { removePaginationWrapper, TokenLinks } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider, useYesterday } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  Accordion,
  AsyncRenderer,
  ExternalLink,
  Link as UILink,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { generatePath, Link } from 'react-router-dom';

import { marketInfoWithDataAndCandlesProvider } from './market-info-data-provider';

import type { MarketInfoWithDataAndCandles } from './market-info-data-provider';
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

export interface InfoProps {
  market: MarketInfoWithDataAndCandles;
  onSelect: (id: string) => void;
}

export interface MarketInfoContainerProps {
  marketId: string;
  onSelect?: (id: string) => void;
}
export const MarketInfoContainer = ({
  marketId,
  onSelect,
}: MarketInfoContainerProps) => {
  const yesterday = useYesterday();
  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);
  const variables = useMemo(
    () => ({
      marketId,
      since: yTimestamp,
      interval: Schema.Interval.INTERVAL_I1H,
    }),
    [marketId, yTimestamp]
  );

  const { data, loading, error, reload } = useDataProvider({
    dataProvider: marketInfoWithDataAndCandlesProvider,
    skipUpdates: true,
    variables,
  });

  return (
    <AsyncRenderer data={data} loading={loading} error={error} reload={reload}>
      {data ? (
        <Info market={data} onSelect={(id) => onSelect?.(id)} />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};

export const Info = ({ market, onSelect }: InfoProps) => {
  const { VEGA_TOKEN_URL, VEGA_EXPLORER_URL } = useEnvironment();
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

  const marketSpecPanels = [
    {
      title: t('Key details'),
      content: <KeyDetailsInfoPanel market={market} />,
    },
    {
      title: t('Instrument'),
      content: <InstrumentInfoPanel market={market} />,
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
            onClick={() => onSelect(market.id)}
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
    {
      title: t('Oracle'),
      content: (
        <OracleInfoPanel market={market}>
          <ExternalLink
            href={`${VEGA_EXPLORER_URL}/oracles#${market.tradableInstrument.instrument.product.dataSourceSpecForSettlementData.id}`}
          >
            {t('View settlement data oracle specification')}
          </ExternalLink>
          <ExternalLink
            href={`${VEGA_EXPLORER_URL}/oracles#${market.tradableInstrument.instrument.product.dataSourceSpecForTradingTermination.id}`}
          >
            {t('View termination oracle specification')}
          </ExternalLink>
        </OracleInfoPanel>
      ),
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
        <p className={headerClassName}>{t('Market data')}</p>
        <Accordion panels={marketDataPanels} />
      </div>
      <div className="mb-8">
        <MarketProposalNotification marketId={market.id} />
        <p className={headerClassName}>{t('Market specification')}</p>
        <Accordion panels={marketSpecPanels} />
      </div>
      {VEGA_TOKEN_URL && market.proposal?.id && (
        <div>
          <p className={headerClassName}>{t('Market governance')}</p>
          <Accordion panels={marketGovPanels} />
        </div>
      )}
    </div>
  );
};
