import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useForm } from '../use-form';

export const StopExpiryStrategy = () => {
  const t = useT();
  const form = useForm();
  const oco = form.watch('oco');

  const options = oco ? (
    <>
      <MiniSelectOption value="none">{t('None')}</MiniSelectOption>
      <MiniSelectOption value="cancel">{t('Cancel')}</MiniSelectOption>
      <MiniSelectOption value="ocoTriggerAbove">
        {t('Trigger above')}
      </MiniSelectOption>
      <MiniSelectOption value={'ocoTriggerBelow'}>
        {t('Trigger below')}
      </MiniSelectOption>
    </>
  ) : (
    <>
      <MiniSelectOption value={'none'}>{t('None')}</MiniSelectOption>
      <MiniSelectOption value={'cancel'}>{t('Cancel')}</MiniSelectOption>
      <MiniSelectOption value={'trigger'}>{t('Trigger')}</MiniSelectOption>
    </>
  );

  return (
    <FormField
      control={form.control}
      name="stopExpiryStrategy"
      render={({ field }) => {
        return (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-surface-0-fg-muted" htmlFor={field.name}>
              {t('Stop expiry')}
            </label>
            <MiniSelect
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('Select')}
              data-testid="order-stopExpiryStrategy"
            >
              {options}
            </MiniSelect>
          </div>
        );
      }}
    />
  );
};
