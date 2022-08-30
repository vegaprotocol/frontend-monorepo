import { useRef, useMemo } from 'react';
import { AsyncRenderer, Tab, Tabs } from '@vegaprotocol/ui-toolkit';

import type { AgGridReact } from 'ag-grid-react';
import { LiquidityTable } from './liquidity-table';
import type { MarketLiquidity } from './__generated__/MarketLiquidity';
import { useQuery } from '@apollo/client';
import classNames from 'classnames';
import { t, addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { MyLiquidityProvisionContainer } from './my-liquidity-container';
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

  const {
    liquidityProviders,
    suppliedStake,
    targetStake,
    decimalPlaces,
    positionDecimalPlaces,
    code,
    symbol,
  } = useLiquidityProvision({ data: marketLiquidityData });

  const wrapperClasses = classNames(
    'h-full max-h-full',
    'flex flex-col',
    'text-ui-small',
    'gap-24'
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

  return (
    <AsyncRenderer loading={loading} error={error} data={liquidityProviders}>
      <div className={wrapperClasses}>
        <h5 className="text-h5 font-bold text-black dark:text-white">
          {`${code} ${t('liquidity provision')}`}
        </h5>

        <div>
          <div className="text-ui font-bold text-black dark:text-white">
            {t('Market specification')}
          </div>
          <div className="grid grid-cols-4 gap-24 mb-10">
            <div>
              <div>{t('Target stake')}</div>
              <div>
                {`${addDecimalsFormatNumber(
                  targetStake ?? '-',
                  positionDecimalPlaces ?? 0
                )} ${symbol}`}
              </div>
            </div>
            <div>
              <div>{t('Supplied stake')}</div>
              <div>
                {`${addDecimalsFormatNumber(
                  suppliedStake ?? '-',
                  positionDecimalPlaces
                )} ${symbol}`}
              </div>
            </div>
          </div>
        </div>

        {partyId && (
          <MyLiquidityProvisionContainer
            partyId={partyId}
            data={marketLiquidityData}
          />
        )}

        <div className="h-[50vh]">
          <div className="text-ui font-bold text-black dark:text-white mt-10">
            {t('All parties')}
          </div>

          <Tabs>
            <Tab id="active" name={t('Active')}>
              <LiquidityTable
                ref={gridRef}
                decimalPlaces={decimalPlaces ?? 0}
                positionDecimalPlaces={positionDecimalPlaces ?? 0}
                data={activeEdges}
              />
            </Tab>
            <Tab id="inactive" name={t('Inactive')}>
              <LiquidityTable
                ref={gridRef}
                decimalPlaces={decimalPlaces ?? 0}
                positionDecimalPlaces={positionDecimalPlaces ?? 0}
                data={inactiveEdges}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </AsyncRenderer>
  );
};
