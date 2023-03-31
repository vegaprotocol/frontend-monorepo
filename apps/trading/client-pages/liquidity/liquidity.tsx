import {
  getId,
  liquidityProvisionsDataProvider,
  LiquidityTable,
  lpAggregatedDataProvider,
  useCheckLiquidityStatus,
} from '@vegaprotocol/liquidity';
import { tooltipMapping } from '@vegaprotocol/market-info';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useDataProvider,
  useNetworkParams,
  updateGridData,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  AsyncRenderer,
  Tab,
  Tabs,
  Link as UiToolkitLink,
  Indicator,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Header, HeaderStat, HeaderTitle } from '../../components/header';

import type { AgGridReact } from 'ag-grid-react';
import type { IGetRowsParams } from 'ag-grid-community';

import type { LiquidityProvisionData } from '@vegaprotocol/liquidity';
import { Link, useParams } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

import { useMarket, useStaticMarketData } from '@vegaprotocol/market-list';
import isEqual from 'lodash/isEqual';

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
}: {
  marketId: string | undefined;
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
    variables: { marketId: marketId || '' },
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
    </Header>
  );
});
LiquidityViewHeader.displayName = 'LiquidityViewHeader';

const filterLiquidities = (
  tab: string,
  liquidities?: LiquidityProvisionData[] | null,
  pubKey?: string | null
) => {
  switch (tab) {
    case LiquidityTabs.MyLiquidityProvision:
      return pubKey
        ? (liquidities || []).filter((e) => e.party.id === pubKey)
        : [];
      break;
    case LiquidityTabs.Active:
      return (liquidities || []).filter(
        (e) => e.status === Schema.LiquidityProvisionStatus.STATUS_ACTIVE
      );
    case LiquidityTabs.Inactive:
      return (liquidities || []).filter(
        (e) => e.status !== Schema.LiquidityProvisionStatus.STATUS_ACTIVE
      );
    default:
      return [];
  }
};

export const LiquidityViewContainer = ({
  marketId,
}: {
  marketId: string | undefined;
}) => {
  const [tab, setTab] = useState('');
  const { pubKey } = useVegaWallet();
  const [liquidityProviders, setLiquidityProviders] = useState<
    LiquidityProvisionData[] | null
  >();
  const gridRef = useRef<AgGridReact | null>(null);
  const { data: market } = useMarket(marketId);
  const dataRef = useRef<LiquidityProvisionData[] | null>(null);

  // To be removed when liquidityProvision subscriptions are working
  useReloadLiquidityData(marketId);

  const update = useCallback(
    ({ data }: { data: LiquidityProvisionData[] | null }) => {
      if (!dataRef.current) {
        setLiquidityProviders(data);
        dataRef.current = data;
      }
      if (!gridRef.current?.api) {
        return false;
      }
      const updateRows: LiquidityProvisionData[] = [];
      const addRows: LiquidityProvisionData[] = [];
      if (gridRef.current?.api?.getModel().getType() === 'infinite') {
        dataRef.current = data;
        gridRef.current.api.refreshInfiniteCache();
      } else {
        const filteredData = filterLiquidities(tab, data, pubKey as string);
        filteredData?.forEach((d) => {
          const rowNode = gridRef.current?.api?.getRowNode(getId(d));
          if (rowNode) {
            if (!isEqual(rowNode.data, d)) {
              updateRows.push(d);
            }
          } else {
            addRows.push(d);
          }
        });
        gridRef.current?.api?.applyTransaction({
          update: updateRows,
          add: addRows,
          addIndex: 0,
        });
      }
      return true;
    },
    [gridRef, tab, pubKey]
  );

  const { loading, error } = useDataProvider({
    dataProvider: lpAggregatedDataProvider,
    update,
    variables: { marketId: marketId || '' },
    skip: !marketId,
  });
  const assetDecimalPlaces =
    market?.tradableInstrument.instrument.product.settlementAsset.decimals || 0;
  const symbol =
    market?.tradableInstrument.instrument.product.settlementAsset.symbol;

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);
  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;
  const myLpEdges = useMemo(
    () =>
      filterLiquidities(
        LiquidityTabs.MyLiquidityProvision,
        liquidityProviders,
        pubKey
      ),
    [liquidityProviders, pubKey]
  );
  const activeEdges = useMemo(
    () => filterLiquidities(LiquidityTabs.Active, liquidityProviders),
    [liquidityProviders]
  );
  const inactiveEdges = useMemo(
    () => filterLiquidities(LiquidityTabs.Inactive, liquidityProviders),
    [liquidityProviders]
  );

  useEffect(() => {
    if (tab) {
      return;
    }
    let initialTab = LiquidityTabs.Active;
    if (myLpEdges.length > 0) {
      initialTab = LiquidityTabs.MyLiquidityProvision;
    }
    if (activeEdges?.length) {
      initialTab = LiquidityTabs.Active;
    } else if (inactiveEdges.length > 0) {
      initialTab = LiquidityTabs.Inactive;
    }
    setTab(initialTab);
  }, [tab, myLpEdges?.length, activeEdges?.length, inactiveEdges?.length]);

  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <div className="h-full grid grid-rows-[min-content_1fr]">
        <LiquidityViewHeader marketId={marketId} />
        <Tabs value={tab} onValueChange={setTab}>
          <Tab
            id={LiquidityTabs.MyLiquidityProvision}
            name={t('My liquidity provision')}
            hidden={!pubKey}
          >
            {myLpEdges && (
              <LiquidityTable
                ref={gridRef}
                rowData={myLpEdges}
                symbol={symbol}
                stakeToCcyVolume={stakeToCcyVolume}
                assetDecimalPlaces={assetDecimalPlaces}
              />
            )}
          </Tab>
          <Tab id={LiquidityTabs.Active} name={t('Active')}>
            {activeEdges && (
              <LiquidityTable
                ref={gridRef}
                rowData={activeEdges}
                symbol={symbol}
                assetDecimalPlaces={assetDecimalPlaces}
                stakeToCcyVolume={stakeToCcyVolume}
              />
            )}
          </Tab>
          <Tab id={LiquidityTabs.Inactive} name={t('Inactive')}>
            {inactiveEdges && (
              <LiquidityTable
                ref={gridRef}
                rowData={inactiveEdges}
                symbol={symbol}
                assetDecimalPlaces={assetDecimalPlaces}
                stakeToCcyVolume={stakeToCcyVolume}
              />
            )}
          </Tab>
        </Tabs>
      </div>
    </AsyncRenderer>
  );
};
