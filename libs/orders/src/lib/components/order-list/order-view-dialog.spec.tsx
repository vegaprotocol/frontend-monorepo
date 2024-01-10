import { render, screen } from '@testing-library/react';
import { OrderViewDialog } from './order-view-dialog';
import type { Order } from '../order-data-provider';
import { BrowserRouter } from 'react-router-dom';
import {
  MarketState,
  MarketTradingMode,
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';

describe('OrderViewDialog', () => {
  it('should render the order view dialog if the order is provided', async () => {
    const order: Order = {
      id: '7f2a78f370062e41683d26a0fcc4521b2bd4b747530b78bc6bc86195db0e5fb3',
      market: {
        __typename: 'Market',
        id: 'b66cd4be223dfd900a4750bb5175e17d8f678996877d262be4c749a99e22a970',
        decimalPlaces: 5,
        positionDecimalPlaces: 3,
        state: MarketState.STATE_ACTIVE,
        tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
        fees: {
          __typename: 'Fees',
          factors: {
            __typename: 'FeeFactors',
            makerFee: '0.0002',
            infrastructureFee: '0.0005',
            liquidityFee: '0.001',
          },
        },
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            id: '',
            name: 'Tesla Quarterly (Sep 2023)',
            code: 'TSLA.QM21',
            metadata: {
              __typename: 'InstrumentMetadata',
              tags: [
                'formerly:5A86B190C384997F',
                'quote:EURO',
                'ticker:TSLA',
                'class:equities/single-stock-futures',
                'sector:tech',
                'listing_venue:NASDAQ',
                'country:US',
                'auto:tsla',
              ],
            },
            product: {
              __typename: 'Future',
              settlementAsset: {
                __typename: 'Asset',
                id: '177e8f6c25a955bd18475084b99b2b1d37f28f3dec393fab7755a7e69c3d8c3b',
                symbol: 'tEURO',
                name: 'tEURO Fairground',
                decimals: 5,
                quantum: '1',
              },
              quoteName: 'EURO',
              dataSourceSpecForTradingTermination: {
                __typename: 'DataSourceSpec',
                id: '3f5941ba047dabb3bec23f112db0a8cc8aecbbbc6b34d1366d9383ed1b0f39df',
                data: {
                  __typename: 'DataSourceDefinition',
                  sourceType: {
                    __typename: 'DataSourceDefinitionExternal',
                    sourceType: {
                      __typename: 'DataSourceSpecConfiguration',
                      signers: [
                        {
                          __typename: 'Signer',
                          signer: {
                            __typename: 'PubKey',
                            key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                          },
                        },
                      ],
                    },
                  },
                },
              },
              dataSourceSpecForSettlementData: {
                __typename: 'DataSourceSpec',
                id: '05ca5485678aa7c705aa6a683fd062714cbcfdac2d1a27641cd27b66168d9c1d',
                data: {
                  __typename: 'DataSourceDefinition',
                  sourceType: {
                    __typename: 'DataSourceDefinitionExternal',
                    sourceType: {
                      __typename: 'DataSourceSpecConfiguration',
                      signers: [
                        {
                          __typename: 'Signer',
                          signer: {
                            __typename: 'PubKey',
                            key: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
                          },
                        },
                      ],
                    },
                  },
                },
              },
              dataSourceSpecBinding: {
                __typename: 'DataSourceSpecToFutureBinding',
                settlementDataProperty: 'prices.TSLA.value',
                tradingTerminationProperty: 'termination.TSLA.value',
              },
            },
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2023-07-19T12:05:25.822854221Z',
          close: null,
        },
      },
      type: OrderType.TYPE_LIMIT,
      side: Side.SIDE_BUY,
      size: '10000',
      status: OrderStatus.STATUS_ACTIVE,
      rejectionReason: null,
      price: '15000000',
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT,
      remaining: '5000',
      expiresAt: null,
      createdAt: '2023-08-01T14:47:34.977742Z',
      updatedAt: null,
      postOnly: false,
      reduceOnly: false,
      liquidityProvision: null,
      peggedOrder: null,
      icebergOrder: {
        __typename: 'IcebergOrder',
        peakSize: '5000',
        minimumVisibleSize: '2000',
        reservedRemaining: '5000',
      },
      __typename: 'Order',
    };

    render(
      <BrowserRouter>
        <OrderViewDialog order={order} onChange={jest.fn()} isOpen={true} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('order-market-label')).toHaveTextContent(
      'Market'
    );
    expect(screen.getByTestId('order-market-value')).toHaveTextContent(
      'Tesla Quarterly (Sep 2023)'
    );
    expect(screen.getByTestId('order-type-label')).toHaveTextContent('Type');
    expect(screen.getByTestId('order-type-value')).toHaveTextContent('Limit');
    expect(screen.getByTestId('order-price-label')).toHaveTextContent('Price');
    expect(screen.getByTestId('order-price-value')).toHaveTextContent('150.00');
    expect(screen.getByTestId('order-size-label')).toHaveTextContent('Size');
    expect(screen.getByTestId('order-size-value')).toHaveTextContent('+10.00');
    expect(screen.getByTestId('order-remaining-label')).toHaveTextContent(
      'Remaining'
    );
    expect(screen.getByTestId('order-remaining-value')).toHaveTextContent(
      '+5.00'
    );
    expect(
      screen.getByTestId('order-iceberg-order-reserved-remaining-value')
    ).toHaveTextContent('5.00');
  });
});
