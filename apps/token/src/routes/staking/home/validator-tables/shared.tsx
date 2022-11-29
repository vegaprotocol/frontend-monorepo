import compact from 'lodash/compact';
import { toBigNum } from '@vegaprotocol/react-helpers';
import type { NodesFragmentFragment } from '../__generated___/Nodes';
import type { PreviousEpochQuery } from '../__generated___/PreviousEpoch';
import React from 'react';

export enum ValidatorFields {
  VALIDATOR = 'validator',
  STAKE = 'stake',
  PENDING_STAKE = 'pendingStake',
  STAKE_SHARE = 'stakeShare',
  TOTAL_PENALTIES = 'totalPenalties',
  NORMALISED_VOTING_POWER = 'normalisedVotingPower',
  STAKE_NEEDED_FOR_PROMOTION = 'stakeNeededForPromotion',
}

export interface ValidatorsTableProps {
  data: NodesFragmentFragment[] | undefined;
  previousEpochData: PreviousEpochQuery | undefined;
  totalStake: string;
}

// Custom styling to account for the scrollbar. This is needed because the
// AG Grid places the scrollbar over the bottom validator, which obstructs
export const nodeListGridStyles = `
  .ag-theme-balham-dark .ag-body-horizontal-scroll {
    opacity: 0.75;
  }
  .ag-theme-balham-dark *:hover {
    cursor: pointer;
  }
`;

export const stakedTotalPercentage = (stakeScore: string) =>
  toBigNum(stakeScore, 0).times(100).dp(2).toString() + '%';

export const totalPenalties = (
  previousEpochData: PreviousEpochQuery | undefined,
  id: string,
  performanceScore: string,
  stakedTotal: string,
  totalStake: string
) => {
  const rawValidatorScore = previousEpochData
    ? compact(
        previousEpochData.epoch?.validatorsConnection?.edges?.map(
          (edge) => edge?.node
        )
      ).find((validator) => validator?.id === id)?.rewardScore
        ?.rawValidatorScore
    : null;

  const totalPenaltiesCalc =
    rawValidatorScore !== null
      ? 100 *
        Math.max(
          0,
          1 -
            (Number(performanceScore) * Number(rawValidatorScore)) /
              (Number(stakedTotal) / Number(totalStake || 0))
        )
      : 0;

  return toBigNum(totalPenaltiesCalc, 0).dp(2).toString() + '%';
};

export const defaultColDef = {
  sortable: true,
  resizable: true,
  autoHeight: true,
  comparator: (a: string, b: string) => parseFloat(a) - parseFloat(b),
  cellStyle: { margin: '10px 0' },
};

interface ValidatorRendererProps {
  data: { validator: { avatarUrl: string; name: string } };
}

export const ValidatorRenderer = ({ data }: ValidatorRendererProps) => {
  const { avatarUrl, name } = data.validator;
  return (
    <div className="flex items-center">
      {avatarUrl && (
        <img
          className="h-6 w-6 rounded-full mr-2"
          src={avatarUrl}
          alt={`Avatar icon for ${name}`}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      {name}
    </div>
  );
};
