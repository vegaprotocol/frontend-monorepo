import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstimatePositionDocument } from './__generated__/Positions';
import type { EstimatePositionQuery } from './__generated__/Positions';
import { LiquidationPrice } from './liquidation-price';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { MarginMode } from '@vegaprotocol/types';

describe('LiquidationPrice', () => {
  const props = {
    marketId: 'market-id',
    openVolume: '100',
    decimalPlaces: 2,
    averageEntryPrice: '100',
    generalAccountBalance: '100',
    marginAccountBalance: '100',
    orderMarginAccountBalance: '100',
    marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
    marginFactor: '1',
  };
  const worstCaseOpenVolume = '200';
  const bestCaseOpenVolume = '100';
  const mock: MockedResponse<EstimatePositionQuery> = {
    request: {
      query: EstimatePositionDocument,
      variables: {
        marketId: props.marketId,
        openVolume: props.openVolume,
        averageEntryPrice: props.averageEntryPrice,
        generalAccountBalance: props.generalAccountBalance,
        marginAccountBalance: props.marginAccountBalance,
        orderMarginAccountBalance: props.orderMarginAccountBalance,
        marginMode: props.marginMode,
        marginFactor: props.marginFactor,
      },
    },
    result: {
      data: {
        estimatePosition: {
          margin: {
            worstCase: {
              maintenanceLevel: '100',
              searchLevel: '100',
              initialLevel: '100',
              collateralReleaseLevel: '100',
            },
            bestCase: {
              maintenanceLevel: '100',
              searchLevel: '100',
              initialLevel: '100',
              collateralReleaseLevel: '100',
            },
          },
          liquidation: {
            worstCase: {
              open_volume_only: worstCaseOpenVolume,
              including_buy_orders: '100',
              including_sell_orders: '100',
            },
            bestCase: {
              open_volume_only: bestCaseOpenVolume,
              including_buy_orders: '100',
              including_sell_orders: '100',
            },
          },
        },
      },
    },
  };

  it('correctly formats best and worst case values for the tooltip', async () => {
    render(
      <MockedProvider mocks={[mock]}>
        <LiquidationPrice {...props} />
      </MockedProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
    const el = await screen.findByTestId('liquidation-price');
    expect(el).toHaveTextContent(
      addDecimalsFormatNumber(worstCaseOpenVolume, props.decimalPlaces)
    );
    await userEvent.hover(el);
    const tooltip = within(await screen.findByRole('tooltip'));
    expect(
      tooltip.getByText('Worst case').nextElementSibling
    ).toHaveTextContent(
      addDecimalsFormatNumber(worstCaseOpenVolume, props.decimalPlaces)
    );
    expect(tooltip.getByText('Best case').nextElementSibling).toHaveTextContent(
      addDecimalsFormatNumber(bestCaseOpenVolume, props.decimalPlaces)
    );
  });
});
