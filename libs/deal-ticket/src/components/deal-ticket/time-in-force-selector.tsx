import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';

interface TimeInForceSelectorProps {
  value: OrderTimeInForce;
  orderType: OrderType;
  onSelect: (tif: OrderTimeInForce) => void;
}

// More detail in https://docs.vega.xyz/docs/mainnet/graphql/enums/order-time-in-force
export const timeInForceLabel = (tif: string) => {
  switch (tif) {
    case OrderTimeInForce.TIME_IN_FORCE_GTC:
      return t(`Good 'til Cancelled (GTC)`);
    case OrderTimeInForce.TIME_IN_FORCE_IOC:
      return t('Immediate or Cancel (IOC)');
    case OrderTimeInForce.TIME_IN_FORCE_FOK:
      return t('Fill or Kill (FOK)');
    case OrderTimeInForce.TIME_IN_FORCE_GTT:
      return t(`Good 'til Time (GTT)`);
    case OrderTimeInForce.TIME_IN_FORCE_GFN:
      return t('Good for Normal (GFN)');
    case OrderTimeInForce.TIME_IN_FORCE_GFA:
      return t('Good for Auction (GFA)');
    default:
      return t(tif);
  }
};

export const TimeInForceSelector = ({
  value,
  orderType,
  onSelect,
}: TimeInForceSelectorProps) => {
  const options =
    orderType === OrderType.TYPE_LIMIT
      ? Object.entries(OrderTimeInForce)
      : Object.entries(OrderTimeInForce).filter(
          ([_, timeInForce]) =>
            timeInForce === OrderTimeInForce.TIME_IN_FORCE_FOK ||
            timeInForce === OrderTimeInForce.TIME_IN_FORCE_IOC
        );

  return (
    <FormGroup label={t('Time in force')} labelFor="select-time-in-force">
      <Select
        id="select-time-in-force"
        value={value}
        onChange={(e) => onSelect(e.target.value as OrderTimeInForce)}
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
