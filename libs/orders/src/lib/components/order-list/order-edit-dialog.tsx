import {
  t,
  addDecimalsFormatNumber,
  toDecimal,
  Size,
  getDateTimeFormat,
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
import type { Market } from '@vegaprotocol/market-list';
import { OrderTimeInForce } from '@vegaprotocol/types';
import { useForm } from 'react-hook-form';
import type { Orders_party_ordersConnection_edges_node } from '../order-data-provider';

interface OrderEditDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  order: Orders_party_ordersConnection_edges_node;
  onSubmit: (fields: FormFields) => void;
  market: Market;
}

interface FormFields {
  entryPrice: string;
}

export const OrderEditDialog = ({
  isOpen,
  onChange,
  order,
  onSubmit,
  market,
}: OrderEditDialogProps) => {
  const headerClassName = 'text-lg font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>();

  const step = toDecimal(market.decimalPlaces);

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
            <p>{t(`${market.tradableInstrument.instrument.name}`)}</p>
          </div>
        )}
        {order.type === OrderType.TYPE_LIMIT && order.market && (
          <div>
            <p className={headerClassName}>{t(`Current price`)}</p>
            <p>{addDecimalsFormatNumber(order.price, market.decimalPlaces)}</p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Size`)}</p>
          <p>
            {
              <Size
                value={order.size}
                side={order.side}
                positionDecimalPlaces={market.positionDecimalPlaces}
              />
            }
          </p>
        </div>
      </div>
      {order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT &&
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
        <FormGroup label={t('Entry price')} labelFor="entryPrice">
          <Input
            type="number"
            step={step}
            {...register('entryPrice', {
              required: t('You need to provide a price'),
              validate: {
                min: (value) =>
                  Number(value) > 0 ? true : t('The price cannot be negative'),
              },
            })}
            id="entryPrice"
          />
          {errors.entryPrice?.message && (
            <InputError intent="danger">{errors.entryPrice.message}</InputError>
          )}
        </FormGroup>
        <Button variant="primary" size="md" type="submit">
          {t('Update')}
        </Button>
      </form>
    </Dialog>
  );
};
