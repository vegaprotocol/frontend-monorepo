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
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  Dialog,
  VegaIcon,
  VegaIconNames,
  TradingButton,
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
  size: string;
}

export const OrderEditDialog = ({
  isOpen,
  onChange,
  order,
  onSubmit,
}: OrderEditDialogProps) => {
  const headerClassName = 'text-xs font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: {
      limitPrice: addDecimal(order.price, order.market?.decimalPlaces ?? 0),
      size: addDecimal(order.size, order.market?.positionDecimalPlaces ?? 0),
    },
  });

  const step = toDecimal(order.market?.decimalPlaces ?? 0);
  const stepSize = toDecimal(order.market?.positionDecimalPlaces ?? 0);

  return (
    <Dialog
      open={isOpen}
      onChange={onChange}
      title={t('Edit order')}
      icon={<VegaIcon name={VegaIconNames.EDIT} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {order.market && (
          <div className="md:col-span-2">
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{order.market.tradableInstrument.instrument.code}</p>
          </div>
        )}
        {order.type === Schema.OrderType.TYPE_LIMIT && order.market && (
          <div className="md:col-span-1">
            <p className={headerClassName}>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
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
        className="w-full mt-4"
        noValidate
      >
        <div className="flex flex-col md:flex-row gap-4">
          <TradingFormGroup
            label={t('Price')}
            labelFor="limitPrice"
            className="grow"
          >
            <TradingInput
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
              <TradingInputError intent="danger">
                {errors.limitPrice.message}
              </TradingInputError>
            )}
          </TradingFormGroup>
          <TradingFormGroup label={t('Size')} labelFor="size" className="grow">
            <TradingInput
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
              <TradingInputError intent="danger">
                {errors.size.message}
              </TradingInputError>
            )}
          </TradingFormGroup>
        </div>
        <TradingButton type="submit">{t('Update')}</TradingButton>
      </form>
    </Dialog>
  );
};
