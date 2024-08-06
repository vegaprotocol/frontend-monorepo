import { render, screen } from '@testing-library/react';
import { MarketTradingMode } from '@vegaprotocol/rest-clients/dist/trading-data';

import { locators as subheaderLocators } from '@/components/sub-header';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { locators as assetCardLocators } from './asset-card';
import { AssetListEmptyState, locators } from './asset-list-empty-state';

// Mocking useAssetsStore and useMarketsStore
jest.mock('@/stores/assets-store');
jest.mock('@/stores/markets-store', () => ({
  useMarketsStore: jest.fn(),
}));

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <AssetListEmptyState publicKey="testPublicKey" />
    </MockNetworkProvider>
  );

describe('AssetListEmptyState Component', () => {
  it('should display "Currently you have no assets." when no assets are available', () => {
    mockStore(useAssetsStore, {
      assets: [],
    });
    mockStore(useMarketsStore, {
      getMarketsByAssetId: () => {
        return [];
      },
    });
    renderComponent();

    expect(screen.getByTestId(locators.noAssets)).toHaveTextContent(
      'Currently you have no assets.'
    );
  });

  it('should display AssetCards for the top 2 assets when available', () => {
    const assets = [
      { id: 'asset1', details: { decimals: 1, symbol: 'A1', name: 'Asset 1' } },
      { id: 'asset2', details: { decimals: 1, symbol: 'A2', name: 'Asset 2' } },
      { id: 'asset3', details: { decimals: 1, symbol: 'A3', name: 'Asset 3' } },
    ];
    mockStore(useAssetsStore, {
      // TODO figure out why deep partial is not functional for arrays
      // @ts-ignore
      assets,
      getAssetById: (assetId: string) =>
        assets.find(({ id }) => id === assetId),
    });
    mockStore(useMarketsStore, {
      getMarketsByAssetId: () => {
        return [];
      },
    });
    renderComponent();

    expect(screen.getByTestId(subheaderLocators.subHeader)).toHaveTextContent(
      'Balances'
    );
    const assetCards = screen.getAllByTestId(assetCardLocators.assetCard);
    expect(assetCards).toHaveLength(2);
  });

  it('should nothing if asset does not have an id', () => {
    const assets = [
      { details: { decimals: 1, symbol: 'A1', name: 'Asset 1' } },
    ];
    mockStore(useAssetsStore, {
      // TODO figure out why deep partial is not functional for arrays
      // @ts-ignore
      assets,
      getAssetById: () => {
        throw new Error('Asset not found');
      },
    });
    mockStore(useMarketsStore, {
      getMarketsByAssetId: () => {
        return [];
      },
    });
    renderComponent();

    expect(screen.getByTestId(subheaderLocators.subHeader)).toHaveTextContent(
      'Balances'
    );
    const assetCards = screen.queryAllByTestId(assetCardLocators.assetCard);
    expect(assetCards).toHaveLength(0);
  });

  it('should nothing if asset is null', () => {
    const assets = [null];
    mockStore(useAssetsStore, {
      // TODO figure out why deep partial is not functional for arrays
      // @ts-ignore
      assets,
      getAssetById: () => {
        throw new Error('Asset not found');
      },
    });
    mockStore(useMarketsStore, {
      getMarketsByAssetId: () => {
        return [];
      },
    });
    renderComponent();

    expect(screen.getByTestId(subheaderLocators.subHeader)).toHaveTextContent(
      'Balances'
    );
    const assetCards = screen.queryAllByTestId(assetCardLocators.assetCard);
    expect(assetCards).toHaveLength(0);
  });

  it('should order by the total number of active markets', () => {
    const assets = [
      { id: '1', details: { decimals: 1, symbol: 'A1', name: 'Asset 1' } },
      { id: '2', details: { decimals: 1, symbol: 'A2', name: 'Asset 2' } },
    ];
    mockStore(useAssetsStore, {
      // TODO figure out why deep partial is not functional for arrays
      // @ts-ignore
      assets,
      getAssetById: (assetId: string) =>
        assets.find(({ id }) => id === assetId),
    });
    mockStore(useMarketsStore, {
      getMarketsByAssetId: (id: string) => {
        return id === assets[0].id
          ? [
              {
                id: 'M1',
                tradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
              },
              {
                id: 'M2',
                tradingMode:
                  MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE,
              },
            ]
          : [
              {
                id: 'M3',
                tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
              },
              {
                id: 'M4',
                tradingMode: MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
              },
            ];
      },
    });
    renderComponent();

    expect(screen.getByTestId(subheaderLocators.subHeader)).toHaveTextContent(
      'Balances'
    );
    const assetCards = screen.queryAllByTestId(assetCardLocators.assetCard);
    expect(assetCards).toHaveLength(2);
    const [asset1, asset2] = assetCards;
    expect(asset1).toHaveTextContent('Asset 1');
    expect(asset2).toHaveTextContent('Asset 2');
  });
});
