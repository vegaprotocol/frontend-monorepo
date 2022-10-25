import {
  t,
  addDecimalsFormatNumber,
  toDecimal,
  Size,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import {
  FormGroup,
  Input,
  InputError,
  Button,
  Dialog,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { Order } from '../order-data-provider';

interface OrderEditDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  order: Order;
  onSubmit: (fields: FormFields) => void;
}

interface FormFields {
  limitPrice: string;
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
  } = useForm<FormFields>({
    defaultValues: {
      limitPrice: addDecimalsFormatNumber(
        order.price,
        order.market?.decimalPlaces ?? 0
      ),
    },
  });

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
        {order.type === Schema.OrderType.TYPE_LIMIT && order.market && (
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
            {order.market && (
              <Size
                value={order.size}
                side={order.side}
                positionDecimalPlaces={order.market.positionDecimalPlaces}
              />
            )}
          </p>
        </div>
      </div>
      {order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
        order.expiresAt && (
          <div>
            <p className={headerClassName}>{t(`Expires at`)}</p>
            <p>{getDateTimeFormat().format(new Date(order.expiresAt))}</p>
          </div>
        )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        data-testid="edit-order"
        className="w-1/2 mt-4"
      >
        <FormGroup label={t('Price')} labelFor="limitPrice">
          <Input
            type="number"
            step={step}
            {...register('limitPrice', {
              required: t('You need to provide a price'),
              validate: {
                min: (value) =>
                  Number(value) > 0 ? true : t('The price cannot be negative'),
              },
            })}
            id="limitPrice"
          />
          {errors.limitPrice?.message && (
            <InputError intent="danger">{errors.limitPrice.message}</InputError>
          )}
        </FormGroup>
        <Button variant="primary" size="md" type="submit">
          {t('Update')}
        </Button>
      </form>
    </Dialog>
  );
};
