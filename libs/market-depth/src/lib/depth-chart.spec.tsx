import { DepthChartContainer } from './depth-chart';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

describe('DepthChart', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockedProvider>
        <DepthChartContainer marketId={'market-id'} />
      </MockedProvider>
    );
    // 6006-DEPC-001
    expect(baseElement).toBeTruthy();
  });
});
