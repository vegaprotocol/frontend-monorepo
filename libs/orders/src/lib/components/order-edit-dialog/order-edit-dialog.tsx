import { t, addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { OrderType } from '@vegaprotocol/types';
import {
  FormGroup,
  Input,
  InputError,
  Button,
  Icon,
  Dialog,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import type { Order } from '@vegaprotocol/wallet';
import { OrderDialogWrapper } from '@vegaprotocol/wallet';
import { useForm } from 'react-hook-form';

interface OrderEditDialogProps {
  title: string;
  order: Order | null;
  edit: (body?: unknown) => Promise<unknown>;
  orderDialogOpen: boolean;
  setOrderDialogOpen: (isOpen: boolean) => void;
}

export const OrderEditDialog = ({
  order,
  title,
  edit,
  orderDialogOpen,
  setOrderDialogOpen,
}: OrderEditDialogProps) => {
  interface FormFields {
    entryPrice: string;
  }
  const headerClassName = 'text-h5 font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: {
      entryPrice: order?.price
        ? addDecimalsFormatNumber(
            order?.price,
            order?.market?.decimalPlaces ?? 0
          )
        : '',
    },
  });
  if (!order) return null;
  return (
    <Dialog
      open={orderDialogOpen}
      onChange={(isOpen) => {
        setOrderDialogOpen(isOpen);
      }}
      intent={Intent.None}
    >
      <OrderDialogWrapper
        title={title}
        icon={<Icon name="hand-up" size={20} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {order.market && (
            <div>
              <p className={headerClassName}>{t(`Market`)}</p>
              <p>{t(`${order.market.name}`)}</p>
            </div>
          )}
          <div>
            <p className={headerClassName}>{t(`Amount remaining`)}</p>
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
          {order.type === OrderType.Limit && order.market && (
            <div>
              <p className={headerClassName}>{t(`Last price`)}</p>
              <p>
                {addDecimalsFormatNumber(
                  order.price,
                  order.market.decimalPlaces
                )}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          <form
            onSubmit={handleSubmit(async (data) => {
              await edit({ ...order, price: data.entryPrice });
              setOrderDialogOpen(false);
            })}
            data-testid="edit-order"
          >
            <FormGroup label={t('Entry price')} labelFor="entryPrice">
              <Input
                {...register('entryPrice', { required: t('Required') })}
                id="entryPrice"
                type="text"
              />
              {errors.entryPrice?.message && (
                <InputError intent="danger" className="mt-4">
                  {errors.entryPrice.message}
                </InputError>
              )}
            </FormGroup>
            <Button variant="primary" type="submit">
              {t('Update')}
            </Button>
          </form>
        </div>
      </OrderDialogWrapper>
    </Dialog>
  );
};
