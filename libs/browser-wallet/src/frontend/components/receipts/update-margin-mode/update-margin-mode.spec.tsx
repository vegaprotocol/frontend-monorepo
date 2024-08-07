import { render, screen } from '@testing-library/react';
import { vegaMarginMode } from '@vegaprotocol/rest-clients/dist/trading-data';

import { locators as tableLocators } from '@/components/data-table/data-table';

import { UpdateMarginMode } from './update-margin-mode';

const renderComponent = (transaction: any) => {
  render(<UpdateMarginMode transaction={transaction} />);
};

jest.mock('@/components/vega-entities/vega-market', () => ({
  VegaMarket: () => <div data-testid="vega-market" />,
}));

describe('UpdateMarginMode', () => {
  it('should render the market', () => {
    // 1140-UPMM-001 I can see my new margin mode
    // 1140-UPMM-002 I can see the market I am updating margin mode for
    // 1140-UPMM-003 I can see my new leverage
    // 1140-UPMM-004 I can see my margin factor
    const tx = {
      updateMarginMode: {
        mode: vegaMarginMode.MARGIN_MODE_CROSS_MARGIN,
        marginFactor: '0.1',
        marketId: 'someMarketId',
      },
    };
    renderComponent(tx);
    const [market, mode, leverage, marginFactor] = screen.getAllByTestId(
      tableLocators.dataRow
    );
    expect(market).toHaveTextContent('Market');
    expect(screen.getByTestId('vega-market')).toBeInTheDocument();
    expect(mode).toHaveTextContent('Mode');
    expect(mode).toHaveTextContent('Cross margin');
    expect(marginFactor).toHaveTextContent('Margin Factor');
    expect(marginFactor).toHaveTextContent('0.1');
    expect(leverage).toHaveTextContent('Leverage');
    expect(leverage).toHaveTextContent('10.00');
  });
});
