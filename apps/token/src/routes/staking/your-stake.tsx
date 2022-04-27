import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '../../lib/format-number';
import type { BigNumber } from '../../lib/bignumber';

export interface YourStakeProps {
  stakeThisEpoch: BigNumber;
  stakeNextEpoch: BigNumber;
}

export const YourStake = ({
  stakeThisEpoch,
  stakeNextEpoch,
}: YourStakeProps) => {
  const { t } = useTranslation();

  return (
    <div data-testid="your-stake">
      <h2>{t('Your stake')}</h2>
      <KeyValueTable>
        <KeyValueTableRow>
          <th>{t('Your Stake On Node (This Epoch)')}</th>
          <td data-testid="stake-this-epoch">{formatNumber(stakeThisEpoch)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t('Your Stake On Node (Next Epoch)')}</th>
          <td data-testid="stake-next-epoch">{formatNumber(stakeNextEpoch)}</td>
        </KeyValueTableRow>
      </KeyValueTable>
    </div>
  );
};
