import {
  TradingCheckbox as Checkbox,
  ExternalLink,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { DocsLinks } from '@vegaprotocol/environment';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const Iceberg = ({ name = 'iceberg' }: { name?: 'iceberg' }) => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <Tooltip
            description={
              <p>
                <span>{t('ticketTooltipIceberg')}</span>{' '}
                <ExternalLink href={DocsLinks?.ICEBERG_ORDERS}>
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
                }}
                label={t('Iceberg')}
                name={name}
              />
            </div>
          </Tooltip>
        );
      }}
    />
  );
};
