import { render } from '@testing-library/react';
import { ProposeNetworkParameter } from './propose-network-parameter';

describe('ProposeNetworkParameter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProposeNetworkParameter />);
    expect(baseElement).toBeTruthy();
  });
});
