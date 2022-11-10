import { useEffect, useState } from 'react';
import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import { Schema } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';
import { timeInForceLabel } from '@vegaprotocol/orders';
import type { DealTicketErrorMessage } from './deal-ticket-error';
import { DealTicketError } from './deal-ticket-error';
import { DEAL_TICKET_SECTION } from '../constants';

interface TimeInForceSelectorProps {
  value: Schema.OrderTimeInForce;
  orderType: Schema.OrderType;
  onSelect: (tif: Schema.OrderTimeInForce) => void;
  errorMessage?: DealTicketErrorMessage;
}

type OrderType = Schema.OrderType.TYPE_MARKET | Schema.OrderType.TYPE_LIMIT;
type PreviousTimeInForce = {
  [key in OrderType]: Schema.OrderTimeInForce;
};
const DEFAULT_TIME_IN_FORCE: PreviousTimeInForce = {
  [Schema.OrderType.TYPE_MARKET]: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  [Schema.OrderType.TYPE_LIMIT]: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
};

export const TimeInForceSelector = ({
  value,
  orderType,
  onSelect,
  errorMessage,
}: TimeInForceSelectorProps) => {
  const options =
    orderType === Schema.OrderType.TYPE_LIMIT
      ? Object.entries(Schema.OrderTimeInForce)
      : Object.entries(Schema.OrderTimeInForce).filter(
          ([_, timeInForce]) =>
            timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_FOK ||
            timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
        );
  const [previousOrderType, setPreviousOrderType] = useState(
    Schema.OrderType.TYPE_MARKET
  );
  const [previousTimeInForce, setPreviousTimeInForce] =
    useState<PreviousTimeInForce>({
      ...DEFAULT_TIME_IN_FORCE,
      [orderType]: value,
    });

  useEffect(() => {
    if (previousOrderType !== orderType) {
      setPreviousOrderType(orderType);
      const prev = previousTimeInForce[orderType as OrderType];
      onSelect(prev);
    }
  }, [
    onSelect,
    orderType,
    previousTimeInForce,
    previousOrderType,
    setPreviousOrderType,
  ]);

  return (
    <FormGroup label={t('Time in force')} labelFor="select-time-in-force">
      <Select
        id="select-time-in-force"
        value={value}
        onChange={(e) => {
          setPreviousTimeInForce({
            ...previousTimeInForce,
            [orderType]: e.target.value,
          });
          onSelect(e.target.value as Schema.OrderTimeInForce);
        }}
        className="w-full"
        data-testid="order-tif"
      >
        {options.map(([key, value]) => (
          <option key={key} value={value}>
            {timeInForceLabel(value)}
          </option>
        ))}
      </Select>
      <DealTicketError
        errorMessage={errorMessage}
        data-testid="dealticket-error-message-force"
        section={DEAL_TICKET_SECTION.FORCE}
      />
    </FormGroup>
  );
};
