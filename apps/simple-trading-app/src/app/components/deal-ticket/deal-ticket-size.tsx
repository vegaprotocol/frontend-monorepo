import React, { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderRange,
  Button,
  Input,
  FormGroup,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';

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
  positionDecimalPlaces: number;
  marketDecimalPlaces: number;
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
  marketDecimalPlaces,
}: DealTicketSizeProps) => {
  const sizeRatios = [0, 25, 50, 75, 100];
  const [inputValue, setInputValue] = useState(value);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const notionalSize = new BigNumber(price)
    .multipliedBy(value)
    .decimalPlaces(marketDecimalPlaces)
    .toFormat(marketDecimalPlaces);

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
      <div className="flex justify-between text-black dark:text-white mb-8">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <SliderRoot
        className="mb-8"
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
        className="flex w-full justify-between text-black dark:text-white mb-32"
      >
        {sizeRatios.map((size, index) => {
          const proportionalSize = size ? (size / 100) * max : min;
          return (
            <Button
              variant="inline-link"
              className="no-underline !text-blue"
              onClick={() => onButtonValueChange(proportionalSize)}
              key={index}
            >
              {getSizeLabel(size)}
            </Button>
          );
        })}
      </div>

      <dl className="text-black dark:text-white">
        <div className="flex items-center justify-between mb-8">
          <dt>{t('Contracts')}</dt>
          <dd className="flex justify-end w-full">
            <FormGroup
              className="mb-0 flex items-center"
              labelClassName="mr-8 sr-only"
              label="Enter Size"
              labelFor="trade-size-input"
            >
              {isInputVisible ? (
                <>
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
                  <Button
                    variant="inline-link"
                    className="no-underline !text-blue"
                    onClick={toggleInput}
                  >
                    {t('set')}
                  </Button>
                </>
              ) : (
                <Button
                  variant="inline-link"
                  className="no-underline !text-blue"
                  onClick={toggleInput}
                >
                  {value}
                </Button>
              )}
            </FormGroup>
          </dd>
        </div>
        <div className="flex justify-between mb-8">
          <dt>{t('Est. price')}</dt>
          <dd>{price}</dd>
        </div>
        <div className="flex justify-between mb-8">
          <dt>
            <span>{t('Est. Position Size')}</span>
            &nbsp;
            <small>({quoteName})</small>
          </dt>
          <dd>{notionalSize}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t('Est. close out')}</dt>
          <dd>{estCloseOut}</dd>
        </div>
      </dl>
    </div>
  );
};
