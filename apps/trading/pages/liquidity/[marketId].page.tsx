import { LiquidityTable, useLiquidityProvision } from '@vegaprotocol/liquidity';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { LiquidityProvisionStatus } from '@vegaprotocol/types';
import {
  AsyncRenderer,
  Icon,
  Tab,
  Tabs,
  Link as UiToolkitLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { AgGridReact } from 'ag-grid-react';
import { Header, HeaderStat } from '../../components/header';
import { useRouter } from 'next/router';
import { useRef, useMemo } from 'react';
import { tooltipMapping } from '@vegaprotocol/market-info';
import Link from 'next/link';

const LiquidityPage = ({ id }: { id?: string }) => {
  const { query } = useRouter();
  const { pubKey } = useVegaWallet();
  const gridRef = useRef<AgGridReact | null>(null);

  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);

  const {
    data: {
      liquidityProviders,
      suppliedStake,
      targetStake,
      name,
      symbol,
      assetDecimalPlaces,
    },
    loading,
    error,
  } = useLiquidityProvision({ marketId });

  const myLpEdges = useMemo(
    () => liquidityProviders.filter((e) => e.party === pubKey),
    [liquidityProviders, pubKey]
  );
  const activeEdges = useMemo(
    () =>
      liquidityProviders.filter(
        (e) => e.status === LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );
  const inactiveEdges = useMemo(
    () =>
      liquidityProviders.filter(
        (e) => e.status !== LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );

  const enum LiquidityTabs {
    Active = 'active',
    Inactive = 'inactive',
    MyLiquidityProvision = 'myLP',
  }

  const getActiveDefaultId = () => {
    if (myLpEdges?.length > 0) return LiquidityTabs.MyLiquidityProvision;
    if (activeEdges?.length) return LiquidityTabs.Active;
    else if (inactiveEdges?.length > 0) return LiquidityTabs.Inactive;
    return LiquidityTabs.Active;
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <div className="h-full grid grid-rows-[min-content_1fr]">
        <Header
          title={
            <Link href={`/markets/${marketId}`} passHref={true}>
              <UiToolkitLink className="hover:text-neutral-500 dark:hover:text-neutral-300 sm:text-lg md:text-xl lg:text-2xl">
                <Icon name="chevron-left" size={6} />
                {`${name}`}
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
            <LiquidityTable
              ref={gridRef}
              data={myLpEdges}
              symbol={symbol}
              assetDecimalPlaces={assetDecimalPlaces}
            />
          </Tab>
          <Tab id={LiquidityTabs.Active} name={t('Active')}>
            <LiquidityTable
              ref={gridRef}
              data={activeEdges}
              symbol={symbol}
              assetDecimalPlaces={assetDecimalPlaces}
            />
          </Tab>
          <Tab id={LiquidityTabs.Inactive} name={t('Inactive')}>
            <LiquidityTable
              ref={gridRef}
              data={inactiveEdges}
              symbol={symbol}
              assetDecimalPlaces={assetDecimalPlaces}
            />
          </Tab>
        </Tabs>
      </div>
    </AsyncRenderer>
  );
};
LiquidityPage.getInitialProps = () => ({
  page: 'liquidity',
});

export default LiquidityPage;
