import {
  TradingCheckbox as Checkbox,
  ExternalLink,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { DocsLinks } from '@vegaprotocol/environment';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const PostOnly = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="postOnly"
      render={({ field }) => {
        return (
          <Tooltip
            description={
              <p>
                <span>{t('ticketTooltipPostOnly')}</span>{' '}
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
                  form.setValue('reduceOnly', false, { shouldValidate: true });
                }}
                label={t('Post only')}
              />
            </div>
          </Tooltip>
        );
      }}
    />
  );
};
