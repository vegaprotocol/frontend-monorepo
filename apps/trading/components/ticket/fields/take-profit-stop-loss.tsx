import { TradingCheckbox as Checkbox, Tooltip } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';
import { tooltipProps } from '../constants';

export const TakeProfitStopLoss = ({ name = 'tpSl' }: { name?: 'tpSl' }) => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <Tooltip
            {...tooltipProps}
            description={t('ticketTooltipTPSL')}
            underline
          >
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
