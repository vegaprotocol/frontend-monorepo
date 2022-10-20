import { lpAggregatedDataProvider } from '@vegaprotocol/liquidity';
import { marketLiquidityDataProvider } from '@vegaprotocol/liquidity';
import { LiquidityTable } from '@vegaprotocol/liquidity';
import {
  addDecimalsFormatNumber,
  NetworkParams,
  t,
  useDataProvider,
  useNetworkParam,
} from '@vegaprotocol/react-helpers';
import {
  AsyncRenderer,
  Tab,
  Tabs,
  Link as UiToolkitLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { AgGridReact } from 'ag-grid-react';
import { Header, HeaderStat } from '../../components/header';
import { useRouter } from 'next/router';
import { useRef, useMemo, useCallback } from 'react';
import { tooltipMapping } from '@vegaprotocol/market-info';
import Link from 'next/link';
import { Schema } from '@vegaprotocol/types';
import type { LiquidityProvisionData } from '@vegaprotocol/liquidity';

const LiquidityPage = ({ id }: { id?: string }) => {
  const { query } = useRouter();
  const { pubKey } = useVegaWallet();
  const gridRef = useRef<AgGridReact | null>(null);

  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);

  const { data: marketProvision } = useDataProvider({
    dataProvider: marketLiquidityDataProvider,
    noUpdate: true,
    variables: useMemo(() => ({ marketId }), [marketId]),
  });
  const dataRef = useRef<LiquidityProvisionData[] | null>(null);

  const update = useCallback(
    ({ data }: { data: LiquidityProvisionData[] }) => {
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
    update, // TODO only accounts should use LP party ID
    variables: useMemo(
      () => ({ marketId, partyId: pubKey }),
      [marketId, pubKey]
    ),
  });
  console.log({ liquidityProviders }); // TODO: Remove this

  const targetStake = marketProvision?.market?.data?.targetStake;
  const suppliedStake = marketProvision?.market?.data?.suppliedStake;
  const assetDecimalPlaces =
    marketProvision?.market?.tradableInstrument.instrument.product
      .settlementAsset.decimals || 0;
  const symbol =
    marketProvision?.market?.tradableInstrument.instrument.product
      .settlementAsset.symbol;

  const { param: stakeToCcySiskas } = useNetworkParam(
    NetworkParams.market_liquidity_stakeToCcySiskas
  );
  const stakeToCcySiska = stakeToCcySiskas && stakeToCcySiskas[0];

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

  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <div className="h-full grid grid-rows-[min-content_1fr]">
        <Header
          title={
            <Link href={`/markets/${marketId}`} passHref={true}>
              <UiToolkitLink className="sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2 whitespace-nowrap hover:text-neutral-500 dark:hover:text-neutral-300">
                {`${
                  marketProvision?.market?.tradableInstrument.instrument.name
                } ${t('liquidity provision')}`}
              </UiToolkitLink>
            </Link>
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
                stakeToCcySiskas={stakeToCcySiska}
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
                stakeToCcySiskas={stakeToCcySiska}
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
                  stakeToCcySiskas={stakeToCcySiska}
                />
              )}
            </Tab>
          }
        </Tabs>
      </div>
    </AsyncRenderer>
  );
};
LiquidityPage.getInitialProps = () => ({
  page: 'liquidity',
});

export default LiquidityPage;
