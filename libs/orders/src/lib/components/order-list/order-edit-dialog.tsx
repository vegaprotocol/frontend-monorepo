import {
  toDecimal,
  getDateTimeFormat,
  addDecimal,
  addDecimalsFormatNumber,
  useValidateAmount,
  determinePriceStep,
  determineSizeStep,
} from '@vegaprotocol/utils';
import { Size } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  Dialog,
  VegaIcon,
  VegaIconNames,
  Button,
} from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import type { Order } from '../order-data-provider';
import { useT } from '../../use-t';

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
  const t = useT();
  const validateAmount = useValidateAmount();
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

  const step = order.market ? determinePriceStep(order.market) : toDecimal(0);
  const stepSize = order.market
    ? determineSizeStep(order.market)
    : toDecimal(0);

  return (
    <Dialog
      open={isOpen}
      onChange={onChange}
      title={t('Edit order')}
      icon={<VegaIcon name={VegaIconNames.EDIT} />}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
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
        className="mt-4 w-full"
        noValidate
      >
        <div className="flex flex-col gap-4 md:flex-row">
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
                    Number(value) >= Number(step)
                      ? true
                      : t('Price cannot be lower than {{step}}', {
                          step,
                        }),
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
                    Number(value) >= Number(stepSize)
                      ? true
                      : t('Size cannot be lower than {{stepSize}}', {
                          stepSize,
                        }),
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
        <Button type="submit">{t('Update')}</Button>
      </form>
    </Dialog>
  );
};
