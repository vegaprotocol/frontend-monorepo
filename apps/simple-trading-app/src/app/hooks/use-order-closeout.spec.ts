import { renderHook } from '@testing-library/react-hooks';
import useOrderCloseOut from './use-order-closeout';
import type { Order } from '@vegaprotocol/orders';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import type { PartyBalanceQuery } from '../components/deal-ticket/__generated__/PartyBalanceQuery';

describe('useOrderCloseOut Hook', () => {
  const order = { size: '2', side: 'SIDE_BUY' };
  const market = {
    decimalPlaces: 5,
    depth: {
      lastTrade: {
        price: '1000000',
      },
    },
    tradableInstrument: {
      instrument: {
        product: {
          settlementAsset: {
            id: 'assetId',
          },
        },
      },
    },
  };
  const partyData = {
    party: {
      accounts: [
        {
          balance: '200000',
          asset: {
            id: 'assetId',
            decimals: 5,
          },
        },
      ],
    },
  };

  it('return proper buy value', () => {
    const { result } = renderHook(() =>
      useOrderCloseOut({
        order: order as Order,
        market: market as DealTicketQuery_market,
        partyData: partyData as PartyBalanceQuery,
      })
    );
    expect(result.current).toEqual('9.00000');
  });

  it('return proper sell value', () => {
    const { result } = renderHook(() =>
      useOrderCloseOut({
        order: { ...order, side: 'SIDE_SELL' } as Order,
        market: market as DealTicketQuery_market,
        partyData: partyData as PartyBalanceQuery,
      })
    );
    expect(result.current).toEqual('11.00000');
  });

  it('return proper empty value', () => {
    const { result } = renderHook(() =>
      useOrderCloseOut({
        order: { ...order, side: 'SIDE_SELL' } as Order,
        market: market as DealTicketQuery_market,
      })
    );
    expect(result.current).toEqual(' - ');
  });
});
