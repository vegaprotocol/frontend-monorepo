import { useRef, useMemo } from 'react';
import { AsyncRenderer, Tab, Tabs } from '@vegaprotocol/ui-toolkit';

import type { AgGridReact } from 'ag-grid-react';
import { LiquidityTable } from './liquidity-table';
import type { Liquidity } from './__generated__';
import { useQuery } from '@apollo/client';
import { LIQUIDITY_QUERY } from './liquidity-query';
import classNames from 'classnames';
import {
  t,
  formatNumber,
  formatNumberPercentage,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';

interface LiquidityManagerProps {
  partyId: string;
  marketId: string;
}

export const LiquidityManager = ({
  partyId,
  marketId,
}: LiquidityManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, loading, error } = useQuery<Liquidity>(LIQUIDITY_QUERY, {
    variables: useMemo(() => ({ marketId }), [marketId]),
  });

  const wrapperClasses = classNames(
    'h-full max-h-full',
    'flex flex-col',
    'text-ui'
  );

  const myLiquidityProvision =
    data?.market?.liquidityProvisionsConnection.edges?.find(
      (e) => e?.node.party.id === partyId
    );
  const myLiquidityProviderFeeShare =
    data?.market?.data?.liquidityProviderFeeShare?.find(
      (e) => e.party.id === partyId
    );

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div className={wrapperClasses}>
        <h5 className="text-ui font-bold text-black dark:text-white">
          {`${data?.market?.tradableInstrument.instrument.code} ${t(
            'liquidity provision'
          )}`}
        </h5>

        <div>
          <div className="text-ui font-bold text-black dark:text-white">
            {t('Market specification')}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-10">
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Target stake')}</div>
              <div>
                {formatNumber(
                  new BigNumber(data?.market?.data?.suppliedStake ?? 0),
                  data?.market?.decimalPlaces
                )}
              </div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Supplied stake')}</div>
              <div>
                {formatNumber(
                  new BigNumber(data?.market?.data?.suppliedStake ?? 0),
                  data?.market?.decimalPlaces
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-ui font-bold text-black dark:text-white my-10">
            {t('My liquidity provision')}
          </div>
          <div className="grid grid-cols-9 gap-4">
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Party')}</div>
              <div>{myLiquidityProvision?.node.id}</div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Share')}</div>
              <div>
                {formatNumberPercentage(
                  new BigNumber(
                    myLiquidityProviderFeeShare?.equityLikeShare || 0
                  )
                )}
              </div>
            </div>

            <div className="text-ui-small">
              <div className="text-ui-small">{t('Fee')}</div>
              <div>
                {formatNumberPercentage(
                  new BigNumber(myLiquidityProvision?.node.fee || 0)
                )}
              </div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">
                {t('Average entry valuation')}
              </div>
              <div>
                {formatNumberPercentage(
                  new BigNumber(
                    myLiquidityProviderFeeShare?.averageEntryValuation || 0
                  )
                )}
              </div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Obligation (siskas)')}</div>
              <div>
                {
                  myLiquidityProvision?.node.commitmentAmount ?? 0 // TODO is this the correct obligation? how do we format it?
                }
              </div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Supplied (siskas)')}</div>
              <div>
                {
                  myLiquidityProvision?.node.commitmentAmount ?? 0 // TODO is this the correct supplied? how do we format it?
                }
              </div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Created')}</div>
              <div>
                {getDateTimeFormat().format(
                  new Date(myLiquidityProvision?.node.createdAt ?? 0)
                )}
              </div>
            </div>
            <div className="text-ui-small">
              <div className="text-ui-small">{t('Updated')}</div>
              <div>
                {getDateTimeFormat().format(
                  new Date(myLiquidityProvision?.node.updatedAt ?? 0)
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-ui font-bold text-black dark:text-white mt-10">
            {t('All parties')}
          </div>

          <Tabs>
            <Tab id="active" name={t('Active')}>
              <LiquidityTable
                ref={gridRef}
                data={data?.market?.liquidityProvisionsConnection.edges ?? []}
              />
            </Tab>
            <Tab id="inactive" name={t('Inactive')}>
              <LiquidityTable
                ref={gridRef}
                data={data?.market?.liquidityProvisionsConnection.edges ?? []}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </AsyncRenderer>
  );
};
