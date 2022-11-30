import { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useAppState } from '../../../../contexts/app-state/app-state-context';
import {
  defaultColDef,
  NODE_LIST_GRID_STYLES,
  stakedTotalPercentage,
  totalPenalties,
  ValidatorFields,
  ValidatorRenderer,
} from './shared';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { ValidatorsTableProps } from './shared';
import { formatNumber, toBigNum } from '@vegaprotocol/react-helpers';

interface StandbyPendingValidatorsTableProps extends ValidatorsTableProps {
  stakeNeededForPromotion: string | undefined;
}

export const StandbyPendingValidatorsTable = ({
  data,
  previousEpochData,
  totalStake,
  stakeNeededForPromotion,
}: StandbyPendingValidatorsTableProps) => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const navigate = useNavigate();

  const gridRef = useRef<AgGridReact | null>(null);

  const nodes = useMemo(() => {
    if (!data) return [];

    return data.map(
      ({
        id,
        name,
        avatarUrl,
        stakedTotal,
        rankingScore: { stakeScore, performanceScore },
        pendingStake,
      }) => {
        let individualStakeNeededForPromotion = undefined;

        if (stakeNeededForPromotion) {
          const stakedTotalBigNum = toBigNum(stakedTotal, 0);
          const stakeNeededBigNum = toBigNum(stakeNeededForPromotion, 0);
          const performanceScoreBigNum = toBigNum(performanceScore, 0);

          const calc = stakeNeededBigNum
            .dividedBy(performanceScoreBigNum)
            .minus(stakedTotalBigNum);

          individualStakeNeededForPromotion = calc.isGreaterThan(0)
            ? calc.toString()
            : '0';
        }

        return {
          id,
          [ValidatorFields.VALIDATOR]: {
            avatarUrl,
            name,
          },
          [ValidatorFields.STAKE]: formatNumber(
            toBigNum(stakedTotal, decimals),
            2
          ),
          [ValidatorFields.STAKE_NEEDED_FOR_PROMOTION]:
            individualStakeNeededForPromotion || t('n/a'),
          [ValidatorFields.STAKE_SHARE]: stakedTotalPercentage(stakeScore),
          [ValidatorFields.TOTAL_PENALTIES]: totalPenalties(
            previousEpochData,
            id,
            performanceScore,
            stakedTotal,
            totalStake
          ),
          [ValidatorFields.PENDING_STAKE]: formatNumber(
            toBigNum(pendingStake, decimals),
            2
          ),
        };
      }
    );
  }, [
    data,
    decimals,
    previousEpochData,
    stakeNeededForPromotion,
    t,
    totalStake,
  ]);

  const StandbyPendingTable = forwardRef<AgGridReact>((_, gridRef) => {
    const colDefs = useMemo<ColDef[]>(
      () => [
        {
          field: ValidatorFields.VALIDATOR,
          headerName: t(ValidatorFields.VALIDATOR).toString(),
          cellRenderer: ValidatorRenderer,
          comparator: ({ name: a }, { name: b }) => Math.sign(a - b),
          pinned: 'left',
          width: 240,
        },
        {
          field: ValidatorFields.STAKE,
          headerName: t(ValidatorFields.STAKE).toString(),
          width: 120,
        },
        {
          field: ValidatorFields.STAKE_NEEDED_FOR_PROMOTION,
          headerName: t(ValidatorFields.STAKE_NEEDED_FOR_PROMOTION).toString(),
          width: 210,
          sort: 'asc',
        },
        {
          field: ValidatorFields.STAKE_SHARE,
          headerName: t(ValidatorFields.STAKE_SHARE).toString(),
          width: 100,
        },
        {
          field: ValidatorFields.TOTAL_PENALTIES,
          headerName: t(ValidatorFields.TOTAL_PENALTIES).toString(),
          width: 120,
        },
        {
          field: ValidatorFields.PENDING_STAKE,
          headerName: t(ValidatorFields.PENDING_STAKE).toString(),
          width: 110,
        },
      ],
      []
    );

    return (
      <div data-testid="standby-pending-validators-table">
        <AgGrid
          domLayout="autoHeight"
          style={{ width: '100%' }}
          customThemeParams={NODE_LIST_GRID_STYLES}
          rowHeight={52}
          defaultColDef={defaultColDef}
          animateRows={true}
          suppressCellFocus={true}
          overlayNoRowsTemplate={t('noValidators')}
          ref={gridRef}
          rowData={nodes}
          columnDefs={colDefs}
          onCellClicked={(event) => {
            navigate(event.data.id);
          }}
        />
      </div>
    );
  });

  return <StandbyPendingTable ref={gridRef} />;
};
