import React, { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderRange,
  Input,
  FormGroup,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import { DealTicketEstimates } from './deal-ticket-estimates';

interface DealTicketSizeProps {
  step: number;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number[]) => void;
  name: string;
  quoteName: string;
  price: string;
  estCloseOut: string;
  estMargin: string;
  fees: string;
  positionDecimalPlaces: number;
  notionalSize: string;
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

export const DealTicketSize = ({
  value,
  step,
  min,
  max,
  price,
  quoteName,
  onValueChange,
  estCloseOut,
  positionDecimalPlaces,
  fees,
  notionalSize,
}: DealTicketSizeProps) => {
  const sizeRatios = [0, 25, 50, 75, 100];
  const [inputValue, setInputValue] = useState(value);
  const [isInputVisible, setIsInputVisible] = useState(false);

  const onInputValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      const isLessThanMin = value < min;
      const isMoreThanMax = value > max;
      if (value) {
        if (isLessThanMin) {
          onValueChange([min]);
        } else if (isMoreThanMax) {
          onValueChange([max]);
        } else {
          onValueChange([value]);
        }
      }
      setInputValue(value);
    },
    [min, max, onValueChange, setInputValue]
  );

  const onButtonValueChange = useCallback(
    (size: number) => {
      if (isInputVisible) {
        setIsInputVisible(false);
      }
      const newVal = new BigNumber(size)
        .decimalPlaces(positionDecimalPlaces)
        .toNumber();
      onValueChange([newVal]);
      setInputValue(newVal);
    },
    [isInputVisible, onValueChange, positionDecimalPlaces]
  );

  const toggleInput = useCallback(() => {
    setIsInputVisible(!isInputVisible);
  }, [isInputVisible]);

  const onInputEnter = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.stopPropagation();
        toggleInput();
      }
    },
    [toggleInput]
  );

  return max === 0 ? (
    <p>Not enough balance to trade</p>
  ) : (
    <div>
      <div className="flex justify-between text-black dark:text-white mb-2">
        <span data-testid="min-label">{min}</span>
        <span data-testid="max-label">{max}</span>
      </div>
      <SliderRoot
        className="mb-2"
        value={[value]}
        onValueChange={onValueChange}
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
        <div className="flex items-center justify-between mb-4">
          <dt>{t('Contracts')}</dt>
          <dd className="flex justify-end w-full">
            <FormGroup
              hideLabel={true}
              label="Enter Size"
              labelFor="trade-size-input"
            >
              {isInputVisible ? (
                <div className="flex items-center">
                  <Input
                    id="input-order-size-market"
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    className="w-full"
                    value={inputValue}
                    onKeyDown={onInputEnter}
                    onChange={onInputValueChange}
                  />
                  <button
                    className="no-underline hover:underline text-blue ml-2"
                    type="button"
                    onClick={toggleInput}
                  >
                    {t('set')}
                  </button>
                </div>
              ) : (
                <button
                  className="no-underline hover:underline text-blue"
                  onClick={toggleInput}
                >
                  {value}
                </button>
              )}
            </FormGroup>
          </dd>
        </div>
      </dl>
      <DealTicketEstimates
        quoteName={quoteName}
        fees={fees}
        estCloseOut={estCloseOut}
        price={price}
        notionalSize={notionalSize}
      />
    </div>
  );
};
