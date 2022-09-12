import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import { AgPriceCell } from './price-cell';
import classNames from 'classnames';

export enum VolumeType {
  bid,
  ask,
}
export interface VolProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
  relativeValue?: number;
  type: VolumeType;
  testId?: string;
}
export interface AgVolCellProps extends ICellRendererParams {
  value: number | bigint | null | undefined;
  valueFormatted: Omit<VolProps, 'value'>;
}

export const BID_COLOR = 'darkgreen';
export const ASK_COLOR = 'maroon';

export const Vol = React.memo(
  ({ value, valueFormatted, relativeValue, type, testId }: VolProps) => {
    if ((!value && value !== 0) || isNaN(Number(value))) {
      return <div data-testid="vol">-</div>;
    }
    return (
      <div className="relative" data-testid={testId || 'vol'}>
        <div
          className={classNames(
            'h-full absolute top-0 opacity-40 dark:opacity-100',
            {
              'left-0': type === VolumeType.bid,
              'right-0': type === VolumeType.ask,
            }
          )}
          style={{
            width: relativeValue ? `${relativeValue}%` : '0%',
            backgroundColor: type === VolumeType.bid ? BID_COLOR : ASK_COLOR,
          }}
        ></div>
        <AgPriceCell value={value} valueFormatted={valueFormatted} />
      </div>
    );
  }
);

Vol.displayName = 'Vol';

export const AgVolume = ({ value, valueFormatted }: AgVolCellProps) => (
  <Vol value={value} {...valueFormatted} />
);

AgVolume.displayName = 'AgVolume';
