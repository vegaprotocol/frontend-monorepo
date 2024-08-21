import { Tooltip } from '@vegaprotocol/ui-toolkit';

import { useNetwork } from '@/contexts/network/network-context';

import { Info } from '../../../icons/info';
import { DecimalTooltip } from './decimal-tooltip';

export const locators = {
  size: 'size',
  sizeWithTooltip: 'size-with-tooltip',
};

export const SizeWithTooltip = ({
  marketId,
  size,
}: {
  marketId: string;
  size: string;
}) => {
  const { explorer } = useNetwork();

  const marketHref = `${explorer}/markets/${marketId}`;
  return (
    <span className="flex items-center" data-testid={locators.sizeWithTooltip}>
      <Tooltip
        description={
          <DecimalTooltip
            variableName="positionDecimalPlaces"
            entityLink={marketHref}
            entityText="market"
          />
        }
      >
        <span className="flex">
          <span className="mr-1" data-testid={locators.size}>
            {size}
          </span>
          <Info />
        </span>
      </Tooltip>
    </span>
  );
};
