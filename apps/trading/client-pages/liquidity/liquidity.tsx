import {
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
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Header, HeaderStat, HeaderTitle } from '../../components/header';

import type { AgGridReact } from 'ag-grid-react';
import type { IGetRowsParams } from 'ag-grid-community';

import type { LiquidityProvisionData } from '@vegaprotocol/liquidity';
import { Link, useParams } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

import { useMarket, useStaticMarketData } from '@vegaprotocol/market-list';

export const Liquidity = () => {
  const params = useParams();
  const marketId = params.marketId;
  return <LiquidityViewContainer marketId={marketId} />;
};

const useReloadLiquidityData = (marketId: string | undefined) => {
  const { reload } = useDataProvider({
    dataProvider: liquidityProvisionsDataProvider,
    variables: useMemo(() => ({ marketId }), [marketId]),
  });
  useEffect(() => {
    const interval = setInterval(reload, 10000);
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
    variables: useMemo(() => ({ marketId }), [marketId]),
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

export const LiquidityViewContainer = ({
  marketId,
}: {
  marketId: string | undefined;
}) => {
  const { pubKey } = useVegaWallet();
  const gridRef = useRef<AgGridReact | null>(null);
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useStaticMarketData(marketId);

  const dataRef = useRef<LiquidityProvisionData[] | null>(null);

  // To be removed when liquidityProvision subscriptions are working
  useReloadLiquidityData(marketId);

  const update = useCallback(
    ({ data }: { data: LiquidityProvisionData[] | null }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (dataRef.current?.length) {
        dataRef.current = data;
        gridRef.current.api.refreshInfiniteCache();
        return true;
      }
      return false;
    },
    [gridRef]
  );

  const {
    data: liquidityProviders,
    loading,
    error,
  } = useDataProvider({
    dataProvider: lpAggregatedDataProvider,
    update,
    variables: useMemo(() => ({ marketId }), [marketId]),
  });

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
  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;
  const triggeringRatio =
    params.market_liquidity_targetstake_triggering_ratio || '1';
  const myLpEdges = useMemo(
    () => liquidityProviders?.filter((e) => e.party.id === pubKey),
    [liquidityProviders, pubKey]
  );
  const activeEdges = useMemo(
    () =>
      liquidityProviders?.filter(
        (e) => e.status === Schema.LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );
  const inactiveEdges = useMemo(
    () =>
      liquidityProviders?.filter(
        (e) => e.status !== Schema.LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );

  const enum LiquidityTabs {
    Active = 'active',
    Inactive = 'inactive',
    MyLiquidityProvision = 'myLP',
  }

  const getActiveDefaultId = () => {
    if (myLpEdges && myLpEdges.length > 0) {
      return LiquidityTabs.MyLiquidityProvision;
    }
    if (activeEdges?.length) return LiquidityTabs.Active;
    else if (inactiveEdges && inactiveEdges.length > 0) {
      return LiquidityTabs.Inactive;
    }
    return LiquidityTabs.Active;
  };

  const { percentage, status } = useCheckLiquidityStatus({
    suppliedStake: suppliedStake || 0,
    targetStake: targetStake || 0,
    triggeringRatio,
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <div className="h-full grid grid-rows-[min-content_1fr]">
        <Header
          title={
            market?.tradableInstrument.instrument.name &&
            market?.tradableInstrument.instrument.code &&
            marketId && (
              <HeaderTitle
                primaryContent={`${
                  market.tradableInstrument.instrument.code
                } ${t('liquidity provision')}`}
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
          <HeaderStat
            heading={t('Liquidity supplied')}
            testId="liquidity-supplied"
          >
            <Indicator variant={status} />

            {formatNumberPercentage(percentage, 2)}
          </HeaderStat>
          <HeaderStat heading={t('Market ID')}>
            <div className="break-word">{marketId}</div>
          </HeaderStat>
        </Header>
        <Tabs active={getActiveDefaultId()}>
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
          {
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
          }
        </Tabs>
      </div>
    </AsyncRenderer>
  );
};
