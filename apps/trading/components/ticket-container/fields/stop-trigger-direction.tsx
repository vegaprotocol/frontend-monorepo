import { FormField } from '../ticket-field';
import { StopOrderTriggerDirection } from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const StopTriggerDirection = ({
  name = 'triggerDirection',
}: {
  name?: 'triggerDirection' | 'ocoTriggerDirection';
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
            placeholder={t('Select')}
            data-testid="trigger-direction"
          >
            <MiniSelectOption
              value={StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE}
              id="triggerDirection-risesAbove"
            >
              {t('Rises above')}
            </MiniSelectOption>
            <MiniSelectOption
              value={StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW}
              id="triggerDirection-fallsBelow"
            >
              {t('Falls below')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
