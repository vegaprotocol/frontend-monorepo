import * as React from 'react';
import { renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { PartyBalanceQuery } from './__generated__/PartyBalance';
import { useOrderCloseOut } from './use-order-closeout';
import type { DealTicketMarketFragment } from '../components/deal-ticket/__generated___/DealTicket';

jest.mock('@vegaprotocol/wallet', () => ({
  ...jest.requireActual('@vegaprotocol/wallet'),
  useVegaWallet: jest.fn().mockReturnValue('wallet-pub-key'),
}));

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
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: order as OrderSubmissionBody['orderSubmission'],
          market: market as DealTicketMarketFragment,
          partyData: partyData as PartyBalanceQuery,
        }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        ),
      }
    );
    expect(result.current).toEqual('-');
  });

  it('return proper sell value', () => {
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: {
            ...order,
            side: 'SIDE_SELL',
          } as OrderSubmissionBody['orderSubmission'],
          market: market as DealTicketMarketFragment,
          partyData: partyData as PartyBalanceQuery,
        }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        ),
      }
    );
    expect(result.current).toEqual('1.00000');
  });

  it('return proper empty value', () => {
    const { result } = renderHook(
      () =>
        useOrderCloseOut({
          order: {
            ...order,
            side: 'SIDE_SELL',
          } as OrderSubmissionBody['orderSubmission'],
          market: market as DealTicketMarketFragment,
        }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        ),
      }
    );
    expect(result.current).toEqual('0.00000');
  });
});
