import {
  MarginHealthChart,
  MarginHealthChartTooltip,
} from './margin-health-chart';
import { act, render, screen } from '@testing-library/react';
import type { MarginFieldsFragment } from './__generated__/Margins';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';

const asset: AssetFieldsFragment = {
  id: 'assetId',
  decimals: 2,
} as AssetFieldsFragment;
const margins: MarginFieldsFragment = {
  asset: {
    id: 'assetId',
  },
  collateralReleaseLevel: '1000',
  initialLevel: '800',
  searchLevel: '600',
  maintenanceLevel: '400',
  market: {
    id: 'marketId',
  },
};

const mockGetMargins = jest.fn(() => margins);
const mockGetBalance = jest.fn(() => '0');

jest.mock('./margin-data-provider', () => ({}));

jest.mock('@vegaprotocol/assets', () => ({
  useAssetsMapProvider: () => {
    return {
      data: {
        assetId: asset,
      },
    };
  },
}));

jest.mock('@vegaprotocol/wallet', () => ({
  useVegaWallet: () => {
    return {
      pubKey: 'partyId',
    };
  },
}));

jest.mock('@vegaprotocol/data-provider', () => ({
  useDataProvider: () => {
    return {
      data: mockGetMargins(),
    };
  },
}));

jest.mock('./use-account-balance', () => ({
  useAccountBalance: () => {
    return {
      accountBalance: mockGetBalance(),
    };
  },
}));

jest.mock('./use-market-account-balance', () => ({
  useMarketAccountBalance: () => {
    return {
      accountBalance: '700',
    };
  },
}));

describe('MarginHealthChart', () => {
  it('should render correct values', async () => {
    render(<MarginHealthChart marketId="marketId" assetId="assetId" />);
    const chart = screen.getByTestId('margin-health-chart');
    expect(chart).toHaveTextContent('3.00 above maintenance level');
    const red = screen.getByTestId('margin-health-chart-red');
    const orange = screen.getByTestId('margin-health-chart-orange');
    const yellow = screen.getByTestId('margin-health-chart-yellow');
    const green = screen.getByTestId('margin-health-chart-green');
    const balance = screen.getByTestId('margin-health-chart-balance');
    expect(parseInt(red.style.width)).toBe(40);
    expect(parseInt(orange.style.width)).toBe(20);
    expect(parseInt(yellow.style.width)).toBe(10);
    expect(parseInt(green.style.width)).toBe(30);
    expect(parseInt(balance.style.left)).toBe(70);
  });

  it('should use correct scale', async () => {
    mockGetBalance.mockReturnValueOnce('1300');
    await act(async () => {
      render(<MarginHealthChart marketId="marketId" assetId="assetId" />);
    });
    await screen.findByTestId('margin-health-chart');
    const red = screen.getByTestId('margin-health-chart-red');
    expect(parseInt(red.style.width)).toBe(20);
  });
});

describe('MarginHealthChartTooltip', () => {
  it('renders correct values and labels', async () => {
    await act(async () => {
      render(
        <MarginHealthChartTooltip
          {...margins}
          decimals={asset.decimals}
          marginAccountBalance="500"
        />
      );
    });
    const labels = await screen.findAllByTestId('margin-health-tooltip-label');
    const expectedLabels = [
      'maintenance level',
      'balance',
      'search level',
      'initial level',
      'release level',
    ];
    labels.forEach((value, i) => {
      expect(value).toHaveTextContent(expectedLabels[i]);
    });
    const values = await screen.findAllByTestId('margin-health-tooltip-value');
    const expectedValues = ['4.00', '5.00', '6.00', '8.00', '10.00'];
    values.forEach((value, i) => {
      expect(value).toHaveTextContent(expectedValues[i]);
    });
  });

  it('renders balance in correct place', async () => {
    const { rerender } = render(
      <MarginHealthChartTooltip
        {...margins}
        decimals={asset.decimals}
        marginAccountBalance="700"
      />
    );

    let values = await screen.findAllByTestId('margin-health-tooltip-value');
    expect(values[2]).toHaveTextContent('7.00');

    rerender(
      <MarginHealthChartTooltip
        {...margins}
        decimals={asset.decimals}
        marginAccountBalance="900"
      />
    );

    values = await screen.findAllByTestId('margin-health-tooltip-value');
    expect(values.length).toBe(5);
    expect(values[3]).toHaveTextContent('9.00');
  });
});
