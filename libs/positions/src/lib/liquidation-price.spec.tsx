import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstimatePositionDocument } from './__generated__/Positions';
import type { EstimatePositionQuery } from './__generated__/Positions';
import { LiquidationPrice } from './liquidation-price';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { MarginMode } from '@vegaprotocol/types';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

describe('LiquidationPrice', () => {
  const variables = {
    marketId: 'market-id',
    openVolume: '100',
    averageEntryPrice: '10',
    marginAccountBalance: '500',
    generalAccountBalance: '500',
    orderMarginAccountBalance: '0',
    marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
    marginFactor: '1',
  };
  const props = { ...variables, decimalPlaces: 2 };
  const worstCaseOpenVolume = '200';
  const bestCaseOpenVolume = '100';
  const mock: MockedResponse<EstimatePositionQuery> = {
    request: {
      query: EstimatePositionDocument,
      variables,
    },
    result: {
      data: {
        estimatePosition: {
          collateralIncreaseEstimate: {
            bestCase: '0',
            worstCase: '0',
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
        <TooltipProvider>
          <LiquidationPrice {...props} />
        </TooltipProvider>
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
