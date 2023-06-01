import {
  toDecimal,
  getDateTimeFormat,
  addDecimal,
  addDecimalsFormatNumber,
  validateAmount,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Size } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
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
import { useMarketsMap } from '@vegaprotocol/markets';

interface OrderEditDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  order: Order;
  onSubmit: (fields: FormFields) => void;
}

interface FormFields {
  limitPrice: string;
  size: string;
}

export const OrderEditDialog = ({
  isOpen,
  onChange,
  order,
  onSubmit,
}: OrderEditDialogProps) => {
  const market = useMarketsMap((state) => state.get)(order.market.id);
  const headerClassName = 'text-lg font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: {
      limitPrice: addDecimal(order.price, market?.decimalPlaces ?? 0),
      size: addDecimal(order.size, market?.positionDecimalPlaces ?? 0),
    },
  });

  const step = toDecimal(market?.decimalPlaces ?? 0);
  const stepSize = toDecimal(market?.positionDecimalPlaces ?? 0);

  return (
    <Dialog
      open={isOpen}
      onChange={onChange}
      title={t('Edit order')}
      icon={<Icon name="edit" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {market && (
          <div className="md:col-span-2">
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{t(`${market.tradableInstrument.instrument.name}`)}</p>
          </div>
        )}
        {order.type === Schema.OrderType.TYPE_LIMIT && order.market && (
          <div className="md:col-span-1">
            <p className={headerClassName}>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, market?.decimalPlaces ?? 0)}
            </p>
          </div>
        )}
        <div className="md:col-span-1">
          <p className={headerClassName}>{t(`Size`)}</p>
          <p>
            {order.market && (
              <Size
                value={order.size}
                side={order.side}
                positionDecimalPlaces={market?.positionDecimalPlaces ?? 0}
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
        className="w-full mt-4"
        noValidate
      >
        <div className="flex flex-col md:flex-row gap-4">
          <FormGroup label={t('Price')} labelFor="limitPrice" className="grow">
            <Input
              type="number"
              step={step}
              {...register('limitPrice', {
                required: t('You need to provide a price'),
                validate: {
                  min: (value) =>
                    Number(value) > 0
                      ? true
                      : t('The price cannot be negative'),
                  validate: validateAmount(step, t('Price')),
                },
              })}
              id="limitPrice"
            />
            {errors.limitPrice?.message && (
              <InputError intent="danger">
                {errors.limitPrice.message}
              </InputError>
            )}
          </FormGroup>
          <FormGroup label={t('Size')} labelFor="size" className="grow">
            <Input
              type="number"
              step={stepSize}
              {...register('size', {
                required: t('You need to provide a size'),
                validate: {
                  min: (value) =>
                    Number(value) > 0 ? true : t('The size cannot be negative'),
                  validate: validateAmount(stepSize, t('Size')),
                },
              })}
              id="size"
            />
            {errors.size?.message && (
              <InputError intent="danger">{errors.size.message}</InputError>
            )}
          </FormGroup>
        </div>
        <Button variant="primary" size="md" type="submit">
          {t('Update')}
        </Button>
      </form>
    </Dialog>
  );
};
