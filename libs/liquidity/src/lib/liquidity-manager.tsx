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
  formatNumberPercentage,
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';
import { LiquidityProvisionStatus } from '@vegaprotocol/types';

interface LiquidityManagerProps {
  partyId?: string;
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
    'text-ui-small',
    'gap-24'
  );

  const myLiquidityProvision = useMemo(
    () =>
      data?.market?.liquidityProvisionsConnection.edges?.find(
        (e) => e?.node.party.id === partyId
      ),
    [data?.market?.liquidityProvisionsConnection.edges, partyId]
  );
  const myLiquidityProviderFeeShare = useMemo(
    () =>
      data?.market?.data?.liquidityProviderFeeShare?.find(
        (e) => e.party.id === partyId
      ),
    [data?.market?.data?.liquidityProviderFeeShare, partyId]
  );

  const activeEdges = useMemo(
    () =>
      (data?.market?.liquidityProvisionsConnection.edges || []).filter(
        (e) => e?.node.status === LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [data?.market?.liquidityProvisionsConnection.edges]
  );
  const inactiveEdges = useMemo(
    () =>
      (data?.market?.liquidityProvisionsConnection.edges || []).filter(
        (e) => e?.node.status !== LiquidityProvisionStatus.STATUS_ACTIVE
      ),
    [data?.market?.liquidityProvisionsConnection.edges]
  );

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div className={wrapperClasses}>
        <h5 className="text-h5 font-bold text-black dark:text-white">
          {`${data?.market?.tradableInstrument.instrument.code} ${t(
            'liquidity provision'
          )}`}
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
                  data?.market?.data?.targetStake ?? '-',
                  data?.market?.positionDecimalPlaces ?? 0
                )} ${
                  data?.market?.tradableInstrument.instrument.product
                    .settlementAsset.symbol
                }`}
              </div>
            </div>
            <div>
              <div>{t('Supplied stake')}</div>
              <div>
                {`${addDecimalsFormatNumber(
                  data?.market?.data?.suppliedStake ?? '-',
                  data?.market?.positionDecimalPlaces ?? 0
                )} ${
                  data?.market?.tradableInstrument.instrument.product
                    .settlementAsset.symbol
                }`}
              </div>
            </div>
          </div>
        </div>

        {partyId && (
          <div>
            <div className="text-ui font-bold text-black dark:text-white my-10">
              {t('My liquidity provision')}
            </div>
            <div className="grid grid-cols-8 gap-24 break-words">
              <div>
                <div>{t('Party')}</div>
                <div>{myLiquidityProvision?.node.id ?? '-'}</div>
              </div>

              <div>
                <div>{t('Liquidity provision fee')}</div>
                <div>
                  {myLiquidityProvision?.node.fee
                    ? formatNumberPercentage(
                        new BigNumber(myLiquidityProvision.node.fee)
                      )
                    : '-'}
                </div>
              </div>
              <div>
                <div>{t('Equity-like share')}</div>
                <div className="break-words">
                  {myLiquidityProviderFeeShare?.equityLikeShare
                    ? formatNumberPercentage(
                        new BigNumber(
                          myLiquidityProviderFeeShare.equityLikeShare
                        )
                      )
                    : '-'}
                </div>
              </div>
              <div>
                <div>{t('Average entry valuation')}</div>
                <div>
                  {myLiquidityProviderFeeShare?.averageEntryValuation
                    ? formatNumberPercentage(
                        new BigNumber(
                          myLiquidityProviderFeeShare?.averageEntryValuation
                        )
                      )
                    : '-'}
                </div>
              </div>
              <div>
                <div>{t('Obligation (siskas)')}</div>
                <div>
                  {
                    myLiquidityProvision?.node.commitmentAmount ?? '-' // TODO is this the correct obligation? how do we format it?
                  }
                </div>
              </div>
              <div>
                <div>{t('Supplied (siskas)')}</div>
                <div>
                  {
                    myLiquidityProvision?.node.commitmentAmount ?? '-' // TODO is this the correct supplied? how do we format it?
                  }
                </div>
              </div>
              <div>
                <div>{t('Created')}</div>
                <div>
                  {myLiquidityProvision?.node.createdAt
                    ? getDateTimeFormat().format(
                        new Date(myLiquidityProvision.node.createdAt)
                      )
                    : '-'}
                </div>
              </div>
              <div>
                <div>{t('Updated')}</div>
                <div>
                  {myLiquidityProvision?.node.updatedAt
                    ? getDateTimeFormat().format(
                        new Date(myLiquidityProvision.node.updatedAt)
                      )
                    : '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-[50vh]">
          <div className="text-ui font-bold text-black dark:text-white mt-10">
            {t('All parties')}
          </div>

          <Tabs>
            <Tab id="active" name={t('Active')}>
              <LiquidityTable
                ref={gridRef}
                decimalPlaces={data?.market?.decimalPlaces ?? 0}
                positionDecimalPlaces={data?.market?.positionDecimalPlaces ?? 0}
                data={activeEdges}
              />
            </Tab>
            <Tab id="inactive" name={t('Inactive')}>
              <LiquidityTable
                ref={gridRef}
                decimalPlaces={data?.market?.decimalPlaces ?? 0}
                positionDecimalPlaces={data?.market?.positionDecimalPlaces ?? 0}
                data={inactiveEdges}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    </AsyncRenderer>
  );
};
