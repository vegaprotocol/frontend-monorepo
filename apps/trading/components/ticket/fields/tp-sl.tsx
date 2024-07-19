import { TradingCheckbox as Checkbox, Tooltip } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const TpSl = ({ name = 'tpSl' }: { name?: 'tpSl' }) => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <Tooltip description={t('ticketTooltipTPSL')}>
            <div>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t('Add TP/SL')}
                name={name}
              />
            </div>
          </Tooltip>
        );
      }}
    />
  );
};
