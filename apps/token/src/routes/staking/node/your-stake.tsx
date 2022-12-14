import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '../../../lib/format-number';
import { SubHeading } from '../../../components/heading';
import type { BigNumber } from '../../../lib/bignumber';

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
      <SubHeading title={t('Your stake')} />
      <RoundedWrapper>
        <KeyValueTable>
          <KeyValueTableRow>
            {t('Your Stake On Node (This Epoch)')}
            <span data-testid="stake-this-epoch">
              {formatNumber(stakeThisEpoch)}
            </span>
          </KeyValueTableRow>
          <KeyValueTableRow noBorder={true}>
            {t('Your Stake On Node (Next Epoch)')}
            <span data-testid="stake-next-epoch">
              {formatNumber(stakeNextEpoch)}
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>
    </div>
  );
};
