import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import {
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
} from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/react-helpers';

interface TimeInForceSelectorProps {
  value: VegaWalletOrderTimeInForce;
  orderType: VegaWalletOrderType;
  onSelect: (tif: VegaWalletOrderTimeInForce) => void;
}

// More detail in https://docs.vega.xyz/docs/mainnet/graphql/enums/order-time-in-force
export const timeInForceLabel = (tif: string) => {
  switch (tif) {
    case VegaWalletOrderTimeInForce.GTC:
      return t(`Good 'til Cancelled`);
    case VegaWalletOrderTimeInForce.IOC:
      return t('Immediate or Cancel');
    case VegaWalletOrderTimeInForce.FOK:
      return t('Fill or Kill');
    case VegaWalletOrderTimeInForce.GTT:
      return t(`Good 'til Time`);
    case VegaWalletOrderTimeInForce.GFN:
      return t('Good for Normal');
    case VegaWalletOrderTimeInForce.GFA:
      return t('Good for Auction');
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
    orderType === VegaWalletOrderType.Limit
      ? Object.entries(VegaWalletOrderTimeInForce)
      : Object.entries(VegaWalletOrderTimeInForce).filter(
          ([_, timeInForce]) =>
            timeInForce === VegaWalletOrderTimeInForce.FOK ||
            timeInForce === VegaWalletOrderTimeInForce.IOC
        );
  return (
    <FormGroup label={t('Time in force')} labelFor="select-time-in-force">
      <Select
        id="select-time-in-force"
        value={value}
        onChange={(e) => onSelect(e.target.value as VegaWalletOrderTimeInForce)}
        className="w-full"
        data-testid="order-tif"
      >
        {options.map(([key, value]) => {
          return (
            <option key={key} value={value}>
              {`${timeInForceLabel(value)} (${key})`}
            </option>
          );
        })}
      </Select>
    </FormGroup>
  );
};
