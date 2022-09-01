import { useRef, useMemo } from 'react';
import { AsyncRenderer, Link, Tab, Tabs } from '@vegaprotocol/ui-toolkit';

import type { AgGridReact } from 'ag-grid-react';
import { LiquidityTable } from './liquidity-table';
import type { MarketLiquidity } from './__generated__/MarketLiquidity';
import { useQuery } from '@apollo/client';
import classNames from 'classnames';
import { t } from '@vegaprotocol/react-helpers';
import { LiquidityProvisionStatus } from '@vegaprotocol/types';
import {
  MARKET_LIQUIDITY_QUERY,
  useLiquidityProvision,
} from './liquidity-data-provider';

export const SISKA_NETWORK_PARAMETER = 'market.liquidity.stakeToCcySiskas';

interface LiquidityManagerProps {
  partyId?: string;
  marketId: string;
}

export const LiquidityManager = ({
  partyId,
  marketId,
}: LiquidityManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const {
    data: marketLiquidityData,
    loading,
    error,
  } = useQuery<MarketLiquidity>(MARKET_LIQUIDITY_QUERY, {
    variables: useMemo(() => ({ marketId }), [marketId]),
  });

  const { liquidityProviders, suppliedStake, targetStake, code, symbol } =
    useLiquidityProvision({ data: marketLiquidityData });

  const wrapperClasses = classNames(
    'h-full max-h-full',
    'flex flex-col',
    'text-ui-small',
    'gap-8'
  );
  const titleClasses =
    'sm:text-lg md:text-xl lg:text-2xl flex items-center gap-4 whitespace-nowrap';

  const myLpEdges = useMemo(
    () => (liquidityProviders || []).filter((e) => e.party === partyId),
    [liquidityProviders, partyId]
  );
  const activeEdges = useMemo(
    () =>
      (liquidityProviders || []).filter(
        (e) => e.status === LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );
  const inactiveEdges = useMemo(
    () =>
      (liquidityProviders || []).filter(
        (e) => e.status !== LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [liquidityProviders]
  );

  const getActiveDefaultId = () => {
    if (activeEdges?.length) return 'active';
    else if (inactiveEdges?.length > 0) return 'inactive';
    return 'active';
  };
  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <div className={wrapperClasses}>
        <Link className={titleClasses} href={`/markets/${marketId}`}>
          {`${code} ${t('liquidity provision')}`}
        </Link>

        <div>
          <div className="text-ui font-bold text-black dark:text-white">
            {t('Market specification')}
          </div>
          <div className="grid grid-cols-4 gap-24">
            <div>
              <div>{t('Target stake')}</div>
              <div>{`${targetStake} ${symbol}`}</div>
            </div>
            <div>
              <div>{t('Supplied stake')}</div>
              <div>{`${suppliedStake} ${symbol}`}</div>
            </div>
            <div className="col-span-2">
              <div>{t('Market ID')}</div>
              <div style={{ wordBreak: 'break-word' }}>{marketId}</div>
            </div>
          </div>
        </div>

        {partyId && (
          <div className="h-[10vh]">
            <div className="text-ui font-bold text-black dark:text-white mt-10">
              {t('My liquidity provisions')}
            </div>
            <LiquidityTable ref={gridRef} data={myLpEdges} />
          </div>
        )}

        <div className="h-[30vh]">
          <div className="text-ui font-bold text-black dark:text-white mt-10">
            {t('All parties')}
          </div>

          <Tabs activeDefaultId={getActiveDefaultId()}>
            <Tab id="active" name={t('Active')}>
              <LiquidityTable ref={gridRef} data={activeEdges} />
            </Tab>
            <Tab id="inactive" name={t('Inactive')}>
              <LiquidityTable ref={gridRef} data={inactiveEdges} />
            </Tab>
          </Tabs>
        </div>
      </div>
    </AsyncRenderer>
  );
};
