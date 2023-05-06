import {
  matchFilter,
  liquidityProvisionsDataProvider,
  LiquidityTable,
  lpAggregatedDataProvider,
  useCheckLiquidityStatus,
} from '@vegaprotocol/liquidity';
import { tooltipMapping } from '@vegaprotocol/market-info';
import {
  addDecimalsFormatNumber,
  createDocsLinks,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParams,
  updateGridData,
} from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  AsyncRenderer,
  Tab,
  Tabs,
  Link as UiToolkitLink,
  Indicator,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Header, HeaderStat, HeaderTitle } from '../../components/header';

import type { AgGridReact } from 'ag-grid-react';
import type { IGetRowsParams } from 'ag-grid-community';

import type { LiquidityProvisionData, Filter } from '@vegaprotocol/liquidity';
import { Link, useParams } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

import { useMarket, useStaticMarketData } from '@vegaprotocol/market-list';
import { useEnvironment } from '@vegaprotocol/environment';

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

const useReloadLiquidityData = (marketId: string | undefined) => {
  const { reload } = useDataProvider({
    dataProvider: liquidityProvisionsDataProvider,
    variables: { marketId: marketId || '' },
    update: () => true,
    skip: !marketId,
  });
  useEffect(() => {
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, [reload]);
};

export const LiquidityContainer = ({
  marketId,
  filter,
}: {
  marketId: string | undefined;
  filter?: Filter;
}) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data: market } = useMarket(marketId);
  const dataRef = useRef<LiquidityProvisionData[] | null>(null);

  // To be removed when liquidityProvision subscriptions are working
  useReloadLiquidityData(marketId);

  const update = useCallback(
    ({ data }: { data: LiquidityProvisionData[] | null }) => {
      return updateGridData(dataRef, data, gridRef);
    },
    [gridRef]
  );

  const { data, loading, error } = useDataProvider({
    dataProvider: lpAggregatedDataProvider,
    update,
    variables: { marketId: marketId || '', filter },
    skip: !marketId,
  });

  const assetDecimalPlaces =
    market?.tradableInstrument.instrument.product.settlementAsset.decimals || 0;
  const symbol =
    market?.tradableInstrument.instrument.product.settlementAsset.symbol;

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
  ]);
  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;

  const getRows = useCallback(
    async ({ successCallback, startRow, endRow }: IGetRowsParams) => {
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow)
        : [];
      const lastRow = dataRef.current ? dataRef.current.length : 0;
      successCallback(rowsThisBlock, lastRow);
    },
    []
  );

  return (
    <div className="h-full relative">
      <LiquidityTable
        ref={gridRef}
        datasource={{ getRows }}
        rowModelType="infinite"
        symbol={symbol}
        assetDecimalPlaces={assetDecimalPlaces}
        stakeToCcyVolume={stakeToCcyVolume}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No liquidity provisions')}
          noDataCondition={(data) => !data?.length}
        />
      </div>
    </div>
  );
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
  const { VEGA_DOCS_URL } = useEnvironment();

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
          <HeaderTitle
            primaryContent={`${market.tradableInstrument.instrument.code} ${t(
              'liquidity provision'
            )}`}
            secondaryContent={
              <Link to={Links[Routes.MARKET](marketId)}>
                <UiToolkitLink>{t('Go to trading')}</UiToolkitLink>
              </Link>
            }
          />
        )
      }
    >
      <HeaderStat
        heading={t('Target stake')}
        description={tooltipMapping['targetStake']}
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
        <Indicator variant={status} />

        {formatNumberPercentage(percentage, 2)}
      </HeaderStat>
      <HeaderStat heading={t('Market ID')}>
        <div className="break-word">{marketId}</div>
      </HeaderStat>
      <HeaderStat heading={t('Learn more')}>
        {VEGA_DOCS_URL && (
          <ExternalLink href={createDocsLinks(VEGA_DOCS_URL).LIQUIDITY}>
            {t('Providing liquidity')}
          </ExternalLink>
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
          <LiquidityContainer marketId={marketId} filter={{ active: true }} />
        </Tab>
        <Tab id={LiquidityTabs.Inactive} name={t('Inactive')}>
          <LiquidityContainer marketId={marketId} filter={{ active: false }} />
        </Tab>
      </Tabs>
    </div>
  );
};
