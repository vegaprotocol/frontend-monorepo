import { TradingCheckbox as Checkbox, Tooltip } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const TpSl = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="tpSl"
      render={({ field }) => {
        return (
          <Tooltip description={t('ticketTooltipTPSL')} underline>
            <div>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t('TP/SL')}
              />
            </div>
          </Tooltip>
        );
      }}
    />
  );
};
