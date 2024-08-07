import { Tooltip } from '@vegaprotocol/ui-toolkit';

import { useNetwork } from '@/contexts/network/network-context';

import { Info } from '../../../icons/info';
import { DecimalTooltip } from './decimal-tooltip';

export const locators = {
  price: 'price',
  priceWithTooltip: 'price-with-tooltip',
};

export const PriceWithTooltip = ({
  marketId,
  price,
}: {
  marketId: string;
  price: string;
}) => {
  const { network } = useNetwork();

  const marketHref = `${network.explorer}/markets/${marketId}`;
  return (
    <span className="flex items-center" data-testid={locators.priceWithTooltip}>
      <Tooltip
        description={
          <DecimalTooltip
            variableName="decimals"
            entityLink={marketHref}
            entityText="market"
          />
        }
      >
        <span className="flex">
          <span className="mr-1" data-testid={locators.price}>
            {price}
          </span>
          <Info />
        </span>
      </Tooltip>
    </span>
  );
};
