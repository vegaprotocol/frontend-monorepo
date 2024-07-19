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
            onValueChange={(value) => {
              field.onChange(value);

              // Switch the opposite order direction
              const fieldName =
                name === 'triggerDirection'
                  ? 'ocoTriggerDirection'
                  : 'triggerDirection';

              const fieldValue =
                value ===
                StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
                  ? StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
                  : StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE;
              form.setValue(fieldName, fieldValue);
            }}
            placeholder={t('Select')}
            data-testid="trigger-direction"
          >
            <MiniSelectOption
              value={StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE}
              data-testid="triggerDirection-risesAbove"
            >
              {t('Rises above')}
            </MiniSelectOption>
            <MiniSelectOption
              value={StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW}
              data-testid="triggerDirection-fallsBelow"
            >
              {t('Falls below')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
