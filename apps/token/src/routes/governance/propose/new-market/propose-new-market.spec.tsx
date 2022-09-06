import { render } from '@testing-library/react';
import { ProposeNewMarket } from './propose-new-market';

describe('ProposeNewMarket', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProposeNewMarket />);
    expect(baseElement).toBeTruthy();
  });
});
