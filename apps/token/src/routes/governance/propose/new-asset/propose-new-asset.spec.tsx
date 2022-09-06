import { render } from '@testing-library/react';
import { ProposeNewAsset } from './propose-new-asset';

describe('ProposeNewAsset', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProposeNewAsset />);
    expect(baseElement).toBeTruthy();
  });
});
