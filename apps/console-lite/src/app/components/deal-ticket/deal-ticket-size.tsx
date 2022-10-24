import { DealTicketEstimates } from '@vegaprotocol/deal-ticket';
import { DealTicketSizeInput } from './deal-ticket-size-input';

interface DealTicketSizeProps {
  step: number;
  min: number;
  max: number;
  size: number;
  onSizeChange: (value: number) => void;
  name: string;
  quoteName: string;
  price: string;
  estCloseOut: string;
  estMargin: string;
  fees: string;
  positionDecimalPlaces: number;
  notionalSize: string;
}

export const DealTicketSize = ({
  step,
  min,
  max,
  price,
  quoteName,
  size,
  onSizeChange,
  estCloseOut,
  positionDecimalPlaces,
  fees,
  notionalSize,
}: DealTicketSizeProps) => {
  return max === 0 ? (
    <p>Not enough balance to trade</p>
  ) : (
    <div>
      <DealTicketSizeInput
        step={step}
        min={min}
        max={max}
        value={size}
        onValueChange={onSizeChange}
        positionDecimalPlaces={positionDecimalPlaces}
      />
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
