import {
  matchFilter,
  lpAggregatedDataProvider,
  useCheckLiquidityStatus,
} from '@vegaprotocol/liquidity';
import { tooltipMapping } from '@vegaprotocol/markets';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { Tab, Tabs, Indicator, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { memo, useEffect, useState } from 'react';

import { Header, HeaderStat, HeaderTitle } from '../../components/header';

import { useParams } from 'react-router-dom';

import { useMarket, useStaticMarketData } from '@vegaprotocol/markets';
import { DocsLinks } from '@vegaprotocol/environment';
import { LiquidityContainer } from '../../components/liquidity-container';

const enum LiquidityTabs {
  Active = 'active',
  Inactive = 'inactive',
  MyLiquidityProvision = 'myLP',
}

export const Liquidity = () => {
  const params = useParams();
  const marketId = params.marketId;
  return <LiquidityViewContainer marketId={marketId} />;
};

const LiquidityViewHeader = memo(({ marketId }: { marketId?: string }) => {
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId);
  const targetStake = marketData?.targetStake;
  const suppliedStake = marketData?.suppliedStake;
  const assetDecimalPlaces =
    market?.tradableInstrument.instrument.product.settlementAsset.decimals || 0;
  const symbol =
    market?.tradableInstrument.instrument.product.settlementAsset.symbol;

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);
  const triggeringRatio =
    params.market_liquidity_targetstake_triggering_ratio || '1';

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: suppliedStake || 0,
    targetStake: targetStake || 0,
    triggeringRatio,
  });

  return (
    <Header
      title={
        market?.tradableInstrument.instrument.name &&
        market?.tradableInstrument.instrument.code &&
        marketId && (
          <HeaderTitle>
            {market.tradableInstrument.instrument.code &&
              t('Liquidity provision')}
          </HeaderTitle>
        )
      }
    >
      <HeaderStat
        heading={t('Target stake')}
        description={tooltipMapping['targetStake']}
        testId="target-stake"
      >
        <div>
          {targetStake
            ? `${addDecimalsFormatNumber(
                targetStake,
                assetDecimalPlaces ?? 0
              )} ${symbol}`
            : '-'}
        </div>
      </HeaderStat>
      <HeaderStat
        heading={t('Supplied stake')}
        description={tooltipMapping['suppliedStake']}
        testId="supplied-stake"
      >
        <div>
          {suppliedStake
            ? `${addDecimalsFormatNumber(
                suppliedStake,
                assetDecimalPlaces ?? 0
              )} ${symbol}`
            : '-'}
        </div>
      </HeaderStat>
      <HeaderStat heading={t('Liquidity supplied')} testId="liquidity-supplied">
        <Indicator variant={status} /> {formatNumberPercentage(percentage, 2)}
      </HeaderStat>
      <HeaderStat heading={t('Market ID')} testId="liquidity-market-id">
        <div className="break-word">{marketId}</div>
      </HeaderStat>
      <HeaderStat heading={t('Learn more')} testId="liquidity-learn-more">
        {DocsLinks ? (
          <ExternalLink href={DocsLinks.LIQUIDITY}>
            {t('Providing liquidity')}
          </ExternalLink>
        ) : (
          (null as React.ReactNode)
        )}
      </HeaderStat>
    </Header>
  );
});
LiquidityViewHeader.displayName = 'LiquidityViewHeader';

export const LiquidityViewContainer = ({
  marketId,
}: {
  marketId: string | undefined;
}) => {
  const [tab, setTab] = useState<string | undefined>(undefined);
  const { pubKey } = useVegaWallet();

  const { data } = useDataProvider({
    dataProvider: lpAggregatedDataProvider,
    skipUpdates: true,
    variables: { marketId: marketId || '' },
    skip: !marketId,
  });

  useEffect(() => {
    if (data) {
      if (pubKey && data.some((lp) => matchFilter({ partyId: pubKey }, lp))) {
        setTab(LiquidityTabs.MyLiquidityProvision);
        return;
      }
      if (data.some((lp) => matchFilter({ active: true }, lp))) {
        setTab(LiquidityTabs.Active);
        return;
      }
      setTab(LiquidityTabs.Inactive);
    }
  }, [data, pubKey]);

  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      <LiquidityViewHeader marketId={marketId} />
      <div className="p-1">
        <div className="h-full border border-default">
          <Tabs value={tab || LiquidityTabs.Active} onValueChange={setTab}>
            <Tab
              id={LiquidityTabs.MyLiquidityProvision}
              name={t('My liquidity provision')}
              hidden={!pubKey}
            >
              <LiquidityContainer
                marketId={marketId}
                filter={{ partyId: pubKey || undefined }}
              />
            </Tab>
            <Tab id={LiquidityTabs.Active} name={t('Active')}>
              <LiquidityContainer
                marketId={marketId}
                filter={{ active: true }}
              />
            </Tab>
            <Tab id={LiquidityTabs.Inactive} name={t('Inactive')}>
              <LiquidityContainer
                marketId={marketId}
                filter={{ active: false }}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
