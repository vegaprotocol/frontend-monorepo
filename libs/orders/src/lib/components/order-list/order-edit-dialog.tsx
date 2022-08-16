import {
  t,
  addDecimalsFormatNumber,
  toDecimal,
} from '@vegaprotocol/react-helpers';
import { OrderType } from '@vegaprotocol/types';
import {
  FormGroup,
  Input,
  InputError,
  Button,
  Dialog,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { OrderFields } from '../order-data-provider';

interface OrderEditDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  order: OrderFields | null;
  onSubmit: (fields: FormFields) => void;
}

interface FormFields {
  entryPrice: string;
}

export const OrderEditDialog = ({
  isOpen,
  onChange,
  order,
  onSubmit,
}: OrderEditDialogProps) => {
  const headerClassName = 'text-h5 font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: {
      entryPrice: order?.price ? order.price : '',
    },
  });

  if (!order) return null;
  const step = toDecimal(order.market?.decimalPlaces ?? 0);

  return (
    <Dialog
      open={isOpen}
      onChange={onChange}
      title={t('Edit order')}
      icon={<Icon name="edit" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {order.market && (
          <div>
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{t(`${order.market.name}`)}</p>
          </div>
        )}
        {order.type === OrderType.Limit && order.market && (
          <div>
            <p className={headerClassName}>{t(`Current price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Remaining size`)}</p>
          <p
            className={
              order.side === 'Buy'
                ? 'text-dark-green dark:text-vega-green'
                : 'text-red dark:text-vega-red'
            }
          >
            {order.side === 'Buy' ? '+' : '-'}
            {order.size}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
        <form onSubmit={handleSubmit(onSubmit)} data-testid="edit-order">
          <FormGroup label={t('Entry price')} labelFor="entryPrice">
            <Input
              type="text"
              step={step}
              {...register('entryPrice', {
                required: t('You need to provide a price'),
                min: 0,
              })}
              id="entryPrice"
            />
            {errors.entryPrice?.message && (
              <InputError intent="danger" className="mt-4">
                {errors.entryPrice.message}
              </InputError>
            )}
            {errors.entryPrice?.type === 'min' && (
              <InputError intent="danger" className="mt-4">
                {t('The price cannot be negative')}
              </InputError>
            )}
          </FormGroup>
          <Button variant="primary" type="submit">
            {t('Update')}
          </Button>
        </form>
      </div>
    </Dialog>
  );
};
