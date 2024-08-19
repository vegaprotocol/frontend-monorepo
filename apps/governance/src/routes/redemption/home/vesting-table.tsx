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
  <span className={`bg-${colour} inline-block h-4 w-4 mr-1`} />
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
            <VestingTableIndicatorSquare colour="pink" />
            {t('Locked')}
          </span>
          {formatNumber(locked)}
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-unlocked">
          <span>
            <VestingTableIndicatorSquare colour="green" />
            {t('Unlocked')}
          </span>
          {formatNumber(vested)}
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="vesting-table-staked">
          <span>
            <VestingTableIndicatorSquare colour="yellow" />
            {t('Associated')}
          </span>
          {formatNumber(associated)}
        </KeyValueTableRow>
      </KeyValueTable>
      <div className="flex border-white border">
        <div
          className="bg-pink h-4"
          style={{ flex: lockedPercentage.toNumber() }}
        />
        <div
          className="bg-green h-4"
          style={{ flex: vestedPercentage.toNumber() }}
        />
      </div>
      <div className="flex h-1 mt-1">
        <div
          className="bg-yellow h-1"
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
