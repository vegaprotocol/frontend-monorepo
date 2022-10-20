import { useEffect, useState } from 'react';
import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import { Schema } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';

interface TimeInForceSelectorProps {
  value: Schema.OrderTimeInForce;
  orderType: Schema.OrderType;
  onSelect: (tif: Schema.OrderTimeInForce) => void;
}

// More detail in https://docs.vega.xyz/docs/mainnet/graphql/enums/order-time-in-force
export const timeInForceLabel = (tif: string) => {
  switch (tif) {
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GTC:
      return t(`Good 'til Cancelled (GTC)`);
    case Schema.OrderTimeInForce.TIME_IN_FORCE_IOC:
      return t('Immediate or Cancel (IOC)');
    case Schema.OrderTimeInForce.TIME_IN_FORCE_FOK:
      return t('Fill or Kill (FOK)');
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GTT:
      return t(`Good 'til Time (GTT)`);
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GFN:
      return t('Good for Normal (GFN)');
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GFA:
      return t('Good for Auction (GFA)');
    default:
      return t(tif);
  }
};

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
    </FormGroup>
  );
};
