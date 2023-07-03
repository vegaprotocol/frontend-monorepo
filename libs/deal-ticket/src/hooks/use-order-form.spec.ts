import omit from 'lodash/omit';
import { act, renderHook } from '@testing-library/react';
import { getDefaultOrder, useCreateOrderStore } from '@vegaprotocol/orders';
import { useOrderForm } from './use-order-form';

jest.mock('zustand');

// eslint-disable-next-line react-hooks/rules-of-hooks
const useOrderStore = useCreateOrderStore();

describe('useOrderForm', () => {
  const marketId = 'market-id';
  const setup = (marketId: string) => {
    return renderHook(() => useOrderForm(marketId));
  };

  it('updates form fields when the order changes', async () => {
    const order = getDefaultOrder(marketId);
    const { result } = setup(marketId);
    // expect default values
    expect(result.current.order).toEqual(order);
    expect(result.current.getValues()).toEqual(order);

    const priceUpdate = {
      ...order,
      price: '100',
      size: '22',
    };

    await act(async () => {
      useOrderStore.setState({
        orders: {
          [marketId]: priceUpdate,
        },
      });
    });

    // check order store has updated fields
    expect(result.current.order).toEqual(priceUpdate);
    // check react-hook-form has updated fields
    expect(result.current.getValues()).toEqual(priceUpdate);
  });

  it('removes persist key on submit', async () => {
    const order = {
      ...getDefaultOrder(marketId),
      price: '99',
      size: '22',
    };
    const onSubmit = jest.fn();
    const { result } = setup(marketId);

    await act(async () => {
      useOrderStore.setState({
        orders: {
          [marketId]: order,
        },
      });
    });

    await act(async () => {
      result.current.handleSubmit(onSubmit)();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual(omit(order, 'persist'));
    expect(onSubmit.mock.calls[0][0].persist).toBeUndefined();
  });
});
