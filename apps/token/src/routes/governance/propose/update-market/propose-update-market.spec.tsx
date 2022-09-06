import { render } from '@testing-library/react';
import { ProposeUpdateMarket } from './propose-update-market';

describe('ProposeUpdateMarket', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProposeUpdateMarket />);
    expect(baseElement).toBeTruthy();
  });
});
