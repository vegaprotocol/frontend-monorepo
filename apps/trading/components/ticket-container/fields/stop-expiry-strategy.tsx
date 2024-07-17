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
          <MiniSelect
            value={field.value}
            onValueChange={field.onChange}
            placeholder={t('Expiry strategy')}
            data-testid="field-stopExpiryStrategy"
          >
            <MiniSelectOption
              value={StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS}
            >
              {t('Cancel')}
            </MiniSelectOption>
            <MiniSelectOption
              value={StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT}
            >
              {t('Submit')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
