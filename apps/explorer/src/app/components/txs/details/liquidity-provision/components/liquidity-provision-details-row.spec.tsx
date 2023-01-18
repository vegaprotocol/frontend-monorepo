import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import type { LiquidityOrder } from '@vegaprotocol/types';
import { PeggedReference } from '@vegaprotocol/types';
import { LiquidityProvisionDetailsRow } from './liquidity-provision-details-row';
import type { VegaSide } from './liquidity-provision-details-row';

describe('LiquidityProvisionDetails', () => {
  function renderComponent(
    order: LiquidityOrder,
    side: VegaSide,
    normaliseProportionsTo: number,
    marketId: string
  ) {
    return render(
      <MockedProvider>
        <table>
          <tbody data-testid="container">
            <LiquidityProvisionDetailsRow
              order={order}
              marketId={marketId}
              normaliseProportionsTo={normaliseProportionsTo}
              side={side}
            />
          </tbody>
        </table>
      </MockedProvider>
    );
  }

  it('Order with no proportion renders null', () => {
    const mockOrder = {
      offset: '1',
      reference: PeggedReference.PEGGED_REFERENCE_MID,
    };

    const res = renderComponent(
      mockOrder as LiquidityOrder,
      'SIDE_BUY',
      100,
      '123'
    );
    expect(res.getByTestId('container')).toBeEmptyDOMElement();
  });

  it('Null order renders null', () => {
    const res = renderComponent(
      null as unknown as LiquidityOrder,
      'SIDE_BUY',
      100,
      '123'
    );
    expect(res.getByTestId('container')).toBeEmptyDOMElement();
  });

  it('Renders a row when there is an order', () => {
    const mockOrder = {
      offset: '1',
      proportion: 20,
      reference: PeggedReference.PEGGED_REFERENCE_MID,
    };

    const res = renderComponent(
      mockOrder as LiquidityOrder,
      'SIDE_BUY',
      100,
      '123'
    );
    // Row test ids and keys are based on the side, reference and proportion
    expect(res.getByTestId('SIDE_BUY-20-1')).toBeInTheDocument();
    expect(res.getByText('+1')).toBeInTheDocument();
    expect(res.getByText('Mid')).toBeInTheDocument();
    expect(res.getByText('20%')).toBeInTheDocument();
  });

  it('Rows normalise offsets when normaliseToProportion is not 100', () => {
    const mockOrder = {
      offset: '1',
      proportion: 20,
      reference: PeggedReference.PEGGED_REFERENCE_BEST_BID,
    };

    const res = renderComponent(
      mockOrder as LiquidityOrder,
      'SIDE_SELL',
      50,
      '123'
    );
    // Row test ids and keys are based on the side, reference and proportion - and that proportion is scaled
    expect(res.getByTestId('SIDE_SELL-40-1')).toBeInTheDocument();
    expect(res.getByText('-1')).toBeInTheDocument();
    expect(res.getByText('Best Bid')).toBeInTheDocument();
    expect(res.getByText('40% (normalised from: 20%)')).toBeInTheDocument();
  });

  it('Handles a missing offset gracefully (should not happen)', () => {
    const mockOrder = {
      proportion: 20,
      reference: PeggedReference.PEGGED_REFERENCE_BEST_BID,
    };

    const res = renderComponent(
      mockOrder as LiquidityOrder,
      'SIDE_SELL',
      50,
      '123'
    );
    // Row test ids and keys are based on the side, reference and proportion - and that proportion is scaled
    expect(res.getByTestId('SIDE_SELL-40-')).toBeInTheDocument();
    expect(res.getByText('-')).toBeInTheDocument();
  });

  it('Handles a missing reference gracefully (should not happen)', () => {
    const mockOrder = {
      offset: '1',
      proportion: 20,
    };

    const res = renderComponent(
      mockOrder as LiquidityOrder,
      'SIDE_SELL',
      50,
      '123'
    );
    // Row test ids and keys are based on the side, reference and proportion - and that proportion is scaled
    expect(res.getByTestId('SIDE_SELL-40-1')).toBeInTheDocument();
    expect(res.getByText('40% (normalised from: 20%)')).toBeInTheDocument();
    expect(res.getByText('-')).toBeInTheDocument();
  });
});
