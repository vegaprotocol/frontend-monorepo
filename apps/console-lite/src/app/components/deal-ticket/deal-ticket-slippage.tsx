import React, { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import {
  Dialog,
  Icon,
  Intent,
  Tooltip,
  TrafficLight,
} from '@vegaprotocol/ui-toolkit';
import { InputSetter } from '../../components/input-setter';
import { IconNames } from '@blueprintjs/icons';
import {
  DataTitle,
  ValueTooltipRow,
  EST_SLIPPAGE,
} from '@vegaprotocol/deal-ticket';

interface DealTicketSlippageProps {
  step?: number;
  min?: number;
  max?: number;
  value: number;
  onValueChange(value: number): void;
}

export const DealTicketSlippage = ({
  value,
  step = 0.01,
  min = 0,
  max = 50,
  onValueChange,
}: DealTicketSlippageProps) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const numericValue = parseFloat(value);
      onValueChange(numericValue);
    },
    [onValueChange]
  );

  const toggleDialog = useCallback(() => {
    setIsDialogVisible(!isDialogVisible);
  }, [isDialogVisible]);

  const formLabel = (
    <label className="flex items-center mb-1">
      <span className="mr-1">{t('Adjust slippage tolerance')}</span>
      <Tooltip align="center" description={EST_SLIPPAGE}>
        <div className="cursor-help" tabIndex={-1}>
          <Icon
            name={IconNames.ISSUE}
            className="block rotate-180"
            ariaLabel={EST_SLIPPAGE}
          />
        </div>
      </Tooltip>
    </label>
  );

  return (
    <>
      <Dialog
        open={isDialogVisible}
        onChange={toggleDialog}
        intent={Intent.None}
        title={t('Transaction Settings')}
      >
        <div data-testid="slippage-dialog">
          {formLabel}
          <InputSetter
            id="input-order-slippage"
            isInputVisible
            hasError={!value}
            type="number"
            step={step}
            min={min}
            max={max}
            className="w-full"
            value={value}
            onChange={onChange}
          >
            {value}%
          </InputSetter>
        </div>
      </Dialog>
      <dl className="text-black dark:text-white">
        <div className="flex justify-between mb-2">
          <DataTitle>{t('Est. Price Impact / Slippage')}</DataTitle>
          <div className="flex">
            <div className="mr-1">
              <ValueTooltipRow description={EST_SLIPPAGE}>
                <TrafficLight value={value} q1={1} q2={5}>
                  {value}%
                </TrafficLight>
              </ValueTooltipRow>
            </div>
            <button type="button" onClick={toggleDialog}>
              <Icon
                name={IconNames.COG}
                className="block rotate-180"
                ariaLabel={t('Override slippage value')}
              />
            </button>
          </div>
        </div>
      </dl>
    </>
  );
};
