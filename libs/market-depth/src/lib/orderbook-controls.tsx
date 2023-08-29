import { useState } from 'react';
import {
  VegaIcon,
  VegaIconNames,
  TradingDropdown,
  TradingDropdownTrigger,
  TradingDropdownContent,
  TradingDropdownItem,
} from '@vegaprotocol/ui-toolkit';
import { formatNumberFixed } from '@vegaprotocol/utils';

export const OrderbookControls = ({
  midPrice,
  resolution,
  decimalPlaces,
  setResolution,
}: {
  midPrice: string | undefined;
  resolution: number;
  decimalPlaces: number;
  setResolution: (resolution: number) => void;
}) => {
  const [isOpen, setOpen] = useState(false);

  const resolutions = new Array(
    Math.max(midPrice?.toString().length ?? 0, decimalPlaces + 1)
  )
    .fill(null)
    .map((v, i) => Math.pow(10, i));

  const formatResolution = (r: number) => {
    return formatNumberFixed(
      Math.log10(r) - decimalPlaces > 0
        ? Math.pow(10, Math.log10(r) - decimalPlaces)
        : 0,
      decimalPlaces - Math.log10(r)
    );
  };

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
        className="flex items-center px-2 border-r cursor-pointer border-default"
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
              className="flex items-center px-2 text-left gap-1"
              style={{
                minWidth: `${
                  Math.max.apply(
                    null,
                    resolutions.map((item) => formatResolution(item).length)
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
              {formatResolution(resolution)}
            </button>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent align="start">
          {resolutions.map((r) => (
            <TradingDropdownItem key={r} onClick={() => setResolution(r)}>
              {formatResolution(r)}
            </TradingDropdownItem>
          ))}
        </TradingDropdownContent>
      </TradingDropdown>
      <button
        onClick={decreaseResolution}
        disabled={resolutions.indexOf(resolution) <= 0}
        className="flex items-center px-2 cursor-pointer border-x border-default"
        data-testid="minus-button"
      >
        <VegaIcon size={12} name={VegaIconNames.MINUS} />
      </button>
    </div>
  );
};
