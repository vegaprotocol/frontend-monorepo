import { MockedProvider } from '@apollo/client/testing';
import { AssetMarkets, transformAssetMarketsQuery } from './asset-markets';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AssetMarketsQuery } from './__generated__/Asset-Markets';
import { AccountType, MarketState } from '@vegaprotocol/types';
import { MockAssetMarkets } from '../../../mocks/links';

jest.mock('../../../components/links');
jest.mock('../../../components/price-in-market/price-in-market');

describe('transformAssetMarketsQuery', () => {
  it('should return an empty array if data is undefined', () => {
    const result = transformAssetMarketsQuery(undefined, 'assetId');
    expect(result).toEqual([]);
  });

  it('should return an empty array if marketsConnection is undefined', () => {
    const data = {
      marketsConnection: undefined,
    };
    const result = transformAssetMarketsQuery(data, 'assetId');
    expect(result).toEqual([]);
  });

  it('should return an empty array if no accounts with the given asset are found', () => {
    const data: AssetMarketsQuery = {
      marketsConnection: {
        edges: [
          {
            node: {
              tradableInstrument: {
                instrument: {
                  name: 'instrument1',
                },
              },
              state: MarketState.STATE_ACTIVE,
              id: 'market1',
              accountsConnection: {
                edges: [],
              },
            },
          },
        ],
      },
    };
    const result = transformAssetMarketsQuery(data, 'assetId');
    expect(result).toEqual([]);
  });

  it('should return an array of AssetMarketInsuranceAccount objects with the correct marketId and balance', () => {
    const data: AssetMarketsQuery = {
      marketsConnection: {
        edges: [
          {
            node: {
              id: 'market1',
              tradableInstrument: {
                instrument: {
                  name: 'instrument1',
                },
              },
              state: MarketState.STATE_ACTIVE,
              accountsConnection: {
                edges: [
                  {
                    node: {
                      type: AccountType.ACCOUNT_TYPE_INSURANCE,
                      asset: {
                        id: 'assetId',
                        decimals: 8,
                        symbol: 'ASSET',
                      },
                      balance: '100',
                    },
                  },
                  {
                    node: {
                      type: AccountType.ACCOUNT_TYPE_GLOBAL_INSURANCE,
                      asset: {
                        id: 'assetId',
                        decimals: 8,
                        symbol: 'ASSET',
                      },
                      balance: '200',
                    },
                  },
                ],
              },
            },
          },
          {
            node: {
              id: 'market2',
              tradableInstrument: {
                instrument: {
                  name: 'instrument1',
                },
              },
              state: MarketState.STATE_ACTIVE,
              accountsConnection: {
                edges: [
                  {
                    node: {
                      type: AccountType.ACCOUNT_TYPE_INSURANCE,
                      asset: {
                        id: 'assetId',
                        decimals: 8,
                        symbol: 'ASSET',
                      },
                      balance: '300',
                    },
                  },
                ],
              },
            },
          },
          {
            node: {
              id: 'market3',
              tradableInstrument: {
                instrument: {
                  name: 'instrument1',
                },
              },
              state: MarketState.STATE_ACTIVE,
              accountsConnection: {
                edges: [
                  {
                    node: {
                      type: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      asset: {
                        id: 'any-other-asset-id',
                        decimals: 8,
                        symbol: 'ASSET',
                      },
                      balance: '300',
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    };
    const result = transformAssetMarketsQuery(data, 'assetId');
    expect(result).toEqual([
      {
        marketId: 'market2',
        balance: '300',
        state: MarketState.STATE_ACTIVE,
      },
      {
        marketId: 'market1',
        balance: '100',
        state: MarketState.STATE_ACTIVE,
      },
    ]);
  });
});

describe('AssetMarkets', () => {
  it('should render the component', () => {
    render(
      <MockedProvider mocks={[MockAssetMarkets]}>
        <MemoryRouter>
          <AssetMarkets asset="assetId" symbol="ASSET" decimals={8} />
        </MemoryRouter>
      </MockedProvider>
    );
    const assetBalanceElement = screen.getByTestId('asset-balance');
    expect(assetBalanceElement).toBeInTheDocument();
  });

  it('should display a message when there are no markets with an insurance account balance in the asset', () => {
    render(
      <MockedProvider mocks={[MockAssetMarkets]}>
        <MemoryRouter>
          <AssetMarkets asset="assetId" symbol="ASSET" decimals={8} />
        </MemoryRouter>
      </MockedProvider>
    );
    const noMarketsMessage = screen.getByText(
      'There are no markets with an insurance account balance in this asset'
    );
    expect(noMarketsMessage).toBeInTheDocument();
  });
});
