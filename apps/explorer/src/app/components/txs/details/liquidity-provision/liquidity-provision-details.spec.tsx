import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import type { LiquidityOrder } from '@vegaprotocol/types';
import { PeggedReference } from '@vegaprotocol/types';
import type { LiquiditySubmission } from '../tx-liquidity-submission';
import {
  LiquidityProvisionDetails,
  sumProportions,
} from './liquidity-provision-details';

function mockProportion(proportion: number): LiquidityOrder {
  return {
    proportion,
    reference: PeggedReference.PEGGED_REFERENCE_MID,
    offset: '1',
  };
}
describe('Scale proportions - LP proportions do not always add up to 100%', () => {
  it('returns 0 if the side is undefined', () => {
    const side: LiquidityOrder[] = undefined as unknown as LiquidityOrder[];
    const res = sumProportions(side);

    expect(res).toEqual(0);
  });

  it('returns 0 if the side is empty', () => {
    const side: LiquidityOrder[] = [];
    const res = sumProportions(side);

    expect(res).toEqual(0);
  });

  it('Sums 1 item correctly (under 100%)', () => {
    const side: LiquidityOrder[] = [mockProportion(10)];
    const res = sumProportions(side);

    expect(res).toEqual(10);
  });

  it('Sums 2 item correctly (exactly 100%)', () => {
    const side: LiquidityOrder[] = [mockProportion(50), mockProportion(50)];
    const res = sumProportions(side);

    expect(res).toEqual(100);
  });

  it('Sums 3 item correctly to over 100%', () => {
    const side: LiquidityOrder[] = [
      mockProportion(20),
      mockProportion(40),
      mockProportion(50),
    ];
    const res = sumProportions(side);

    expect(res).toEqual(110);
  });
});

describe('LiquidityProvisionDetails', () => {
  function renderComponent(provision: LiquiditySubmission) {
    return render(
      <MockedProvider>
        <LiquidityProvisionDetails provision={provision} />
      </MockedProvider>
    );
  }
  it('Handles an LP with no buys or sells by returning empty (should never happen)', () => {
    const mock: LiquiditySubmission = {};

    const res = renderComponent(mock);
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Handles an LP with no sells by just rendering buys', () => {
    const mock: LiquiditySubmission = {
      marketId: '123',
      buys: [
        {
          offset: '1',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
        {
          offset: '2',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
      ],
    };

    const res = renderComponent(mock);
    expect(res.getByText('Price offset')).toBeInTheDocument();
    expect(res.getByText('Price reference')).toBeInTheDocument();
    expect(res.getByText('Proportion')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_BUY-50-1')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_BUY-50-2')).toBeInTheDocument();
  });

  it('Handles an LP with no buys by just rendering sells', () => {
    const mock: LiquiditySubmission = {
      marketId: '123',
      sells: [
        {
          offset: '1',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
        {
          offset: '2',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
      ],
    };

    const res = renderComponent(mock);
    expect(res.getByText('Price offset')).toBeInTheDocument();
    expect(res.getByText('Price reference')).toBeInTheDocument();
    expect(res.getByText('Proportion')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_SELL-50-1')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_SELL-50-2')).toBeInTheDocument();
  });

  it('Handles an LP with sells by just rendering buys', () => {
    const mock: LiquiditySubmission = {
      marketId: '123',
      buys: [
        {
          offset: '1',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
        {
          offset: '2',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
      ],
    };

    const res = renderComponent(mock);
    expect(res.getByText('Price offset')).toBeInTheDocument();
    expect(res.getByText('Price reference')).toBeInTheDocument();
    expect(res.getByText('Proportion')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_BUY-50-1')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_BUY-50-2')).toBeInTheDocument();
  });

  it('Handles an LP with both sides', () => {
    const mock: LiquiditySubmission = {
      marketId: '123',
      buys: [
        {
          offset: '1',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
        {
          offset: '2',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
      ],
      sells: [
        {
          offset: '4',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
        {
          offset: '2',
          proportion: 50,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
      ],
    };

    const res = renderComponent(mock);
    expect(res.getByText('Price offset')).toBeInTheDocument();
    expect(res.getByText('Price reference')).toBeInTheDocument();
    expect(res.getByText('Proportion')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_BUY-50-1')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_BUY-50-2')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_SELL-50-4')).toBeInTheDocument();
    expect(res.getByTestId('SIDE_SELL-50-2')).toBeInTheDocument();
  });

  it('Normalises proportions when they do not total 100%', () => {
    const mock: LiquiditySubmission = {
      marketId: '123',
      buys: [
        {
          offset: '1',
          proportion: 25,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
        {
          offset: '2',
          proportion: 30,
          reference: PeggedReference.PEGGED_REFERENCE_MID,
        },
      ],
    };

    const res = renderComponent(mock);
    expect(res.getByText('45% (normalised from: 25%)')).toBeInTheDocument();
    expect(res.getByText('55% (normalised from: 30%)')).toBeInTheDocument();
  });
});
