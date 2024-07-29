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
  const form = useForm('stopLimit' as 'stopLimit' | 'stopMarket');

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

              const values = form.getValues();
              const isOco = name === 'ocoSizeOverride';
              const sizeFieldName = isOco ? 'ocoSize' : 'size';
              const notionalFieldName = isOco ? 'ocoNotional' : 'notional';
              const sizePctFieldName = isOco ? 'ocoSizePct' : 'sizePct';
              const sizePositionFieldName = isOco
                ? 'ocoSizePosition'
                : 'sizePosition';
              const pctValue = isOco ? values.ocoSizePct : values.sizePct;

              if (
                value ===
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
              ) {
                form.setValue(sizePositionFieldName, pctValue);
              } else {
                // TODO: would be better here to calc the actual size/notional based
                // on current slider position
                form.setValue(sizeFieldName, 0);
                form.setValue(notionalFieldName, 0);
                form.setValue(sizePctFieldName, 0);
              }
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
