import { useState } from 'react';
import {
  VegaIcon,
  VegaIconNames,
  TradingDropdown,
  TradingDropdownTrigger,
  TradingDropdownContent,
  TradingDropdownItem,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export const OrderbookControls = ({
  lastTradedPrice,
  resolution,
  decimalPlaces,
  setResolution,
}: {
  lastTradedPrice: string;
  resolution: number;
  decimalPlaces: number;
  setResolution: (resolution: number) => void;
}) => {
  const [isOpen, setOpen] = useState(false);

  const resolutions = createResolutions(lastTradedPrice, decimalPlaces);

  const increaseResolution = () => {
    const index = resolutions.indexOf(resolution);
    if (index < resolutions.length - 1) {
      setResolution(resolutions[index + 1]);
    }
  };

  const decreaseResolution = () => {
    const index = resolutions.indexOf(resolution);
    if (index > 0) {
      setResolution(resolutions[index - 1]);
    }
  };

  return (
    <div className="flex h-6">
      <button
        onClick={increaseResolution}
        disabled={resolutions.indexOf(resolution) >= resolutions.length - 1}
        className="flex items-center px-2 border-r cursor-pointer border-default disabled:cursor-default"
        data-testid="plus-button"
      >
        <VegaIcon size={12} name={VegaIconNames.PLUS} />
      </button>
      <TradingDropdown
        open={isOpen}
        onOpenChange={(open) => setOpen(open)}
        trigger={
          <TradingDropdownTrigger data-testid="resolution">
            <button
              className="flex items-center justify-between px-2 gap-1"
              style={{
                minWidth: `${
                  Math.max.apply(
                    null,
                    resolutions.map(
                      (item) => formatResolution(item, decimalPlaces).length
                    )
                  ) + 5
                }ch`,
              }}
            >
              <VegaIcon
                size={12}
                name={
                  isOpen ? VegaIconNames.CHEVRON_UP : VegaIconNames.CHEVRON_DOWN
                }
              />
              {formatResolution(resolution, decimalPlaces)}
            </button>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent align="start">
          {resolutions.map((r) => (
            <TradingDropdownItem
              key={r}
              onClick={() => setResolution(r)}
              className="justify-end"
            >
              {formatResolution(r, decimalPlaces)}
            </TradingDropdownItem>
          ))}
        </TradingDropdownContent>
      </TradingDropdown>
      <button
        onClick={decreaseResolution}
        disabled={resolutions.indexOf(resolution) <= 0}
        className="flex items-center px-2 cursor-pointer border-x border-default disabled:cursor-default"
        data-testid="minus-button"
      >
        <VegaIcon size={12} name={VegaIconNames.MINUS} />
      </button>
    </div>
  );
};

export const formatResolution = (r: number, decimalPlaces: number) => {
  let num = addDecimalsFormatNumber(r, decimalPlaces);

  // Remove trailing zeroes
  num = num.replace(/\.?0+$/, '');

  return num;
};

/**
 * Create a list of resolutions based on the largest and smallest
 * possible values using the last traded price and the market
 * decimal places
 */
export const createResolutions = (
  lastTradedPrice: string,
  decimalPlaces: number
) => {
  // number of levels determined by either the number
  // of digits in the last traded price OR the number of decimal
  // places. For example:
  //
  // last traded = 1 (0.001)
  // dps = 3
  // result = 3
  //
  // last traded = 100001 (1000.01
  // dps = 2
  // result = 6
  const levelCount = Math.max(lastTradedPrice.length ?? 0, decimalPlaces + 1);
  const generatedResolutions = new Array(levelCount)
    .fill(null)
    .map((_, i) => Math.pow(10, i));
  const customResolutions = [2, 5, 20, 50, 200, 500];
  const combined = customResolutions.concat(generatedResolutions);
  combined.sort((a, b) => a - b);

  // Remove any resolutions higher than the generated ones as
  // we dont want a custom resolution higher than necessary
  const resolutions = combined.filter((r) => {
    return r <= generatedResolutions[generatedResolutions.length - 1];
  });

  return resolutions;
};
