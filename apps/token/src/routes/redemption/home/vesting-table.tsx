import React from 'react';
import { useTranslation } from 'react-i18next';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';

export interface VestingTableProps {
  vested: BigNumber;
  locked: BigNumber;
  associated: BigNumber;
}

const VestingTableIndicatorSquare = ({ colour }: { colour: string }) => (
  <span className={`bg-${colour} inline-block h-12 w-12 mr-4`} />
);

export const VestingTable = ({
  vested,
  locked,
  associated,
}: VestingTableProps) => {
  const { t } = useTranslation();
  const total = React.useMemo(() => {
    return vested.plus(locked);
  }, [locked, vested]);
  const vestedPercentage = React.useMemo(() => {
    return vested.div(total).times(100);
  }, [total, vested]);
  const lockedPercentage = React.useMemo(() => {
    return locked.div(total).times(100);
  }, [total, locked]);
  const stakedPercentage = React.useMemo(() => {
    return associated.div(total).times(100);
  }, [total, associated]);
  return (
    <section data-testid="vesting-table">
      <h2>{t('Across all tranches')}</h2>
      <KeyValueTable numerical={true}>
        <KeyValueTableRow data-testid="vesting-table-total">
          <span>{t('Vesting VEGA')}</span>
          {formatNumber(total)}
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-locked">
          <span>
            <VestingTableIndicatorSquare colour="vega-pink" />
            {t('Locked')}
          </span>
          {formatNumber(locked)}
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-unlocked">
          <span>
            <VestingTableIndicatorSquare colour="vega-green" />
            {t('Unlocked')}
          </span>
          {formatNumber(vested)}
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-staked">
          <span>
            <VestingTableIndicatorSquare colour="vega-yellow" />
            {t('Associated')}
          </span>
          {formatNumber(associated)}
        </KeyValueTableRow>
      </KeyValueTable>
      <div className="flex border-white border">
        <div
          className="bg-vega-pink h-16"
          style={{ flex: lockedPercentage.toNumber() }}
        />
        <div
          className="bg-vega-green h-16"
          style={{ flex: vestedPercentage.toNumber() }}
        />
      </div>
      <div className="flex h-4 mt-4">
        <div
          className="bg-vega-yellow h-4"
          style={{ flex: stakedPercentage.toNumber() }}
        />
        <div
          className="flex"
          style={{
            flex: new BigNumber(100).minus(stakedPercentage).toNumber(),
          }}
        />
      </div>
    </section>
  );
};
