import { create } from 'zustand';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { OrderType } from '@vegaprotocol/types';
import { useEffect } from 'react';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { Controller, useForm } from 'react-hook-form';
import { InputError } from '@vegaprotocol/ui-toolkit';

export const DealTicket2 = ({
  market,
  marketData,
}: {
  market: Market;
  marketData: MarketData;
  submit: (order: OrderSubmissionBody['orderSubmission']) => void;
  onClickCollateral?: () => void;
}) => {
  const { order, update, control, errors, onSubmit } = useOrderForm(market.id);

  console.log('render');

  if (!order) return null;

  return (
    <div className="text-xs">
      <form onSubmit={onSubmit}>
        <div>
          <label>Size</label>
          <Controller
            control={control}
            name="size"
            rules={{
              required: 'Required',
            }}
            render={() => (
              <input
                className="border"
                value={order.size}
                onChange={(e) => {
                  update({ marketId: market.id, size: e.target.value });
                }}
              />
            )}
          />
          {errors.size?.message && (
            <InputError>{errors.size.message}</InputError>
          )}
        </div>
        <div>
          <label>Price</label>
          <Controller
            control={control}
            name="price"
            rules={{
              required: 'Required',
            }}
            render={() => (
              <input
                className="border"
                value={order.price}
                onChange={(e) => {
                  update({ marketId: market.id, price: e.target.value });
                }}
              />
            )}
          />
          {errors.price?.message && (
            <InputError>{errors.price.message}</InputError>
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
      <pre>{JSON.stringify(order, null, 2)}</pre>
      <pre>{JSON.stringify(marketData, null, 2)}</pre>
    </div>
  );
};
