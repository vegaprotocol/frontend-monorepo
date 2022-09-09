import { LiquidityTable, useLiquidityProvision } from '@vegaprotocol/liquidity';
import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { AsyncRenderer, Tab, Tabs, Splash, Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { AgGridReact } from 'ag-grid-react';
import { Header, HeaderStat } from '../../components/header';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useMemo } from 'react';

const LiquidityPage = ({ id }: { id?: string }) => {
  const { query } = useRouter();
  const { keypair } = useVegaWallet();
  const gridRef = useRef<AgGridReact | null>(null);

  const partyId = keypair?.pub;
  // Default to first marketId query item if found
  const marketId =
    id || (Array.isArray(query.marketId) ? query.marketId[0] : query.marketId);

  if (!marketId) {
    return (
      <Splash>
        <h4 className="text-lg text-black dark:text-white">{t('Invalid market id.')}</h4>
        <Link href="/" passHref={true}>
          <Button>{t('Go back')}</Button>
        </Link>
      </Splash>
    );
  }

  const {
    data: { liquidityProviders, suppliedStake, targetStake, code, symbol },
    loading,
    error,
  } = useLiquidityProvision({ marketId });

  const myLpEdges = useMemo(
    () => liquidityProviders.filter((e) => e.party === partyId),
    [liquidityProviders, partyId]
  );
  const activeEdges = useMemo(
    () =>
      liquidityProviders.filter(
        (e) => e.status === Schema.LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );
  const inactiveEdges = useMemo(
    () =>
      liquidityProviders.filter(
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
            <Link href={`/markets/${marketId}`}>
              {`${code} ${t('liquidity provision')}`}
            </Link>
          }
        >
          <HeaderStat heading={t('Target stake')}>
            <div>{`${targetStake} ${symbol}`}</div>
          </HeaderStat>
          <HeaderStat heading={t('Supplied stake')}>
            <div>{`${suppliedStake} ${symbol}`}</div>
          </HeaderStat>
          <HeaderStat heading={t('Market ID')}>
            <div className="break-word">{marketId}</div>
          </HeaderStat>
        </Header>
        <Tabs active={getActiveDefaultId()}>
          <Tab
            id={LiquidityTabs.MyLiquidityProvision}
            name={t('My liquidity provision')}
            hidden={!partyId}
          >
            <LiquidityTable ref={gridRef} data={myLpEdges} />
          </Tab>
          <Tab id={LiquidityTabs.Active} name={t('Active')}>
            <LiquidityTable ref={gridRef} data={activeEdges} />
          </Tab>
          <Tab id={LiquidityTabs.Inactive} name={t('Inactive')}>
            <LiquidityTable ref={gridRef} data={inactiveEdges} />
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
