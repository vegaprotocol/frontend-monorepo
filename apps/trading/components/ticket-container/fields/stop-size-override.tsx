import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';

export const StopSizeOverride = ({
  control,
  name = 'sizeOverride',
}: {
  control: Control<any>;
  name?: string;
}) => {
  const t = useT();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <MiniSelect
            value={field.value}
            onValueChange={field.onChange}
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
