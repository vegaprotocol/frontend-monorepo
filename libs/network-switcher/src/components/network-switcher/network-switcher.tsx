import { useForm, Controller } from 'react-hook-form';
import { Button, Select } from '@vegaprotocol/ui-toolkit';
import type { Networks } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '../../hooks';

type NetworkState = {
  network: Networks;
};

type NetworkSwitcherProps = {
  onConnect: (network: NetworkState) => void;
  onError?: () => void;
  onClose: () => void;
};

export const NetworkSwitcher = ({ onConnect }: NetworkSwitcherProps) => {
  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const { control, handleSubmit } = useForm<NetworkState>({
    defaultValues: {
      network: VEGA_ENV,
    },
  });

  return (
    <form onSubmit={handleSubmit(onConnect)}>
      <div className="py-16">
        <Controller
          name="network"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onChange={field.onChange}>
              {Object.keys(VEGA_NETWORKS).map((network) => (
                <option value={network}>{network}</option>
              ))}
            </Select>
          )}
        />
      </div>
      <div className="py-16">
        <Button data-testid="connect-network" type="submit">
          {t('Connect')}
        </Button>
      </div>
    </form>
  );
};
