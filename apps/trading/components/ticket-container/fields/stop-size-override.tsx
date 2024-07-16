import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useForm } from '../use-form';

export const StopSizeOverride = ({
  name = 'sizeOverride',
}: {
  name?: 'sizeOverride' | 'ocoSizeOverride';
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

              // TODO: convert percentage/size on change of sizeOverride
              // Changing the size override for stop orders will switch from inputting
              // a value to a percentage. It would be better here to calc the size
              // based on the percentage but clearing the field is easier for now
              form.setValue('size', 0, { shouldDirty: false });
            }}
            placeholder={t('Select')}
            data-testid="size-override"
          >
            <MiniSelectOption
              value={StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE}
            >
              {t('Amount')}
            </MiniSelectOption>
            <MiniSelectOption
              value={
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
              }
            >
              {t('Percentage')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
