import * as Schema from '@vegaprotocol/types';

export const orderSizeField = 'order-size';
export const orderPriceField = 'order-price';
export const orderTIFDropDown = 'order-tif';
export const placeOrderBtn = 'place-order';
export const toggleShort = 'order-side-SIDE_SELL';
export const toggleLong = 'order-side-SIDE_BUY';
export const toggleLimit = 'order-type-TYPE_LIMIT';
export const toggleMarket = 'order-type-TYPE_MARKET';

export const TIFlist = Object.values(Schema.OrderTimeInForce).map((value) => {
  return {
    code: Schema.OrderTimeInForceCode[value],
    value,
    text: Schema.OrderTimeInForceMapping[value],
  };
});
