import { render } from '@testing-library/react';

import { DepthChart } from './depth-chart';

const data = {
  buy: [
    { price: 132.79743, volume: 339 },
    { price: 132.79742, volume: 713 },
  ],
  sell: [
    { price: 132.79744, volume: 847 },
    { price: 132.79745, volume: 2412 },
  ],
};

describe('DepthChart', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DepthChart data={data} />);
    expect(baseElement).toBeTruthy();
  });
});
