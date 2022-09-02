import { LiquidityTable, useLiquidityProvision } from '@vegaprotocol/liquidity';
import { t } from '@vegaprotocol/react-helpers';
import { LiquidityProvisionStatus } from '@vegaprotocol/types';
import {
  AsyncRenderer,
  ResizableGrid,
  ResizableGridPanel,
  Tab,
  Tabs,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { AgGridReact } from 'ag-grid-react';
import classNames from 'classnames';
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

  const {
    data: { liquidityProviders, suppliedStake, targetStake, code, symbol },
    loading,
    error,
  } = useLiquidityProvision({ marketId });

  const titleClasses =
    'sm:text-lg md:text-xl lg:text-2xl flex items-center gap-4 whitespace-nowrap';

  const myLpEdges = useMemo(
    () => liquidityProviders.filter((e) => e.party === partyId),
    [liquidityProviders, partyId]
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

  const getActiveDefaultId = () => {
    if (myLpEdges?.length > 0) return 'myLP';
    if (activeEdges?.length) return 'active';
    else if (inactiveEdges?.length > 0) return 'inactive';
    return 'active';
  };

  const itemClass =
    'min-w-min w-[120px] whitespace-nowrap pb-3 px-4 border-l border-neutral-300 dark:border-neutral-700';
  const itemHeading = 'text-neutral-400';
  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <header className="w-screen xl:px-4 pt-4 border-b border-neutral-300 dark:border-neutral-700">
        <div className="xl:flex xl:gap-4  items-start">
          <div className="px-4 mb-2 xl:mb-0">
            <a className={titleClasses} href={`/markets/${marketId}`}>
              {`${code} ${t('liquidity provision')}`}
            </a>
          </div>
          <div className="flex flex-nowrap items-start xl:flex-1 w-full overflow-x-auto text-xs ">
            <div className={itemClass}>
              <div className={itemHeading}>{t('Target stake')}</div>
              <div>{`${targetStake} ${symbol}`}</div>
            </div>
            <div className={itemClass}>
              <div className={itemHeading}>{t('Supplied stake')}</div>
              <div>{`${suppliedStake} ${symbol}`}</div>
            </div>
            <div className={classNames('col-span-2', itemClass)}>
              <div className={itemHeading}>{t('Market ID')}</div>
              <div style={{ wordBreak: 'break-word' }}>{marketId}</div>
            </div>
          </div>
        </div>
      </header>
      <div>
        <ResizableGrid vertical={true}>
          <ResizableGridPanel preferredSize={300} minSize={50}>
            <Tabs active={getActiveDefaultId()}>
              <Tab
                id="myLP"
                name={t('My liquidity provision')}
                hidden={!partyId}
              >
                <LiquidityTable ref={gridRef} data={myLpEdges} />
              </Tab>
              <Tab id="active" name={t('Active')}>
                <LiquidityTable ref={gridRef} data={activeEdges} />
              </Tab>
              <Tab id="inactive" name={t('Inactive')}>
                <LiquidityTable ref={gridRef} data={inactiveEdges} />
              </Tab>
            </Tabs>
          </ResizableGridPanel>
        </ResizableGrid>
      </div>
    </AsyncRenderer>
  );
};
LiquidityPage.getInitialProps = () => ({
  page: 'liquidity',
});

export default LiquidityPage;
