import {
  TradingCheckbox as Checkbox,
  ExternalLink,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { DocsLinks } from '@vegaprotocol/environment';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const ReduceOnly = ({ disabled = false }: { disabled?: boolean }) => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="reduceOnly"
      render={({ field }) => {
        return (
          <Tooltip
            description={
              <p>
                <span>{t('ticketTooltipReduceOnly')}</span>{' '}
                <ExternalLink href={DocsLinks?.POST_REDUCE_ONLY}>
                  {t('Find out more')}
                </ExternalLink>
              </p>
            }
            underline
          >
            <div>
              <Checkbox
                checked={field.value}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  form.setValue('postOnly', false, { shouldValidate: true });
                }}
                label={t('Reduce only')}
                disabled={disabled}
              />
            </div>
          </Tooltip>
        );
      }}
    />
  );
};
