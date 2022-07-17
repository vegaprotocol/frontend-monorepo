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
              {key}
            </option>
          );
        })}
      </Select>
    </FormGroup>
  );
};
