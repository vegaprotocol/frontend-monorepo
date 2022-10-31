import { useEffect, useState } from 'react';
import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import { Schema } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';
import { timeInForceLabel } from '@vegaprotocol/orders';
import type { DealTicketErrorMessage } from './deal-ticket-error';
import { DealTicketError } from './deal-ticket-error';

interface TimeInForceSelectorProps {
  value: Schema.OrderTimeInForce;
  orderType: Schema.OrderType;
  onSelect: (tif: Schema.OrderTimeInForce) => void;
  errorMessage?: DealTicketErrorMessage;
}

type PossibleOrderKeys = Exclude<
  Schema.OrderType,
  Schema.OrderType.TYPE_NETWORK
>;
type PrevSelectedValue = {
  [key in PossibleOrderKeys]: Schema.OrderTimeInForce;
};

export const TimeInForceSelector = ({
  value,
  orderType,
  onSelect,
  errorMessage,
}: TimeInForceSelectorProps) => {
  const [prevValue, setPrevValue] = useState<PrevSelectedValue>({
    [Schema.OrderType.TYPE_LIMIT]: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
    [Schema.OrderType.TYPE_MARKET]: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  });
  const options =
    orderType === Schema.OrderType.TYPE_LIMIT
      ? Object.entries(Schema.OrderTimeInForce)
      : Object.entries(Schema.OrderTimeInForce).filter(
          ([_, timeInForce]) =>
            timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_FOK ||
            timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
        );
  useEffect(() => {
    onSelect(prevValue[orderType as PossibleOrderKeys]);
  }, [onSelect, prevValue, orderType]);
  return (
    <FormGroup label={t('Time in force')} labelFor="select-time-in-force">
      <Select
        id="select-time-in-force"
        value={value}
        onChange={(e) => {
          const selectedValue = e.target.value as Schema.OrderTimeInForce;
          setPrevValue({
            ...prevValue,
            [orderType]: selectedValue,
          });
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
      />
    </FormGroup>
  );
};
