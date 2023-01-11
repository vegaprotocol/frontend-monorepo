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
  NetworkParams,
  t,
  useDataProvider,
  useNetworkParams,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Header, HeaderStat } from '../../components/header';

import type { AgGridReact } from 'ag-grid-react';
import type { LiquidityProvisionData } from '@vegaprotocol/liquidity';
import { Link, useParams } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';
import type {
  MarketData,
  MarketDataUpdateFieldsFragment,
  MarketDealTicket,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketProvider, marketDataProvider } from '@vegaprotocol/market-list';

export const Liquidity = () => {
  const params = useParams();
  const marketId = params.marketId;
  return <LiquidityViewContainer marketId={marketId} />;
};

export const LiquidityContainer = ({
  marketId,
}: {
  marketId: string | undefined;
}) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [market, setMarket] = useState<MarketDealTicket | null>(null);
  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  const { data: marketProvision } = useDataProvider<
    SingleMarketFieldsFragment,
    never
  >({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const updateMarket = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (marketData) {
        setMarket({
          ...marketProvision,
          data: marketData,
        } as MarketDealTicket);
      }
      return true;
    },
    [marketProvision]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update: updateMarket,
    variables,
    skip: !marketId || !marketProvision,
  });
  const dataRef = useRef<LiquidityProvisionData[] | null>(null);

  const { reload } = useDataProvider({
    dataProvider: liquidityProvisionsDataProvider,
    variables,
  });

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

  // To be removed when liquidityProvision subscriptions are working
  useEffect(() => {
    const interval = setInterval(reload, 10000);
    return () => clearInterval(interval);
  }, [reload]);

  const assetDecimalPlaces =
    market?.tradableInstrument.instrument.product.settlementAsset.decimals || 0;
  const symbol =
    market?.tradableInstrument.instrument.product.settlementAsset.symbol;

  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcyVolume,
  ]);
  const stakeToCcyVolume = params.market_liquidity_stakeToCcyVolume;
  const filteredEdges = useMemo(
    () =>
      liquidityProviders?.filter((e) =>
        [
          Schema.LiquidityProvisionStatus.STATUS_ACTIVE,
          Schema.LiquidityProvisionStatus.STATUS_UNDEPLOYED,
          Schema.LiquidityProvisionStatus.STATUS_PENDING,
        ].includes(e.status)
      ),
    [liquidityProviders]
  );

  return (
    <AsyncRenderer loading={loading} error={error} data={filteredEdges}>
      <LiquidityTable
        ref={gridRef}
        data={filteredEdges}
        symbol={symbol}
        assetDecimalPlaces={assetDecimalPlaces}
        stakeToCcyVolume={stakeToCcyVolume}
      />
    </AsyncRenderer>
  );
};

export const LiquidityViewContainer = ({
  marketId,
}: {
  marketId: string | undefined;
}) => {
  const { pubKey } = useVegaWallet();
  const gridRef = useRef<AgGridReact | null>(null);
  const [market, setMarket] = useState<MarketDealTicket | null>(null);
  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  const { data: marketProvision } = useDataProvider<
    SingleMarketFieldsFragment,
    never
  >({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const updateMarket = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (marketData) {
        setMarket({
          ...marketProvision,
          data: marketData,
        } as MarketDealTicket);
      }
      return true;
    },
    [marketProvision]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update: updateMarket,
    variables,
    skip: !marketId || !marketProvision,
  });
  const dataRef = useRef<LiquidityProvisionData[] | null>(null);

  const { reload } = useDataProvider({
    dataProvider: liquidityProvisionsDataProvider,
    variables: useMemo(() => ({ marketId }), [marketId]),
  });

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

  // To be removed when liquidityProvision subscriptions are working
  useEffect(() => {
    const interval = setInterval(reload, 10000);
    return () => clearInterval(interval);
  }, [reload]);

  const targetStake = market?.data?.targetStake;
  const suppliedStake = market?.data?.suppliedStake;
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
            marketId && (
              <Link to={Links[Routes.MARKET](marketId)}>
                <UiToolkitLink className="sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2 whitespace-nowrap hover:text-neutral-500 dark:hover:text-neutral-300">
                  {`${market?.tradableInstrument.instrument.name} ${t(
                    'liquidity provision'
                  )}`}
                </UiToolkitLink>
              </Link>
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
                data={myLpEdges}
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
                data={activeEdges}
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
                  data={inactiveEdges}
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
