import React, { useCallback, useState } from 'react';
import { BigNumber } from 'bignumber.js';
import { t } from '@vegaprotocol/react-helpers';
import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderRange,
  FormGroup,
} from '@vegaprotocol/ui-toolkit';
import { InputSetter } from '../input-setter';

interface DealTicketSizeInputProps {
  step: number;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  positionDecimalPlaces: number;
}

const getSizeLabel = (value: number): string => {
  const MIN_LABEL = 'Min';
  const MAX_LABEL = 'Max';
  if (value === 0) {
    return MIN_LABEL;
  } else if (value === 100) {
    return MAX_LABEL;
  }

  return `${value}%`;
};

export const DealTicketSizeInput = ({
  value,
  step,
  min,
  max,
  onValueChange,
  positionDecimalPlaces,
}: DealTicketSizeInputProps) => {
  const sizeRatios = [0, 25, 50, 75, 100];
  const [inputValue, setInputValue] = useState(value);

  const onInputValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = parseFloat(event.target.value);
      const isLessThanMin = value < min;
      const isMoreThanMax = value > max;
      if (isLessThanMin) {
        value = min;
      } else if (isMoreThanMax) {
        value = max;
      }

      if (value) {
        onValueChange(value);
      }

      setInputValue(value);
    },
    [min, max, onValueChange, setInputValue]
  );

  const onButtonValueChange = (size: number) => {
    const newVal = new BigNumber(size)
      .decimalPlaces(positionDecimalPlaces)
      .toNumber();
    onValueChange(newVal);
    setInputValue(newVal);
  };

  const onSliderValueChange = useCallback(
    (value: number[]) => {
      const val = value[0];
      setInputValue(val);
      onValueChange(val);
    },
    [onValueChange]
  );

  return (
    <div>
      <div className="flex justify-between text-black dark:text-white mb-2">
        <span data-testid="min-label">{min}</span>
        <span data-testid="max-label">{max}</span>
      </div>
      <SliderRoot
        className="mb-2"
        value={[value]}
        onValueChange={onSliderValueChange}
        step={step}
        min={min}
        max={max}
      >
        <SliderTrack className="bg-lightGrey dark:bg-offBlack">
          <SliderRange className="!bg-black dark:!bg-white" />
        </SliderTrack>
        <SliderThumb />
      </SliderRoot>

      <div
        data-testid="percentage-selector"
        className="flex w-full justify-between text-black dark:text-white mb-6"
      >
        {sizeRatios.map((size, index) => {
          const proportionalSize = size ? (size / 100) * max : min;
          return (
            <button
              className="no-underline hover:underline text-blue"
              onClick={() => onButtonValueChange(proportionalSize)}
              type="button"
              key={index}
            >
              {getSizeLabel(size)}
            </button>
          );
        })}
      </div>

      <dl className="text-black dark:text-white">
        <div className="flex items-center justify-between">
          <dt>{t('Contracts')}</dt>
          <dd className="flex justify-end w-full">
            <FormGroup
              hideLabel={true}
              label="Enter Size"
              labelFor="trade-size-input"
              className="mb-1"
            >
              <InputSetter
                id="input-order-size-market"
                type="number"
                step={step}
                min={min}
                max={max}
                className="w-full"
                value={inputValue}
                onChange={onInputValueChange}
              >
                {inputValue}
              </InputSetter>
            </FormGroup>
          </dd>
        </div>
      </dl>
    </div>
  );
};
