import {
  t,
  addDecimalsFormatNumber,
  toDecimal,
  Size,
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
  order: OrderFields;
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
  const headerClassName = 'text-lg font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>();

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
            <p>{t(`${order.market.tradableInstrument.instrument.name}`)}</p>
          </div>
        )}
        {order.type === OrderType.TYPE_LIMIT && order.market && (
          <div>
            <p className={headerClassName}>{t(`Current price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Size`)}</p>
          <p>
            {
              <Size
                value={order.size}
                side={order.side}
                positionDecimalPlaces={order.market.positionDecimalPlaces}
              />
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
        <form onSubmit={handleSubmit(onSubmit)} data-testid="edit-order">
          <FormGroup label={t('Entry price')} labelFor="entryPrice">
            <Input
              type="number"
              step={step}
              {...register('entryPrice', {
                required: t('You need to provide a price'),
                validate: {
                  min: (value) =>
                    Number(value) > 0
                      ? true
                      : t('The price cannot be negative'),
                },
              })}
              id="entryPrice"
            />
            {errors.entryPrice?.message && (
              <InputError intent="danger">
                {errors.entryPrice.message}
              </InputError>
            )}
          </FormGroup>
          <Button variant="primary" size="md" type="submit">
            {t('Update')}
          </Button>
        </form>
      </div>
    </Dialog>
  );
};
