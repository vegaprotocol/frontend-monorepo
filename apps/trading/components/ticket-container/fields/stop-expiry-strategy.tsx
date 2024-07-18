import { StopOrderExpiryStrategy } from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useForm } from '../use-form';

export const StopExpiryStrategy = ({
  name = 'stopExpiryStrategy',
}: {
  name?: 'stopExpiryStrategy';
}) => {
  const t = useT();
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-secondary" htmlFor={field.name}>
              {t('Stop expiry')}
            </label>
            <MiniSelect
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('Select')}
              data-testid="order-stopExpiryStrategy"
            >
              <MiniSelectOption
                value={StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED}
              >
                {t('None')}
              </MiniSelectOption>
              <MiniSelectOption
                value={StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS}
              >
                {t('Cancels')}
              </MiniSelectOption>
              <MiniSelectOption
                value={StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT}
              >
                {t('Submit')}
              </MiniSelectOption>
            </MiniSelect>
          </div>
        );
      }}
    />
  );
};
